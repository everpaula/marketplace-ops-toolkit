"""
BIN Monitoring Detection — Reference Implementation
====================================================

Standalone Python reference of the detection logic from the interactive
simulator (bin-monitor.html). Use this as a starting point for adapting
the methodology to your own data pipeline (BigQuery, Snowflake, Postgres,
streaming systems, etc.).

The detection rule is conjunctive across three independent signals:

    ALERT IF
        (3-day volume velocity vs 7-day baseline > velocity_threshold_pct)
        AND
        (3-day total volume > volume_floor)
        AND
        (3-day new-user count > new_user_threshold)

Why all three? Each signal alone is too noisy:
    - Volume velocity alone triggers on Black Friday and seasonal peaks
    - New-user count alone triggers on marketing campaigns
    - Volume floor alone is just a static threshold, no signal
The intersection is where actual attack patterns separate from legitimate
traffic.

Two of three crossing the threshold = WATCH (track daily, no ops response).
All three crossing = ALERT (pull human investigator into the BIN).

Synthetic dataset included at the bottom for offline testing. Replace
`load_sample_data()` with your own data loader in production.

License: MIT
Author: Everton Paula
Source: https://github.com/everpaula/marketplace-ops-toolkit
"""

from dataclasses import dataclass
from typing import List, Literal
import datetime as dt


# -----------------------------------------------------------------------------
# Data model
# -----------------------------------------------------------------------------

@dataclass
class DailyRecord:
    """One day of activity for a single BIN."""
    bin_code: str
    date: dt.date
    volume_usd: float        # total $ volume that day
    new_users: int           # distinct new card accounts that day
    cbk_rate_pct: float      # chargeback rate observed (lagging, used for context)


@dataclass
class BINAggregate:
    """7-day rollup for one BIN with derived signals."""
    bin_code: str
    last_3d_volume: float
    velocity_pct: float      # % change vs equivalent 3d window from prior 4 days
    last_3d_new_users: int
    last_3d_cbk_avg: float
    status: Literal["safe", "watch", "alert"]
    signal_velocity: bool
    signal_volume_floor: bool
    signal_new_users: bool


@dataclass
class DetectionThresholds:
    velocity_pct: float = 30.0       # 3-day volume velocity, % above baseline
    volume_floor: float = 10_000.0   # 3-day volume must exceed this, USD
    new_user_count: int = 50         # 3-day new users must exceed this


# -----------------------------------------------------------------------------
# Core detection logic
# -----------------------------------------------------------------------------

def aggregate_bin(records: List[DailyRecord], thresholds: DetectionThresholds) -> BINAggregate:
    """
    Compute 7-day rollup for a single BIN and classify status.

    Expects exactly 7 sequential daily records, ordered oldest -> newest.
    Window: days 0-3 are baseline (4 days), days 4-6 are observation (3 days).
    Baseline is normalized to a 3-day equivalent for fair velocity comparison.
    """
    if len(records) != 7:
        raise ValueError(f"Expected 7 daily records, got {len(records)}")

    baseline_4d = records[:4]
    last_3d = records[4:]

    baseline_3d_equivalent = sum(r.volume_usd for r in baseline_4d) * (3 / 4)
    last_3d_volume = sum(r.volume_usd for r in last_3d)
    last_3d_users = sum(r.new_users for r in last_3d)
    last_3d_cbk_avg = sum(r.cbk_rate_pct for r in last_3d) / 3

    velocity_pct = (
        ((last_3d_volume - baseline_3d_equivalent) / baseline_3d_equivalent) * 100
        if baseline_3d_equivalent > 0
        else 0.0
    )

    signal_velocity = velocity_pct > thresholds.velocity_pct
    signal_volume_floor = last_3d_volume > thresholds.volume_floor
    signal_new_users = last_3d_users > thresholds.new_user_count

    # Status logic (velocity is the change-detection signal — gates the rest):
    #   ALERT: all 3 signals
    #   WATCH: velocity elevated AND (volume floor OR new users) — early stage
    #   SAFE: otherwise (including stable large BINs with no velocity change)
    if signal_velocity and signal_volume_floor and signal_new_users:
        status = "alert"
    elif signal_velocity and (signal_volume_floor or signal_new_users):
        status = "watch"
    else:
        status = "safe"

    return BINAggregate(
        bin_code=records[0].bin_code,
        last_3d_volume=last_3d_volume,
        velocity_pct=velocity_pct,
        last_3d_new_users=last_3d_users,
        last_3d_cbk_avg=last_3d_cbk_avg,
        status=status,
        signal_velocity=signal_velocity,
        signal_volume_floor=signal_volume_floor,
        signal_new_users=signal_new_users,
    )


def run_detection(
    all_records: List[DailyRecord],
    thresholds: DetectionThresholds,
) -> List[BINAggregate]:
    """
    Group records by BIN, aggregate each, return sorted by status priority
    (alerts first, then watch, then safe; within each by velocity descending).
    """
    by_bin = {}
    for rec in all_records:
        by_bin.setdefault(rec.bin_code, []).append(rec)

    aggregates = []
    for bin_code, records in by_bin.items():
        records.sort(key=lambda r: r.date)
        aggregates.append(aggregate_bin(records, thresholds))

    status_order = {"alert": 0, "watch": 1, "safe": 2}
    aggregates.sort(key=lambda a: (status_order[a.status], -a.velocity_pct))
    return aggregates


# -----------------------------------------------------------------------------
# Output formatting
# -----------------------------------------------------------------------------

def print_report(aggregates: List[BINAggregate], thresholds: DetectionThresholds) -> None:
    """Pretty-print results to stdout. In production, replace with your alerting layer."""
    print()
    print("=" * 80)
    print(f"BIN MONITORING REPORT — {dt.date.today().isoformat()}")
    print(f"Thresholds: velocity > {thresholds.velocity_pct}% AND "
          f"volume > ${thresholds.volume_floor:,.0f} AND "
          f"new users > {thresholds.new_user_count}")
    print("=" * 80)

    counts = {"alert": 0, "watch": 0, "safe": 0}
    for a in aggregates:
        counts[a.status] += 1

    print(f"\nSummary: {counts['alert']} ALERT · {counts['watch']} WATCH · {counts['safe']} SAFE\n")

    header = f"{'BIN':<10} {'STATUS':<8} {'3D VOL':>14} {'VELOCITY':>12} {'NEW USERS':>12} {'CBK %':>8}"
    print(header)
    print("-" * len(header))

    for a in aggregates:
        velocity_str = f"{a.velocity_pct:+.0f}%"
        print(
            f"{a.bin_code:<10} "
            f"{a.status.upper():<8} "
            f"${a.last_3d_volume:>12,.0f} "
            f"{velocity_str:>12} "
            f"{a.last_3d_new_users:>12,} "
            f"{a.last_3d_cbk_avg:>7.2f}%"
        )

    # Detailed action items for alerts
    alerts = [a for a in aggregates if a.status == "alert"]
    if alerts:
        print()
        print("=" * 80)
        print("ACTIVE ALERTS — recommended actions")
        print("=" * 80)
        for a in alerts:
            print(f"\nBIN {a.bin_code}")
            print(f"  - All three signals crossed thresholds")
            print(f"  - 3-day volume ${a.last_3d_volume:,.0f} at {a.velocity_pct:+.0f}% vs baseline")
            print(f"  - {a.last_3d_new_users:,} new users in same window")
            print(f"  - CBK rate trending at {a.last_3d_cbk_avg:.2f}%")
            print(f"  - Action: tighten rules on this BIN range, rate-limit new card additions,")
            print(f"            pull sample of last-3-day transactions for review")
    print()


# -----------------------------------------------------------------------------
# Sample synthetic data (replace with your own data loader)
# -----------------------------------------------------------------------------

def load_sample_data() -> List[DailyRecord]:
    """
    Synthetic data covering 6 BINs across 7 days:
      - 411111 normal operations (no signal)
      - 467890 organic growth (velocity only)
      - 445566 marketing-driven (new users only)
      - 401288 volume spike no new users (watch — 2 signals)
      - 418329 classic attack (all 3 signals → ALERT)
      - 548751 attack pattern #2 (all 3 signals → ALERT)
    """
    today = dt.date.today()
    records = []

    # Helper: build 7 daily records given volume, new_users, cbk_rate lists
    def add_bin(bin_code: str, volumes, users, cbks):
        for i in range(7):
            date = today - dt.timedelta(days=6 - i)
            records.append(DailyRecord(
                bin_code=bin_code,
                date=date,
                volume_usd=volumes[i],
                new_users=users[i],
                cbk_rate_pct=cbks[i],
            ))

    # BIN 411111 — normal: stable volume, stable users, low CBK
    add_bin("411111",
            volumes=[12000, 11500, 12500, 11800, 12200, 12100, 12300],
            users=[45, 42, 48, 46, 50, 47, 49],
            cbks=[0.5, 0.6, 0.5, 0.5, 0.6, 0.5, 0.6])

    # BIN 467890 — organic growth: steady ramp ~7%/day, stable user/vol ratio
    add_bin("467890",
            volumes=[8000, 8500, 9100, 9800, 10500, 11200, 12000],
            users=[80, 82, 88, 95, 102, 110, 118],
            cbks=[0.5, 0.5, 0.6, 0.5, 0.5, 0.6, 0.5])

    # BIN 445566 — marketing: stable volume, big jump in new users
    add_bin("445566",
            volumes=[10000, 9800, 10100, 10200, 10000, 9900, 10100],
            users=[40, 42, 38, 45, 200, 220, 235],
            cbks=[0.7, 0.7, 0.6, 0.7, 0.8, 0.7, 0.8])

    # BIN 401288 — WATCH: volume spike (Black Friday-like) but new users stay flat
    # Velocity ON + volume ON + users OFF → not an attack, but worth tracking
    add_bin("401288",
            volumes=[5000, 4800, 5200, 5100, 12000, 13500, 14000],
            users=[18, 20, 22, 19, 12, 14, 13],
            cbks=[0.5, 0.6, 0.5, 0.6, 0.6, 0.7, 0.6])

    # BIN 418329 — ATTACK: volume + users + CBK trend all spike
    add_bin("418329",
            volumes=[4000, 4500, 3900, 4200, 11000, 13500, 16000],
            users=[35, 38, 32, 36, 180, 240, 290],
            cbks=[0.6, 0.5, 0.7, 0.6, 1.8, 2.4, 3.1])

    # BIN 548751 — ATTACK pattern 2: slower burn but still all three
    add_bin("548751",
            volumes=[6000, 6300, 6100, 6500, 9500, 11000, 13000],
            users=[55, 58, 52, 60, 130, 170, 200],
            cbks=[0.5, 0.6, 0.7, 0.6, 1.2, 1.8, 2.2])

    return records


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main():
    # Step 1: load data (replace with your data source)
    records = load_sample_data()

    # Step 2: set thresholds (tune for your traffic baseline)
    thresholds = DetectionThresholds(
        velocity_pct=30.0,
        volume_floor=10_000.0,
        new_user_count=50,
    )

    # Step 3: run detection
    aggregates = run_detection(records, thresholds)

    # Step 4: act on output (print here; in production, write to alerting layer)
    print_report(aggregates, thresholds)


if __name__ == "__main__":
    main()
