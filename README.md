# Fraud Ops Toolkit

> Practical tools for operations leaders running manual review queues — fraud, content moderation, customer service QA, anywhere humans decision flagged cases at scale.

Open-source methodologies for evaluating, scaling, and optimizing manual review operations. Drawn from years of hands-on work in fraud and marketplace operations across Latin America, sanitized and generalized so any ops leader can adapt them to their own context.

---

## Tools

### Tool #1 — Agent ROI Calculator

**[→ Open the calculator](./agent-roi.html)**

Evaluate workforce ROI in manual review operations. Helps you decide which queues to scale, which to optimize, and which need root-cause investigation before another dollar gets spent.

**What it does:**
- Calculates ROI per agent from 5 inputs (team size, daily cost, throughput, accuracy, avg savings)
- Classifies the queue into 3 tiers: Scale / Optimize / Root cause
- Decomposes ROI against industry benchmarks to surface the weakest lever
- Returns a specific recommendation tied to whichever lever is dragging
- Pre-loaded with 6 illustrative scenarios representing common ops patterns

**Why this exists:** Most teams scale manual review headcount linearly with volume, which is how ops budgets explode and quality drops at the same time. The math to evaluate workforce ROI is simple once you frame it right — what isn't simple is asking the question every quarter and using the answer to decide.

**The formula:**

```
Agent ROI = (Orders reviewed × Accuracy × Avg savings per cancellation) ÷ Daily cost
```

**The tiers:**

| ROI | Action | Reasoning |
|---|---|---|
| ≥ 1.0 | **Scale** | Each $1 in agent cost generates $1+ in savings. Add headcount, expand case mix, raise the bar on what flows to the queue. |
| 0.5 – 1.0 | **Optimize** | Marginal. Tune one lever before adding people. Usually accuracy or orders/agent. |
| < 0.5 | **Root cause** | Negative ROI. More agents amplify the loss. Investigate rule precision, tooling, training, or whether this case type belongs in a queue at all. |

---

## Use cases (beyond fraud)

The same logic applies anywhere a manual review queue exists with measurable savings per intervention:

- **Fraud operations** — agents reviewing flagged transactions
- **Content moderation** — reviewers actioning flagged user content
- **Customer service quality assurance** — supervisors auditing agent calls/tickets
- **KYC and compliance review** — analysts processing onboarding flags
- **Chargeback dispute investigation** — agents deciding fight vs accept
- **Returns and refunds verification** — agents validating high-value claims

If your team has a queue and the cost of letting bad stuff through is measurable, this tool gives you a structured way to evaluate the economics.

---

### Tool #2 — BIN Monitoring Detection

**[→ Open the dashboard](./bin-monitor.html)** · [Python reference](./bin-monitor-reference.py)

Detect BIN-level attack patterns before they hit chargeback. BIN attacks (where fraudsters generate card numbers within stolen BIN ranges and test them at scale) cause damage 30–90 days before chargebacks land. This tool catches them in real time.

**What it does:**
- Aggregates per-BIN activity across a 7-day window
- Combines three independent signals: volume velocity, volume floor, new-user clustering
- Classifies each BIN: Safe / Watch / Alert
- Drill-down view shows day-by-day timeline for any BIN
- Adjustable thresholds for tuning to your traffic baseline
- Includes a Python reference implementation for adapting to your data pipeline

**The detection rule:**

```
ALERT IF (volume velocity > X%) AND (3-day volume > floor) AND (new-user count > threshold)
```

**Status tiers:**

| Tier | Logic | Action |
|---|---|---|
| **Alert** | All three signals cross | Pull human investigator. Tighten rules on this BIN range. |
| **Watch** | Velocity elevated + one of (volume floor or new users) | Track daily, no ops response yet. |
| **Safe** | Velocity normal or only one signal | No action. Stable large BINs land here even when above floor — that's intentional. |

Why **AND** instead of OR? Volume velocity alone triggers on Black Friday. New-user count alone triggers on marketing campaigns. The intersection is where actual attacks separate from legitimate traffic.

---

## Roadmap

Other tools planned for this toolkit:

- **Tool #3 — Chargeback Dispute Investigation Template** *(markdown + decision tree)* — generalized structure for chargeback investigation flow: portal verification, identity resolution, behavior criteria, action matrix.
- **Tool #4 — Workforce Forecast Calculator** *(Jupyter notebook)* — volume forecast + complexity mix + shrinkage + ROI gating, end-to-end.

If a particular tool would be useful for your team, open an issue and I'll prioritize it.

---

## How to use

### Run locally
```bash
git clone https://github.com/everpaula/fraud-ops-toolkit
cd fraud-ops-toolkit
# Open agent-roi.html in any modern browser
```

No build step. No dependencies. Single HTML file with everything inline. Drop the file anywhere, double-click, it works offline.

### Or use the live version

**[Live demo →](https://everpaula.github.io/fraud-ops-toolkit/)**

---

## A note on the benchmarks

The decomposition bars compare your inputs against generalized industry-level averages for fraud and review operations. They are **not** a competitive benchmark — they are a sanity check.

If your orders-per-agent is 50 against a 250 benchmark, that's a signal to investigate tooling or process bottlenecks, not a verdict that your team is bad. Real benchmarks come from your own data over time. The decomposition is meant to tell you *where to look first*, not *how to score yourself*.

---

## License

MIT. Use freely. If it helps you make a better decision, that's enough.

---

## About me

I'm Everton Paula. I spent the last 12+ years building and running operations at hypergrowth marketplaces and consumer fintech in Latin America — fraud, marketplace ops, logistics, vendor management, workforce planning across multiple countries. This toolkit codifies the recurring patterns I've seen work, framed in a way any operations leader can adapt to their own environment.

Currently based in Tampa, FL, focused on Director / VP roles in operations and fraud operations at consumer fintech and marketplaces.

- LinkedIn: [linkedin.com/in/evertonpaula](https://linkedin.com/in/evertonpaula)
- GitHub: [github.com/everpaula](https://github.com/everpaula)

---

## Contributing

If you've used this tool in your own ops function and have feedback, suggestions, or want to add a tool to the toolkit, open an issue or PR. Particularly interested in:

- Real-world benchmark data from different industries (anonymized)
- Use cases I haven't thought of
- Edge cases where the ROI math breaks down
- Translations (Portuguese, Spanish would extend the audience meaningfully)
