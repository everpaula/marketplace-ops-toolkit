# Agent ROI Calculator V2: Math Documentation

> Formal math documentation for [Tool #1 Agent ROI Calculator V2](https://everpaula.github.io/marketplace-ops-toolkit/agent-roi.html). Written for operator validation.

## Origin of V2

V1 of this calculator answered one question: **is this single queue making or losing money?**

After V1 shipped publicly, [Ricardo Vieira-Gomes](https://www.linkedin.com/in/ricardo-vieira-gomes/) (Co-Founder & Executive Director at ET Armadillo, AI Transformation in Operations) raised two gaps on the launch post:

1. **False positive cost is missing.** Accuracy alone misses the cost of blocking legitimate orders. The customer LTV impact is invisible in V1.
2. **Single-queue framing is wrong.** Ops leaders run multiple queues. The right question isn't "is queue X profitable?" but "given my next marginal agent, where does it go?"

Both critiques were exactly right. V2 builds both in.

This document presents the V2 math formally, with assumptions and limitations stated explicitly, so anyone with operator instinct can verify the reasoning.

---

## V1 baseline (what V1 calculated)

### Inputs

| Symbol | Description | Unit |
|---|---|---|
| `orders` | Orders reviewed per day | count |
| `accuracy` | Catch rate on flagged transactions | % |
| `avg_savings` | Average savings per cancellation | $ |
| `team_size` | Number of agents | count |
| `daily_cost_per_agent` | Fully loaded cost per agent per day | $ |

### Formulas

```
true_positives  = orders × accuracy / 100
gross_savings   = true_positives × avg_savings
daily_cost      = team_size × daily_cost_per_agent
gross_roi       = gross_savings / daily_cost
```

### Tier classification (V1)

| Gross ROI | Tier | Operator action |
|---|---|---|
| >= 1.0 | Scale | Add headcount, expand case mix |
| 0.5 to 1.0 | Optimize | Tune one lever before scaling |
| < 0.5 | Root cause | Negative or thin; investigate the queue |

### Lever decomposition

The tool decomposes the gap vs benchmark across 4 levers:
1. Orders per agent
2. Accuracy
3. Avg savings per cancellation
4. Daily cost per agent

This tells the operator which lever is dragging hardest.

---

## V2 enhancement 1: False positive cost

### The gap V1 missed

When an agent blocks a legitimate order, two costs land:
1. **No savings captured.** The order wasn't fraud, so there's no fraud-loss-prevented to count.
2. **LTV impact.** The customer was wrongly blocked. Some never come back. Some leave a negative review that affects other customers' willingness to buy. The expected loss is approximately the customer's lifetime value.

V1 ignored both, especially the second.

### New inputs

| Symbol | Description | Unit |
|---|---|---|
| `fp_rate` | % of orders that get blocked but were legitimate | % |
| `avg_ltv` | Average customer lifetime value | $ |

### V2 formulas

```
true_positives   = orders × accuracy / 100
false_positives  = orders × fp_rate / 100
gross_savings    = true_positives × avg_savings
fp_cost          = false_positives × avg_ltv
net_savings      = gross_savings - fp_cost
daily_cost       = team_size × daily_cost_per_agent
net_roi          = net_savings / daily_cost
```

### Tier classification (V2, net basis)

| Net ROI | Tier | Operator action |
|---|---|---|
| >= 1.0 | Scale | Each $1 in agent cost generates $1+ in net savings after FP cost |
| 0.5 to 1.0 | Optimize | Marginal. Tune FP rate or accuracy before adding headcount |
| < 0.5 | Root cause | Negative or thin. Investigate FP rate, rule precision, or whether the queue belongs at all |

### Lever decomposition (V2)

V2 now decomposes across 5 levers:
1. Orders per agent
2. Accuracy
3. **False positive rate** (new)
4. Avg savings per cancellation
5. Daily cost per agent

The recommendation engine flags which lever is the bottleneck. A common V2 finding: queues that scored "Scale" in V1 flip to "Root cause" once FP cost is layered in.

### Worked example: FP-bleeding queue

A queue that looks fine in V1 but is bleeding LTV in V2:

| Input | Value |
|---|---|
| Orders | 200 / day |
| Accuracy | 18% |
| FP rate | 6% |
| Avg savings | $4.00 |
| Avg LTV | $180 |
| Team size | 8 |
| Daily cost | $30 |

V1 calculation:
```
gross_savings = 200 × 0.18 × 4.00 = $144 / day
daily_cost    = 8 × 30 = $240 / day
gross_roi     = 144 / 240 = 0.60 ("Optimize" tier)
```

V2 calculation:
```
true_positives  = 200 × 0.18 = 36
false_positives = 200 × 0.06 = 12
gross_savings   = 36 × 4.00  = $144
fp_cost         = 12 × 180   = $2,160
net_savings     = 144 - 2,160 = -$2,016
net_roi         = -2,016 / 240 = -8.4 ("Root cause" tier, deeply negative)
```

V1 said "tune one lever." V2 says "the queue is bleeding $2K per day in LTV. Stop adding agents, fix the FP rate."

---

## V2 enhancement 2: Portfolio mode

### The gap V1 missed

Ops leaders almost never run a single queue. They run:
- Transaction fraud + chargeback prep + KYC review (three queues, same team head)
- Content moderation + appeals + escalations (three queues, same Trust & Safety lead)
- Multi-vertical disputes (per category)

The V1 question "is this queue making money?" is locally optimized but globally wrong. The right operator question is:

> "Given my next marginal dollar (or next agent), where does it generate the most net savings?"

V1 has no answer. V2 portfolio mode does.

### V2 portfolio formulas

For each queue `Q` in the portfolio:

```
true_positives_Q   = orders_Q × accuracy_Q / 100
false_positives_Q  = orders_Q × fp_rate_Q / 100
gross_savings_Q    = true_positives_Q × avg_savings_Q
fp_cost_Q          = false_positives_Q × avg_ltv_Q
net_savings_Q      = gross_savings_Q - fp_cost_Q
daily_cost_Q       = team_size_Q × daily_cost_per_agent_Q
net_per_agent_Q    = net_savings_Q / team_size_Q
```

### Marginal agent recommendation

```
Sort queues by net_per_agent_Q descending.
Deploy next agent to argmax(net_per_agent_Q).
```

### Portfolio rollup

```
portfolio_total_net = Σ_Q net_savings_Q
portfolio_total_cost = Σ_Q daily_cost_Q
portfolio_net_roi   = portfolio_total_net / portfolio_total_cost
```

### Worked example: 3-queue portfolio at a fintech

| Queue | Orders | Acc | FP rate | Avg savings | Avg LTV | Agents | Cost/agent |
|---|---|---|---|---|---|---|---|
| Transaction fraud (TF) | 800 | 22% | 4% | $6 | $200 | 12 | $35 |
| Chargeback prep (CB) | 200 | 35% | 2% | $45 | $200 | 6 | $35 |
| KYC review (KYC) | 150 | 28% | 8% | $8 | $200 | 4 | $35 |

Calculations:

| Queue | Net savings | Daily cost | Net per agent |
|---|---|---|---|
| TF | (800×0.22×6) - (800×0.04×200) = 1,056 - 6,400 = **-$5,344** | $420 | **-$445** |
| CB | (200×0.35×45) - (200×0.02×200) = 3,150 - 800 = **+$2,350** | $210 | **+$391** |
| KYC | (150×0.28×8) - (150×0.08×200) = 336 - 2,400 = **-$2,064** | $140 | **-$516** |

**Marginal agent recommendation:** deploy to Chargeback prep (net per agent +$391).

**V2 insight surfaced:** Transaction fraud and KYC are both bleeding LTV from over-blocking. Adding agents to either amplifies the loss. CB is the only queue that scales positively. The portfolio framing forces the operator to confront where to NOT deploy resources.

V1 would have evaluated each queue in isolation and missed the marginal-allocation question entirely.

---

## V2 sensitivity analysis (NEW)

V2 runs sensitivity on `fp_rate` because it's the input most likely to be guessed wrong by an operator. The tool re-runs the pipeline at fp_rate × (1+delta) for delta in [-30%, -15%, 0, +15%, +30%] and shows how net_roi tier changes.

This answers: **"if my FP rate estimate is off, how wrong is my tier classification?"**

A robust queue stays in the same tier across the -30% to +30% range. A fragile queue flips tiers under +15% perturbation. Sensitivity exposes the fragility.

---

## Assumptions and limitations (stated explicitly)

### Assumption 1: customer block = expected loss of LTV

The model assumes a wrongly-blocked customer represents `1 × avg_ltv` in expected loss.

Reality is graded:
- Some customers retry, succeed, and the friction barely registers
- Some leave permanently
- Some leave negative reviews that affect other customers' willingness to buy
- Some escalate to support and recover their order

V2 collapses this distribution to the mean. Useful for back-of-envelope decisions. For production, the operator should validate against actual cohort behavior post-block.

### Assumption 2: linear marginal agent productivity

The portfolio recommendation assumes the next agent has the same productivity as the current team.

Reality: the 50th agent is less productive than the 5th. There's diminishing returns on team size due to coordination overhead, training time, and complexity creep.

V2 holds at small team scale (<50 agents per queue). Breaks at larger scales. Operators with 100+ analyst teams should use V2 as a directional input, not a literal allocation engine.

### Assumption 3: queue-specific avg_savings and avg_ltv are constant within queue

V2 lets the operator input these per queue but assumes constant within queue. Reality has a distribution. A KYC queue might have low-value retail customers AND high-value SMB customers in the same queue.

For mixed-value queues, V2 should be run separately on the customer segments where possible.

### Assumption 4: FP cost is one-shot

V2 charges `fp_rate × orders × avg_ltv` per day. This implicitly assumes a wrongly-blocked customer is gone after one block.

In practice, customers who survive a first block but get blocked twice have higher churn probability. The compounding effect isn't modeled in V2.

### Edge cases handled

| Condition | V2 behavior |
|---|---|
| `orders = 0` | All outputs are 0. No division by zero. Tool renders empty state cleanly. |
| `fp_rate >= 100%` | FP cost dominates, net_roi negative. Tier is "Root cause". This is mathematically correct but operationally implausible. |
| `avg_ltv = 0` | V2 collapses to V1 behavior. Operator can use this as a sanity check vs the original tool. |
| `team_size = 0` | Division by zero. Tool requires `team_size >= 1` in input validation. |
| All queues with negative net | Portfolio mode recommends the LEAST negative queue. Operator should read this as "stop adding agents anywhere, fix the bleed first." |

---

## Validation questions for review

For Ricardo or any operator who wants to challenge the math:

1. **Does the FP cost formulation match how you'd model LTV impact in your operating environment?** Specifically, the choice of `false_positives × avg_ltv` as the expected loss expression. Alternative formulations welcome.

2. **Is the marginal agent allocation (`argmax(net_per_agent)`) the right operator decision rule?** Or would you weight by something else (e.g., queue strategic importance, regulatory exposure, growth opportunity)?

3. **What's missing from the V2 model that you'd add in V3?** Compounding FP cost? Diminishing returns on team size? Per-vertical fp_rate distributions? Operator-level productivity variance?

4. **Are the assumption-statements honest enough?** A model is only as useful as its limitations are acknowledged. Are there silent assumptions I haven't documented?

5. **The sensitivity analysis runs only on fp_rate.** Should we sensitivity-test other inputs (accuracy, avg_savings, avg_ltv)?

---

## Live tool + scenarios

The math above is implemented in [the live calculator](https://everpaula.github.io/marketplace-ops-toolkit/agent-roi.html). Six pre-loaded scenarios validate the math under different operating conditions:

| Scenario | What it tests |
|---|---|
| High-ROI Mature Market | Healthy net ROI baseline |
| Best-in-Class Lean Team | Small team, high throughput |
| FP-Bleeding Queue | V1 said "Optimize", V2 reveals "Root cause" |
| Borderline Underperformer | Tier flips under +15% fp_rate perturbation |
| Stalled New Market | Edge case: low orders, low accuracy |
| Premium Market w/ Cost Drag | High cost per agent, marginal ROI |

Six scenarios in single-queue mode. Portfolio mode has a default 3-queue configuration that the operator can edit.

---

## Credit

V2 features and math model were prompted by [Ricardo Vieira-Gomes](https://www.linkedin.com/in/ricardo-vieira-gomes/)'s feedback on the V1 launch post. Both critiques were structural, not stylistic. They moved the tool from a single-queue ROI calculator into a portfolio-aware net-of-FP-cost decision tool. The math discipline behind V2 is on Ricardo.

---

*Last updated: 2026-05-19. Built by Everton Paula for the open-source [marketplace-ops-toolkit](https://github.com/everpaula/marketplace-ops-toolkit).*
