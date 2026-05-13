"""
Marketplace Surge Simulator — PID Control Reference Implementation
===================================================================

Standalone Python reference of the surge pricing logic from the interactive
simulator (surge-pid.html). Implements:

  1. A clean PIDController class (Proportional-Integral-Derivative)
  2. A simplified marketplace model (demand, supply baseline, surge response)
  3. Five demand scenarios (Quiet Tuesday, Friday Rush, Airport Burst,
     Storm Event, Holiday Wave)
  4. A naive threshold-based surge for comparison
  5. Reports comparing PID vs naive on MAPE (Mean Absolute Percentage Error)

The math is standard control theory (Minorsky, 1922). The application to
marketplace surge pricing is industry-standard across ride-hail, food
delivery, and on-demand platforms.

Use this as a starting point for adapting the model to your own data
pipeline. Replace the synthetic scenarios with your historical demand data
and tune Kp / Ki / Kd against your actual traffic.

License: MIT
Author: Everton Paula
Source: https://github.com/everpaula/marketplace-ops-toolkit
"""

from dataclasses import dataclass, field
from typing import Callable, List
import math


# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

TICKS = 288                         # 24h × 12 ticks/h (5-min intervals)
HOURS_PER_TICK = 24 / TICKS
SUPPLY_BASELINE_RATIO = 0.82        # Base supply runs ~82% of demand
SURGE_SUPPLY_GAIN = 0.50 * 30       # Supply uplift per 1.0 above 1.0x surge
SURGE_RESPONSE_DELAY = 3            # Ticks (15 min) for drivers to respond
SURGE_MIN = 1.0
SURGE_MAX = 2.5


# -----------------------------------------------------------------------------
# Data classes
# -----------------------------------------------------------------------------

@dataclass
class PIDGains:
    kp: float = 0.40
    ki: float = 0.008
    kd: float = 0.05


@dataclass
class Scenario:
    name: str
    description: str
    demand_fn: Callable[[int], float]
    supply_modifier: float = 1.0    # 1.0 = normal, <1 = supply scarcity


@dataclass
class SimulationResult:
    demand: List[float] = field(default_factory=list)
    supply: List[float] = field(default_factory=list)
    surge: List[float] = field(default_factory=list)
    mape: List[float] = field(default_factory=list)
    p_terms: List[float] = field(default_factory=list)
    i_terms: List[float] = field(default_factory=list)
    d_terms: List[float] = field(default_factory=list)


# -----------------------------------------------------------------------------
# PID Controller
# -----------------------------------------------------------------------------

class PIDController:
    """
    Standard PID controller with anti-windup on the integral term.

    control = Kp * error + Ki * integral(error) + Kd * derivative(error)
    """

    def __init__(self, gains: PIDGains, dt: float = HOURS_PER_TICK):
        self.gains = gains
        self.dt = dt
        self.error_integral = 0.0
        self.error_previous = 0.0
        # Track last contributions for plotting / debugging
        self.last_p = 0.0
        self.last_i = 0.0
        self.last_d = 0.0

    def step(self, error: float) -> float:
        """
        Update controller with new error measurement, return control output.

        Args:
            error: signed percentage error (positive = undersupplied,
                   negative = oversupplied)

        Returns:
            control output (will be combined with surge baseline 1.0)
        """
        # Anti-windup: clamp integral accumulation
        self.error_integral = max(-200.0, min(self.error_integral + error * self.dt, 200.0))
        derivative = (error - self.error_previous) / self.dt

        p_term = self.gains.kp * error
        i_term = self.gains.ki * self.error_integral
        d_term = self.gains.kd * derivative

        self.error_previous = error
        self.last_p = p_term
        self.last_i = i_term
        self.last_d = d_term

        return p_term + i_term + d_term


# -----------------------------------------------------------------------------
# Marketplace model
# -----------------------------------------------------------------------------

def supply_baseline(t: int, demand_fn: Callable, modifier: float) -> float:
    """
    Base supply that organically tracks demand with a 1-tick lag.
    Modifier < 1 represents supply scarcity (e.g., weather event).
    """
    prev = demand_fn(max(t - 1, 0))
    return prev * SUPPLY_BASELINE_RATIO * modifier + math.sin(t * 0.7) * 2


def supply_boost_from_surge(surge_history: List[float], t: int) -> float:
    """
    Drivers respond to surge with delay. The supply boost at time t is a
    function of the surge that was in effect SURGE_RESPONSE_DELAY ticks ago.
    """
    lookback = max(t - SURGE_RESPONSE_DELAY, 0)
    recent_surge = surge_history[lookback] if lookback < len(surge_history) else 1.0
    return max(0.0, recent_surge - 1.0) * SURGE_SUPPLY_GAIN


# -----------------------------------------------------------------------------
# Demand scenarios
# -----------------------------------------------------------------------------

def demand_quiet_tuesday(t: int) -> float:
    h = t * HOURS_PER_TICK
    lunch = 30 * math.exp(-((h - 12) / 1.5) ** 2)
    dinner = 35 * math.exp(-((h - 18.5) / 1.8) ** 2)
    morning = 10 * math.exp(-((h - 8) / 1.5) ** 2)
    return 40 + lunch + dinner + morning + math.sin(t * 0.4) * 3


def demand_friday_rush(t: int) -> float:
    h = t * HOURS_PER_TICK
    evening = 95 * math.exp(-((h - 20) / 2.5) ** 2)
    lunch = 20 * math.exp(-((h - 12.5) / 1.3) ** 2)
    return 35 + lunch + evening + math.sin(t * 0.3) * 3


def demand_airport_burst(t: int) -> float:
    h = t * HOURS_PER_TICK
    burst = 110 * math.exp(-((h - 21) / 0.6) ** 2)
    baseline = 35 + 12 * math.exp(-((h - 17) / 4) ** 2)
    return baseline + burst + math.sin(t * 0.5) * 2


def demand_storm_event(t: int) -> float:
    h = t * HOURS_PER_TICK
    storm = 70 * math.exp(-((h - 18) / 1.8) ** 2) if 16 <= h <= 20 else 0
    morning = 15 * math.exp(-((h - 8) / 2) ** 2)
    return 40 + morning + storm + math.sin(t * 0.3) * 2


def demand_holiday_wave(t: int) -> float:
    h = t * HOURS_PER_TICK
    if h < 9 or h > 23:
        return 30 + math.sin(t * 0.4) * 3
    wave = 65 * math.exp(-((h - 16) / 6) ** 2)
    return 35 + wave + math.sin(t * 0.5) * 4


SCENARIOS = [
    Scenario("Quiet Tuesday",  "Mild lunch and dinner peaks",       demand_quiet_tuesday,  1.00),
    Scenario("Friday Rush",    "Big evening spike 6-10pm",          demand_friday_rush,    1.00),
    Scenario("Airport Burst",  "Sharp 9pm flight wave",             demand_airport_burst,  1.00),
    Scenario("Storm Event",    "Demand spike + supply drop 4-8pm",  demand_storm_event,    0.55),
    Scenario("Holiday Wave",   "Sustained high demand 11am-9pm",    demand_holiday_wave,   1.00),
]


# -----------------------------------------------------------------------------
# Simulation engines
# -----------------------------------------------------------------------------

def simulate_with_pid(scenario: Scenario, gains: PIDGains) -> SimulationResult:
    """Run 24-hour simulation with PID-controlled surge pricing."""
    pid = PIDController(gains)
    result = SimulationResult()
    surge_history: List[float] = []

    for t in range(TICKS):
        d = max(scenario.demand_fn(t), 1.0)
        s_base = supply_baseline(t, scenario.demand_fn, scenario.supply_modifier)
        s_boost = supply_boost_from_surge(surge_history, t)
        s = max(s_base + s_boost, 1.0)
        error_pct = ((d - s) / d) * 100        # MAPE-style signed error
        mape_val = abs(error_pct)

        control = pid.step(error_pct)
        surge_raw = 1.0 + control / 100
        surge_clamped = max(SURGE_MIN, min(surge_raw, SURGE_MAX))

        surge_history.append(surge_clamped)
        result.demand.append(d)
        result.supply.append(s)
        result.surge.append(surge_clamped)
        result.mape.append(mape_val)
        result.p_terms.append(pid.last_p)
        result.i_terms.append(pid.last_i)
        result.d_terms.append(pid.last_d)

    return result


def simulate_naive(scenario: Scenario, threshold_pct: float = 30.0,
                   surge_level: float = 1.5) -> SimulationResult:
    """
    Naive threshold rule: surge = surge_level if MAPE > threshold_pct, else 1.0.
    No memory. No anticipation. Just on/off. Threshold is set high (30%) to
    represent a conservatively-tuned production rule.
    """
    result = SimulationResult()
    surge_history: List[float] = []

    for t in range(TICKS):
        d = max(scenario.demand_fn(t), 1.0)
        s_base = supply_baseline(t, scenario.demand_fn, scenario.supply_modifier)
        s_boost = supply_boost_from_surge(surge_history, t)
        s = max(s_base + s_boost, 1.0)
        error_pct = ((d - s) / d) * 100
        mape_val = abs(error_pct)
        naive_surge = surge_level if mape_val > threshold_pct else 1.0

        surge_history.append(naive_surge)
        result.demand.append(d)
        result.supply.append(s)
        result.surge.append(naive_surge)
        result.mape.append(mape_val)

    return result


# -----------------------------------------------------------------------------
# Reporting
# -----------------------------------------------------------------------------

def summarize(result: SimulationResult, label: str) -> dict:
    avg_mape = sum(result.mape) / len(result.mape)
    peak_mape = max(result.mape)
    peak_surge = max(result.surge)
    alert_hours = sum(1 for m in result.mape if m > 20) * HOURS_PER_TICK
    return {
        "label": label,
        "avg_mape": avg_mape,
        "peak_mape": peak_mape,
        "peak_surge": peak_surge,
        "alert_hours": alert_hours,
    }


def print_comparison(pid_result: SimulationResult, naive_result: SimulationResult,
                     scenario: Scenario, gains: PIDGains) -> None:
    pid_summary = summarize(pid_result, "PID")
    naive_summary = summarize(naive_result, "NAIVE")

    print()
    print("=" * 78)
    print(f"SCENARIO: {scenario.name} — {scenario.description}")
    print(f"PID gains: Kp={gains.kp:.2f}  Ki={gains.ki:.2f}  Kd={gains.kd:.2f}")
    print("=" * 78)

    header = f"{'CONTROLLER':<12} {'AVG MAPE':>12} {'PEAK MAPE':>12} {'PEAK SURGE':>14} {'HOURS IN ALERT':>18}"
    print(header)
    print("-" * len(header))
    for s in (naive_summary, pid_summary):
        print(
            f"{s['label']:<12} "
            f"{s['avg_mape']:>11.2f}% "
            f"{s['peak_mape']:>11.2f}% "
            f"{s['peak_surge']:>13.2f}x "
            f"{s['alert_hours']:>16.1f}h"
        )

    improvement = ((naive_summary['avg_mape'] - pid_summary['avg_mape']) /
                   naive_summary['avg_mape'] * 100) if naive_summary['avg_mape'] > 0 else 0
    print()
    if improvement > 0:
        print(f"PID improves average MAPE by {improvement:.1f}% over the naive threshold rule.")
    else:
        print(f"PID is {abs(improvement):.1f}% worse than naive on this scenario — gains may need tuning.")


# -----------------------------------------------------------------------------
# Main: run all scenarios with default PID tuning
# -----------------------------------------------------------------------------

def main():
    gains = PIDGains(kp=0.40, ki=0.008, kd=0.05)

    print()
    print("MARKETPLACE SURGE SIMULATOR — REFERENCE IMPLEMENTATION")
    print("Running all 5 scenarios with PID tuning Kp/Ki/Kd =",
          f"{gains.kp}/{gains.ki}/{gains.kd}")
    print()

    for scenario in SCENARIOS:
        pid_result = simulate_with_pid(scenario, gains)
        naive_result = simulate_naive(scenario)
        print_comparison(pid_result, naive_result, scenario, gains)

    print()
    print("=" * 78)
    print("To adapt this to your own data:")
    print("  1. Replace the demand_fn callables with your historical demand data")
    print("  2. Replace supply_baseline with your real-time supply data feed")
    print("  3. Tune Kp / Ki / Kd against your actual traffic, starting from defaults")
    print("  4. Adjust SURGE_RESPONSE_DELAY based on observed driver response time")
    print("  5. Cap SURGE_MAX based on regulatory and brand constraints in your markets")
    print("=" * 78)
    print()


if __name__ == "__main__":
    main()
