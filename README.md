# Fraud Ops Toolkit

> Practical tools for operations leaders running manual review queues — fraud, content moderation, customer service QA, anywhere humans decision flagged cases at scale.

Open-sourced from methodologies I built and ran while leading Fraud Prevention at Shopee Brazil (2020–2022). Sanitized, generalized, and rebuilt as standalone tools any ops leader can use without buying a SaaS platform.

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
- Pre-loaded with 6 sanitized scenarios from real multi-country fraud ops

**Why this exists:** I ran this methodology across 340 agents in 11 countries at Shopee. Every quarter the same question came up — *which markets do we scale, and which are losing us money?* The math is simple once you frame it right. The mistake most teams make is scaling headcount linearly with volume, which is how fraud ops budgets explode and quality drops at the same time.

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

- **Fraud operations** (original use case) — agents reviewing flagged transactions
- **Content moderation** — reviewers actioning flagged user content
- **Customer service quality assurance** — supervisors auditing agent calls/tickets
- **KYC and compliance review** — analysts processing onboarding flags
- **Chargeback dispute investigation** — agents deciding fight vs accept
- **Returns and refunds verification** — agents validating high-value claims

If your team has a queue and the cost of letting bad stuff through is measurable, this tool gives you a structured way to evaluate the economics.

---

## Roadmap

Other tools planned for this toolkit:

- **Tool #2 — BIN Monitoring Detection** *(Python notebook)* — open-source the BIN-attack early detection logic I built at Shopee BR after the BIN 651653 attack cost us 300K BRL in one week.
- **Tool #3 — Chargeback Dispute SOP Template** *(markdown + decision tree)* — sanitized version of the 8-section BR Chargeback SOP I authored at Shopee.
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

The decomposition bars compare your inputs against rough industry averages from real fraud-ops data. They are **not** a competitive benchmark — they are a sanity check.

If your orders-per-agent is 50 against a 250 benchmark, that's a signal to investigate tooling or process bottlenecks, not a verdict that your team is bad. Real benchmarks come from your own data over time. The decomposition is meant to tell you *where to look first*, not *how to score yourself*.

---

## License

MIT. Use freely. If it helps you make a better decision, that's enough.

---

## About me

I'm Everton Paula. I spent the last 12+ years building and running operations at hypergrowth marketplaces and consumer fintech across LATAM — Shopee, Rappi, inDrive. Most relevant to this toolkit: two years running Fraud Prevention at Shopee Brazil, hire one in the function, scaled the team to seven specialists, cut chargebacks 60% on roughly 1.5M daily transactions.

I'm currently based in Tampa, FL, and looking for Director / VP roles in fraud operations or operations leadership at US consumer fintech and marketplaces.

- LinkedIn: [linkedin.com/in/evertonpaula](https://linkedin.com/in/evertonpaula)
- GitHub: [github.com/everpaula](https://github.com/everpaula)

---

## Contributing

If you've used this tool in your own ops function and have feedback, suggestions, or want to add a tool to the toolkit, open an issue or PR. Particularly interested in:

- Real-world benchmark data from different industries (anonymized)
- Use cases I haven't thought of
- Edge cases where the ROI math breaks down
- Translations (Portuguese, Spanish would extend the audience meaningfully)
