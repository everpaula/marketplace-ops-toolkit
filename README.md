# Marketplace Ops Toolkit

> Practical tools for operations leaders making decisions at scale. Fraud, supply chain, workforce planning, vendor management, driver performance, dispute investigation. Anywhere an ops decision deserves the actual numbers, not intuition.

Open-source methodologies and simulators for evaluating, scaling, and tuning operational decisions. Built from years of hands-on multi-country marketplace and consumer fintech operations, sanitized and generalized so any ops leader can adapt them to their own context.

---

## Tools

### Tool #1 — Agent ROI Calculator (V2)

**[→ Open the calculator](./agent-roi.html)**

![Agent ROI Calculator — Single queue mode](./images/agent-roi-single.png)
![Agent ROI Calculator — Portfolio mode](./images/agent-roi-portfolio.png)

Evaluate workforce ROI in manual review operations. Helps you decide which queues to scale, which to optimize, and which need root-cause investigation before another dollar gets spent.

**V2 adds two things V1 missed:**

1. **False positive cost** — When an agent blocks a legitimate order, you don't just lose the savings, you lose the LTV of that customer. V2 takes FP rate + avg customer LTV as inputs and subtracts that cost from gross savings to give you net ROI.
2. **Portfolio mode** — Most ops leaders don't run one queue, they run multiple. V2 portfolio mode lets you model up to 3 queues side by side and surfaces which queue gets the next marginal agent. Real decision isn't "is queue X profitable?" but "where do I put the next dollar?"

Both features were raised as missing in V1 by [Ricardo Vieira-Gomes](https://www.linkedin.com/in/ricardo-vieira-gomes/) (Co-Founder & Executive Director, ET Armadillo · AI Transformation in Operations) on the launch post. Both critiques were right and are now built in.

**What it does:**
- 7 inputs: team size, daily cost, throughput, accuracy, avg savings, **FP rate (V2)**, **avg customer LTV (V2)**
- Classifies the queue into 3 tiers: Scale / Optimize / Root cause (based on NET ROI after FP cost)
- Decomposes ROI against industry benchmarks across 5 levers (V1 had 4)
- Returns specific recommendation tied to whichever lever is dragging
- Pre-loaded with 6 illustrative scenarios including a "FP-bleeding queue" that flips ROI negative
- **Portfolio mode** lets you compare 3 queues + see marginal allocation recommendation

**Real-world impact** *(illustrative scenarios drawn from operator practice, numbers are realistic order-of-magnitude, not measurements from a specific deployment)*

**Case 1: Fraud review queue running 3 months in the red**
- *Setup:* An 8-agent manual review team at a global marketplace screens 200 flagged orders per day at $30 average order value.
- *Problem:* Net ROI looked positive on paper at 18% catch rate, but false-positive cost was quietly burning roughly $1,400 per day in lost legitimate customer LTV.
- *Tool surfaced:* Portfolio mode flagged FP cost at $4.50 per agent-day against gross savings of $3.20, recommending root-cause work on the rule set rather than more headcount.
- *Outcome:* Decision rules rewritten, FP rate dropped from 6% to 2.5%, net ROI flipped to +0.8x, around $280K saved annually vs the "add 2 more agents" plan that was already approved.

**Case 2: VP picking between three queues for one new hire budget**
- *Setup:* A US consumer fintech VP of Ops has budget for exactly one new analyst across three queues (account takeover, disputes, KYC review).
- *Problem:* Each queue manager was lobbying with their own spreadsheet, decisions were political, and the wrong placement would waste roughly $95K fully loaded for the year.
- *Tool surfaced:* Portfolio comparison ranked marginal ROI per queue: KYC at 2.1x, ATO at 1.4x, disputes at 0.6x because dispute auto-decision coverage was already high.
- *Outcome:* Hire went to KYC, the dispute queue got a process review instead, combined coverage gain came out at +$140K vs the politically favored allocation.

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

![BIN Monitoring Detection dashboard](./images/bin-monitor.png)

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

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: Card testing wave 47 days before chargebacks would land**
- *Setup:* Risk analyst at a digital goods platform watching nightly BIN reports across roughly 1,800 active issuer ranges.
- *Problem:* Standard transaction monitoring missed slow-burn card testing because no single transaction tripped scoring; team usually only saw the damage after $60K-$120K in chargebacks posted.
- *Tool surfaced:* Two prepaid BINs crossed all three thresholds simultaneously (velocity +210% vs baseline, $14K volume, 78 new users in 3 days), pattern matched the slow-burn attack signature.
- *Outcome:* Both BINs rate-limited for new users within 6 hours, projected chargeback exposure dropped from an estimated $90K to about $11K, roughly $79K saved on a single alert.

**Case 2: Pre-Black Friday tuning to avoid alert fatigue**
- *Setup:* Fraud lead at a regional ecommerce site preparing for a holiday week with expected 3x-4x organic volume across all BINs.
- *Problem:* Existing single-signal alerts (just velocity) would fire on 40+ BINs during peak, drowning the on-call analyst and effectively disabling detection.
- *Tool surfaced:* Combining velocity AND volume floor AND new-user clustering kept the alert list to 3 real candidates during simulated peak.
- *Outcome:* Peak week ran with 4 true-positive escalations and zero alert fatigue, vs the prior year where 2 real attacks were missed under noise costing about $45K.

---

### Tool #3 — Marketplace Surge Simulator (PID Control) — V2

**[→ Open the simulator](./surge-pid.html)** · [Python reference](./surge-pid-reference.py)

![Surge Simulator — City Aggregate mode (V1)](./images/surge-city-aggregate.png)
![Surge Simulator — Polygon Map mode (V2)](./images/surge-polygon-map.png)
![Surge Simulator — 24-hour polygon-level animation](./images/surge-polygon-demo.gif)

Interactive simulator of surge pricing using **PID control theory**, with two modes:

**City Aggregate mode (V1):** single PID over a city-wide demand/supply curve. Watch the controller respond to 5 realistic scenarios, tune Kp/Ki/Kd, compare against a naive threshold-based surge rule.

**Polygon Map mode (V2 — new):** nine independent PID controllers running on a 3×3 city map. Each zone (Airport, Tech District, Stadium, Residential N/E, Downtown, Industrial, Shopping Mall, Suburbs) has its own demand profile and its own surge multiplier. The visualization shows how the same time of day looks wildly different across geography — Airport at 9pm hitting 2.5x surge while Suburbs sits at 1.0x, both at the same minute. A time scrubber lets you watch the heatmap evolve across 24 hours. The comparison panel quantifies how polygon-level PID outperforms a single city-level PID applied uniformly across all zones.

**Why polygon-level matters:** production surge systems at ride-hail and delivery platforms (Uber's H3 hex framework, Lyft zones, DoorDash dispatch cells) operate at the polygon/cell level for one reason — city averages hide local imbalance. A 1.0x city surge can be the average of Downtown at 2.5x and Suburbs at 0.8x. Optimize the average, and Downtown riders wait too long while Suburb drivers sit idle. Optimize each zone, and both problems disappear.

**What it does:**
- Simulates 24 hours of marketplace activity (5-minute ticks) for 5 scenarios
- Implements a full PID controller (Proportional, Integral, Derivative terms)
- Models supply response with realistic delay (15 minutes for drivers to come online)
- Lets you tune Kp, Ki, Kd via sliders and watch 4 charts update in real time
- Compares PID vs naive threshold rule on average MAPE, peak MAPE, alert hours
- Includes a 200-line Python reference implementation for production adaptation

**The five scenarios:**

| Scenario | Pattern | What it tests |
|---|---|---|
| Quiet Tuesday | Mild lunch + dinner peaks | Steady-state controller |
| Friday Rush | Big evening spike 6-10pm | Anticipation of predictable surge |
| Airport Burst | Sharp 9pm flight wave | Spike response (D term shines) |
| Storm Event | Demand spike + supply drop | Hardest case — both controllers struggle |
| Holiday Wave | Sustained high demand 11am-9pm | Long-horizon balance |

**Why PID over a threshold rule?**

A naive rule (`surge = 1.5x if MAPE > 30%, else 1.0x`) is on/off — surge flips chaotically as the error crosses the threshold. Drivers see unpredictable prices, riders see surprises, ops teams see noise. PID gives **smooth, proportional response** that builds up gradually, anticipates change, and decays cleanly when imbalance resolves.

With the loaded defaults (Kp=0.4, Ki=0.008, Kd=0.05), PID outperforms the naive baseline on average MAPE in 4 of the 5 scenarios. Storm Event is the genuine hard case — combined demand spike with supply scarcity defeats both approaches.

The math is from control theory (Minorsky, 1922). The application to marketplace surge pricing is industry-standard across ride-hail, food delivery, and on-demand platforms.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: City-average surge masking 4 starving polygons**
- *Setup:* Pricing manager at a ride-hailing operation in a Tier-2 city running a single citywide surge multiplier on weekday evening peaks.
- *Problem:* Citywide multiplier averaged 1.4x and looked healthy, but 4 outer polygons were stuck at 18-22 minute ETAs while downtown sat at 4 minutes, causing roughly 8% trip cancellation in those zones.
- *Tool surfaced:* V2 polygon view showed the 3x3 zone grid with two cells in deep undersupply at effective 1.0x while downtown was overshooting at 1.7x.
- *Outcome:* Zone-level Kp raised on outer cells, cancellation in those polygons dropped from 8% to 3.2%, recovered an estimated $9K per weekday peak in completed trips.

**Case 2: Surge oscillation eroding driver trust**
- *Setup:* Marketplace ops at a delivery platform running surge updates every 5 minutes, pricing swinging 1.0x to 1.8x to 1.1x within a single 30 minute window.
- *Problem:* Driver complaints spiked about "phantom surge" and weekly driver churn climbed roughly 4 points, costing the team about $22K monthly in re-acquisition.
- *Tool surfaced:* Simulator showed integral gain too high and derivative too low, classic PID overshoot; smoother coefficients held supply-demand inside the deadband 78% of the time vs 41% in current settings.
- *Outcome:* New PID coefficients rolled out region by region, driver churn dropped back 3.5 points within 2 cycles, savings around $19K monthly on retention alone.

---

### Tool #4 — Chargeback Dispute Investigation Template

**[→ Open the wizard](./chargeback-sop.html)**

![Chargeback Dispute Wizard — Question step](./images/chargeback-wizard.png)
![Chargeback Dispute Wizard — Recommendation with evidence checklist](./images/chargeback-recommendation.png)

Walk through a chargeback like a senior fraud analyst. Interactive decision tree wizard guides you from reason code to action recommendation in 4-6 questions, with the specific evidence package you need to fight (or accept).

**Three components:**
- **Decision tree wizard** — 4 main paths (fraud/unauthorized, non-delivery, quality dispute, processing error) with 15+ terminal recommendations, each with evidence checklist
- **8-section SOP structure** — generalized chargeback investigation SOP covering triage, identity verification, geo pattern, external lookup, identity matching, behavioral risk, action matrix, documentation
- **Sample cases** — 4 pre-loaded scenarios (first-party fraud, real card theft, non-delivery, quality dispute) you can step through to see how the wizard handles them

The wizard maps to industry-standard chargeback investigation flow, generalized so any team can adapt regardless of payment processor or geographic jurisdiction. Reg E (US), PSD2 (EU), local equivalents — the regulatory framing layers on top of the investigation flow.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: New chargeback analysts making inconsistent dispute calls**
- *Setup:* A 4-person disputes team at a subscription SaaS handles roughly 180 chargebacks per month with one senior and three juniors hired in the last 90 days.
- *Problem:* Junior analysts were accepting disputes that were defensible and fighting ones that were lost causes, win rate sat at 22% vs benchmark 38%, costing about $15K monthly in avoidable losses.
- *Tool surfaced:* Wizard standardized the 4-6 question flow (cardholder contact, delivery proof, prior dispute history, friendly fraud indicators) and dispositioned each case with reasoning.
- *Outcome:* Win rate climbed to 41% within two months, recovered roughly $11K monthly, senior analyst time on QA dropped from 15 hours per week to 4.

**Case 2: Onboarding offshore vendor team in 2 weeks**
- *Setup:* Ops manager at a marketplace stood up a vendor team in a different time zone to handle chargeback overflow, with no internal trainer available full time.
- *Problem:* Vendor team was expected to take 6-8 weeks to reach quality parity, meaning roughly $40K in additional losses during ramp.
- *Tool surfaced:* Wizard's 8-section SOP plus the decision tree functioned as the training spine, every case run through the same logic regardless of analyst tenure.
- *Outcome:* Vendor team hit quality parity in 18 days instead of 6 weeks, saved roughly $28K in ramp losses, post-hoc QA showed consistency scores within 4 points of in-house team.

---

### Tool #5 — Workforce Forecast Calculator

**[→ Open the calculator](./workforce-forecast.html)**

![Workforce Forecast Calculator with multi-case-type breakdown and vendor split comparison](./images/workforce-forecast.png)

How many agents do you actually need? Multi-case-type forecast based on **volume × complexity × productivity × shrinkage**. The math behind quarterly capacity planning, made explicit.

**The formula:**
```
total_minutes  = Σ (volume × handle_time)
productive_min = productive_hours × 60
base_FTE       = total_minutes / productive_min
after_shrink   = base_FTE / (1 − shrinkage)
after_peak     = after_shrink × peak_ratio
final_HC       = after_peak × (1 + service_level_buffer)
```

**What it does:**
- Multi-row case type input (different case types have different handle times)
- 6 operating parameter inputs (productive hours, shrinkage, peak ratio, SL buffer, in-house cost, vendor cost)
- Live recompute of required headcount across the full forecast chain
- Per-case-type breakdown showing FTE share by complexity
- 100% in-house vs hybrid vs 100% vendor cost comparison with annual figures and recommended split
- 4 pre-loaded scenario presets: Steady-state, Hypergrowth ramp, Peak event (Black Friday-style), Lean startup

Maps directly to the quarterly capacity planning conversations that happen in every ops function. Hand this to the team and the "how many agents do we hire?" debate becomes a math problem instead of a political one.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: Finance asking for next year headcount in 5 days**
- *Setup:* Head of Ops at a regional fintech needs to justify a 2026 plan covering 4 case types (KYC, fraud review, ATO, disputes) with different complexity and volume curves.
- *Problem:* Existing spreadsheet model was 14 tabs of stale assumptions, last touched 8 months ago, produced a single headcount number with no scenario range, putting roughly $1.8M in payroll asks at risk of being slashed.
- *Tool surfaced:* Multi-case-type calculator separated AHT and volume per type, layered shrinkage (22% real vs 15% assumed) and peak month uplift, produced in-house vs vendor split economics side by side.
- *Outcome:* Plan went in with three scenarios (lean, base, peak-ready) and finance approved base case at 31 FTE plus 8 vendor seats, vs the original ask of 38 FTE that would have been rejected.

**Case 2: 60% vendor-heavy footprint that was bleeding cost**
- *Setup:* COO at a high-growth ecommerce platform had 24 in-house and 36 vendor reviewers across two sites, locked into a per-case vendor rate set 3 years prior.
- *Problem:* Vendor cost per case had crept to roughly $4.20 vs in-house fully loaded $3.10 once productivity and shrinkage were applied honestly; the platform was spending an extra $360K per year on the worse option.
- *Tool surfaced:* Vendor split scenario showed crossover point at 45% vendor, not 60%, given current AHT and shrinkage; rebalancing recovered the spread without losing peak flexibility.
- *Outcome:* 12 cases per day shifted in-house, vendor headcount renegotiated to a smaller flex pool, net savings around $230K annualized in year one with peak coverage preserved.

---

### Tool #6: Logistics Supply Forecaster

**[→ Open the forecaster](./logistics-supply.html)**

Translate a marketplace forecast into required resources. Two personas (3PL last-mile and Fulfillment warehouse), two granularities (Daily 14-day horizon and Hourly+Zone intraday), side-by-side operational and financial output, plus sensitivity analysis at +/- 15% and +/- 30% forecast error.

**V2 update (2026-05-15)**, rebuilt on operator feedback from a former Shopee BR logistics ops lead who runs hub occupation analysis as a daily workflow:

- **Day-over-day backlog cascade.** Today's overflow is tomorrow's effective inbound. Each day's processed volume is capped at processing capacity; the remainder rolls into the next day's inbound. Sensitivity scenarios re-run the cascade, so upside cases compound non-linearly.
- **Two-layer capacity model.** Processing capacity (how much you can sort or pick+pack per day) and storage capacity (how much you can hold overnight) are independent inputs. Both can constrain.
- **Storage occupation as a primary anchor.** Third headline number next to operational and financial. Configurable alert threshold (default 80%), tiered green / yellow / red, plus a 14-day occupation trend strip chart with focusable bars and tooltips.
- **Origin mix decomposition (Persona A).** Three sliders for Line haul / Seller direct / FBS with proportional auto-rebalancing to keep the sum at 100%. Drives the defer lever's negotiable share.
- **Operational levers card.** Two side-by-side sub-panels: boost processing capacity (overtime, 1.5x unit cost) and negotiate origin defer (push Seller+FBS volume one day forward). Card highlights and surfaces a "peak above threshold" badge when baseline occupation crosses the alert.

**Why this exists:** logistics operators receive forecasts from marketplaces (Mercado Livre, Shopee, Amazon, Magalu, and others) and have to turn that into actual capacity decisions. How many couriers? How many vehicles? How many sort lines? How many pickers and packers? What is the cost if the forecast is wrong by 15%? When does today's overflow become tomorrow's crisis? Most teams answer those questions by gut feel. The math is straightforward once you frame it right.

**Two personas in one tool:**

- **3PL / last-mile:** couriers, vehicles, sortation throughput, dock capacity, first-attempt delivery, SLA penalty exposure
- **Fulfillment / warehouse:** pickers, packers, receivers, dock doors, pick zones, damage/rework volume

**Two granularities:**

- **Daily** (D+1 to D+14): per-day package forecast for weekly capacity planning
- **Hourly + Zone:** 12 two-hour buckets across 6 hubs (3PL) or single warehouse with inbound/outbound split (Fulfillment) for intraday capacity planning

**What it produces:**

- Operational panel: headcount peaks and averages, vehicle counts, sortation hours, dock utilization with tier coloring
- Financial panel: total cost over horizon, cost per package, annualized projection, cost breakdown by labor / fleet / facility / SLA penalty
- Sensitivity card: 5 rows showing total cost at -30%, -15%, base, +15%, +30% forecast error, with bar visualization and delta percent
- SLA hit probability at +15% upside (the bad case ops planners actually face)
- Two canvas charts: resource utilization across shift and cost stack waterfall

**The core formula:**

```
arrivals    = forecast × induction_rate
demand      = arrivals × handle_time / available_min_per_resource
resources   = ceil(demand / (1 - shrinkage) × (1 + peak_buffer))
cost        = Σ (resources × unit_cost)
sensitivity = cost(forecast × (1 + delta)) for delta in [-0.30, -0.15, 0, +0.15, +0.30]
```

**Pre-loaded scenarios (4):** Brazil 3PL Black Friday week, US Fulfillment Q2 steady-state, Shopee intraday surge across 6 São Paulo hubs, DTC peak ramp single-day fulfillment.

This is the math that gets argued about every quarter at operations leadership meetings, codified so the answer is the same whether you have 12 years of experience or 12 weeks.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: 3PL last-mile facing a 35% Q4 volume jump**
- *Setup:* Network planner at a regional 3PL handling 12,000 daily parcels with 140 couriers and 18 vans across 3 hubs.
- *Problem:* Standard linear model said add 50 couriers; gut said wrong because backlog from Day 1 would cascade into Day 3-4 vehicle saturation. Wrong-sizing risk was roughly $180K either way.
- *Tool surfaced:* V2 backlog cascade with 2-layer capacity showed couriers were not the bottleneck (occupation 78%); vans were (occupation 96%), recommending 8 extra vehicles and 22 couriers, not 50.
- *Outcome:* Q4 ran at 94% on-time vs 89% prior year, courier overstaffing avoided, net cost vs the linear-model plan came out about $140K lower with better service.

**Case 2: DTC fulfillment warehouse missing cutoff 3 days in 5**
- *Setup:* Ops manager at a DTC brand's contracted fulfillment site, 2 shifts, 60 pickers, 8 sorters, processing 8,000 orders per day with same-day cutoff at 2 PM.
- *Problem:* Same-day promise was failing on roughly 60% of weekdays, refund and re-ship cost about $11K per missed-cutoff day, brand was threatening to switch 3PLs.
- *Tool surfaced:* Forecaster's intraday view showed sorter capacity at 102% utilization 11 AM to 1 PM while pickers ran at 71%; the bottleneck was sortation, not pick.
- *Outcome:* 2 sorters added on a 10 AM start, cutoff miss rate dropped to 8% of days within 3 weeks, retained the brand account worth about $1.4M annually.

---

### Tool #7: Queue Operations Command Center

**[→ Open the command center](./queue-ops-center.html)**

![Queue Ops Command Center, sticky backlog health header with priority table](./images/queue-ops-center.png)

Two questions every ops leader asks at standup, fused into one tool: **are we behind on SLA right now** and **what should the agent pick next**. Splitting these across two screens forces context-switching. They share the same SLA, the same throughput, the same backlog count, so they live together here.

Tool #7 was inspired by feedback from Ricardo Vieira-Gomes (Co-Founder & Executive Director, ET Armadillo · AI Transformation in Operations) on a previous launch post. The integrated backlog-health-plus-prioritization model is his concept, refined into a single tool.

**Backlog health view (sticky header):**

- Hours to first SLA breach (reports the earlier of oldest-case-aging or new-arrivals-flooding, tags which driver is binding)
- Backlog trajectory with growth/shrink arrow and rate
- Agents needed to recover with hourly recovery cost
- Tier badge (green stable, yellow watch, red at risk) drives the header border color
- 24-hour projection chart: teal baseline, amber line layers when you add agents in the stepper, red dashed line marks the SLA threshold

**Queue prioritization view (table):**

- Priority score per case: `(w_risk × risk/100) + (w_age × age_factor) + (w_value × value_factor)` normalized 0 to 100
- Top 5 highlighted with teal left border and filled rank pill
- Tier coloring on Risk, Age, Priority columns
- Three reprioritize modes cycling through Balanced → Risk-weighted → Value-weighted, weights shift with the mode
- Click any row to see the substituted-formula breakdown in a native dialog modal
- Sortable columns with `aria-sort`, keyboard-accessible rows

**Four operator presets:**

| Preset | SLA | Throughput | Cases | Weighting |
|---|---|---|---|---|
| Fraud Operations | 4h | 30 cases/agent/hr | 18 | Balanced |
| Content Moderation | 24h | 80 cases/agent/hr | 22 | Balanced (no value) |
| Disputes Resolution | 7 days | 8 cases/agent/hr | 16 | Value-weighted |
| CS Escalations | 2h | 20 cases/agent/hr | 15 | Balanced |

**The math:**

```
effective_throughput = agents × throughput_rate × (1 − shrinkage)
net_change_rate      = arrival_rate − effective_throughput
hours_to_breach      = min(SLA − oldest_case_age, SLA − backlog / effective_throughput)
agents_needed        = ceil((backlog + arrivals × hours_remaining) / (throughput × hours_remaining × (1 − shrinkage)))
priority_score       = (w_risk × risk/100) + (w_age × age_factor) + (w_value × value_factor)
```

**What this is NOT:** not a real-time monitor (inputs static for the session), not an ML predictor (formula-based with explicit weights, the point is for the operator to see the math), not a ticketing system (recommends order, doesn't execute), not a portfolio view (single queue, use Tool #1 V2 portfolio mode for multi-queue allocation).

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: 6,000-case backlog on a Tuesday morning**
- *Setup:* Fraud ops lead walking into Monday standup finds the weekend left a 6,000-case backlog with mixed SLA risk and no clear "who works what first" answer.
- *Problem:* Status quo was analyst-by-analyst FIFO, oldest cases worked first regardless of dollar exposure, causing roughly $45K weekly in avoidable losses on high-value cases that aged past windows.
- *Tool surfaced:* Command center showed hours to SLA breach across queues, ranked cases by dollar-at-risk × time-decay, projected 9 agents needed for full recovery in 36 hours vs 14 for 18 hours.
- *Outcome:* Team prioritized 380 high-value aging cases first, dollar-weighted loss dropped 62% week over week (around $28K saved), backlog cleared in 41 hours.

**Case 2: Content moderation team facing an SLA audit**
- *Setup:* Trust and Safety manager at a UGC platform with a 12-person moderation team and contractual 24-hour SLA across 3 queue types.
- *Problem:* Audit was 10 days out and the team did not know current SLA compliance percentage by queue, manual sampling estimated somewhere between 78%-91% with $0.5M of contractual penalty exposure.
- *Tool surfaced:* Content moderation preset surfaced live SLA compliance per queue (84%, 71%, 96%) and showed appeals queue needed 3 extra reviewers for 4 days to reach 95% before audit date.
- *Outcome:* Temporary reallocation from escalations to appeals pulled appeals compliance to 97% before audit, full audit passed at 96% weighted, penalty exposure eliminated.

---

### Tool #10: Customer Feedback Cost Analyzer

**[→ Open the analyzer](./customer-feedback-cost.html)**

Most ops orgs report aggregate NPS, CSAT, or ticket volume. Almost none quantify the **dollar value of preventable customer feedback** (refunds, credits, handling cost, churn risk) coming from operational issues already mapped but not fixed upstream. This tool turns that gap into a single number the CFO can act on.

The conversation it enables: walking into the fix-it vs absorb-it meeting with the payback period and 12-month NPV already on the page. CFOs do not greenlight ops fixes from anecdote. They greenlight them from math.

**The math:**

```
monthly_leak    = volume × preventable_rate × (refund + handling + churn)     // aggregate path
                = Σ (category_volume × category_avg_cost)                      // category path overrides when populated
annual_leak     = monthly_leak × 12
payback_months  = one_time_fix ÷ (monthly_leak × reduction)
year_1_npv      = (monthly_leak × reduction × 12) − one_time_fix − maintenance
year_3_cum      = (monthly_leak × reduction × 36) − one_time_fix − (maintenance × 3)
```

**Two personas, same math, different framing:**

- **Operations Manager view** surfaces monthly leak, payback period, recovered-per-month, plus a live ticker counting dollars leaking since the page loaded. The number you bring to your weekly standup.
- **CFO / Finance view** surfaces annualized leak, 12-month NPV, 3-year cumulative savings, and the full sensitivity card at +/- 15% and +/- 30%. The numbers you bring to the budget meeting.

**Two granularities:**

- **Aggregate mode** (default): single volume, single preventable rate, single avg cost per case. Fast first-pass.
- **Category breakdown** (auto-engages when at least one row has data): issue-level math (order delays, defects, refund processing, address issues, account errors). The Pareto chart sorts categories by $ leak descending, highlights the top 3, marks anything below as rounding error until the top 3 are addressed.

**Five operator presets:**

| Preset | Volume / month | Avg case cost | Use case |
|---|---|---|---|
| Marketplace BR · Black Friday week | 25,000 | ~$44 | High volume, mid-low avg cost, high churn risk. Loads a populated category breakdown. |
| Fintech US · payments errors | 8,000 | ~$152 | Medium volume, very high avg cost. Financial errors carry weight. |
| Last-mile courier · peak season | 35,000 | ~$54 | High volume, defects + late delivery dominate. |
| DTC e-commerce · quality issues | 6,500 | ~$79 | Medium volume, repeat-purchase exposure. |
| Education / SaaS · onboarding failures | 1,200 | ~$215 | Low volume, very high avg cost. Annual contract churn is the loss. |

**Sensitivity card:** annual leak at -30%, -15%, base, +15%, +30%. Use this to defend the headline when the CFO pushes back on volume or avg-cost assumptions. If the +30% case still pays back inside 6 months, the headline holds. If the -30% case breaks the payback math, your assumptions need work before the meeting.

**Real-world impact** *(illustrative scenarios drawn from operator practice, numbers are realistic order-of-magnitude, not measurements from a specific deployment)*

**Case 1: Self-service eligibility analysis at a top-3 BR insurer**
- *Setup:* Inbound call center handling 1M+ contacts per quarter. Calls were being treated as fixed demand.
- *Problem:* Aggregate call volume was the only KPI reported up. No taxonomy meant no fix.
- *Tool surfaced:* Mapping calls by motive showed 42% were self-service eligible. The user had a question or request the IVR or app could absorb if the flow existed. Quantified preventable leak across the top 10 motives, payback period inside 4 months.
- *Outcome:* Built 3 new self-service channels (IVR menu redesign, app self-service flow, WhatsApp bot for top motives). Calls down 42% in 9 months, retention up 9 points on the affected cohort.

**Case 2: NPS taxonomy and two operating squads at a hypergrowth courier platform**
- *Setup:* Marketplace was treating NPS as a single number reported to the C-level. Trend was getting worse but the source was opaque.
- *Problem:* The number told you the leak was getting worse. It did not tell you where to fix.
- *Tool surfaced:* Categorized feedback into motive × sub-motive × root cause. The Pareto chart concentrated 60-70% of dollar leak in two categories: defect rate (damaged items, wrong items) and late delivery. The fix-it vs absorb-it math made the engineering case.
- *Outcome:* Two operating squads stood up (defect rate squad and late delivery squad) with the taxonomy as their operating system. Defect rate moved from 6% to 3%. Late delivery moved from 5.5% to 3.6% in 6 months. NPS up 11 points, per-order cost down meaningfully.

**Case 3: The CFO conversation that unlocked the engineering budget**
- *Setup:* Ops leader at a marketplace knew the upstream cause of half the support volume. Engineering was booked for two quarters. The fix was competing with 18 features in the backlog.
- *Problem:* Anecdotes lose to features. The fix needed a dollar number and a payback period.
- *Tool surfaced:* Annual leak at $1.4M, payback period 4.2 months, year-1 NPV positive by $480K. Sensitivity card showed even the -30% case still paid back inside 6 months.
- *Outcome:* Engineering slot approved at the next planning cycle. The taxonomy + the math became the standard framing for every subsequent ops fix request inside the org.

**Why this exists:** Most ops teams report aggregate NPS and CSAT to leadership. Almost none report the dollar leak from preventable feedback by category. The first version of this metric I built ran on a spreadsheet at a top-3 BR insurer in 2019. Every operations org I have built since has rebuilt it. This tool is that spreadsheet, cleaned up, with the personas and presets that took the longest to get right.

---

### Tool #11: 90-Day Operating Plan Generator

**[→ Open the generator](./operating-plan-generator.html)**

The structured one-pager every new operations leader needs. New role, day one. The hiring manager wants to know what your first 90 days look like. You can either send the generic "I'll listen, then design, then execute" answer, or you can send a one-pager with priorities mapped to phases, north star metrics, a risk register, and three concrete asks. This tool generates the second one.

The point: scaffold, not content. Your priorities and context drive what shows up. The tool gives you the shape that reads like an operating leader writing for their new boss, not a template.

**Inputs:**

- **Role title** (free text, e.g. *Director of Operations, Florida + LATAM cluster*)
- **Function focus** (operations, supply quality, quality & defect ops, growth, fraud, last-mile logistics). Shapes verbs and metric phrasing.
- **Time horizon** (30/60/90 or 60/90/180)
- **Company context** (3-5 lines on stage, vertical, current state)
- **JD priorities** (top 5, ordered)

**Transcript mining (optional):**

Paste raw meeting notes, onboarding 1:1 transcripts, JD walkthrough calls, or stakeholder kickoff sessions into the mining textarea. The tool runs client-side heuristic extraction (no AI, no API, no upload) and surfaces:

- **Candidate priorities**: top 10 sentences scored by priority keywords, action verbs, metric mentions, and length. Click any slot button (#1 through #5) to drop the candidate into a priority field.
- **Stakeholders mentioned**: named people and role titles (CEO, VP, Director, Head, etc.) detected in the text.
- **Metrics & numbers mentioned**: dollar amounts, percentages, time spans, counts. Useful to seed the north star metrics conversation.

This bridges the gap between scaffold and content. You can drop a 30-minute onboarding transcript in, get back the 10 priority candidates your new boss actually surfaced, then refine them and generate the plan.

**Output structure:**

1. **Executive summary** with what changes, what stays, principal risk
2. **Priorities mapped to phases**: each priority gets a Discover & Diagnose phase (interview, baseline, document), a Decide & Design phase (pilot, validate, commit), and a Deploy & Measure phase (ship, cadence, metric tracking)
3. **North star metrics**: 3 to 5 numeric, time-bounded, named
4. **Risk register**: 3 risks with mitigation, function-specific
5. **What I would want from you (the leader)**: 3 concrete asks specific to the function

Output formats: copy as Markdown, copy as plain text, download as `.md` file.

**Five operator presets:**

| Preset | Role | Function | Use case |
|---|---|---|---|
| Series A marketplace ops | Head of Operations | Operations | Small team, fast iteration, no playbook yet. Build the operating system. |
| Scale-up CPG ops | Director of Operations | Operations | Process maturity build. Vendor management, fulfillment, defect tracking. |
| Mature marketplace supply | Sr Manager, Supply Quality & Relationship | Supply | Cross-functional supply quality. Scorecards, tiered partner relationships. |
| Fintech fraud lead | Head of Fraud Operations | Fraud | Zero-to-one or rebuild. Detection rules, false positive balance, escalation tiers. |
| Last-mile logistics director | Director of Last-Mile Operations | Logistics | Geographic expansion, courier network, on-time delivery, defect categories. |

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: The post-panel follow-up that moved a candidate to offer**
- *Setup:* Director ops candidate at a B2B marketplace had a strong case panel but partial answers on two execution-specific questions. The hiring manager liked the diagnosis, was unsure about the operating side.
- *Problem:* A thank-you email could not re-litigate the answers. The candidate needed to demonstrate operating depth on paper without restating the panel.
- *Tool surfaced:* Generated a 90-day plan mapped to the actual JD priorities the candidate had memorized. Included the dispatch mechanism the candidate had drifted on in the panel, with the SLA + routing model + volume guarantees fully spelled out as a Day 60 deliverable.
- *Outcome:* Sent as the post-panel artifact. The hiring manager forwarded to two skip-level stakeholders. Offer at 12% above initial range.

**Case 2: The internal scaffold that compresses 90-day planning to one day**
- *Setup:* Newly hired ops director at a scale-up CPG. Three direct reports waiting for the operating plan. CEO wanted it by end of week 1.
- *Problem:* Writing the plan from blank page across 5 priorities means a lot of structural decisions about phasing, owner-of-record, metric definitions, before any content.
- *Tool surfaced:* Loaded the scale-up CPG preset, swapped priorities to the actual JD list, generated the scaffold in 90 seconds. The director then spent the rest of the day editing for company-specific context (vendor names, site numbers, real metrics they could track).
- *Outcome:* Final plan landed Thursday of week 1. Three pages, mapped to JD priorities, with named owners. CEO greenlit at the Friday review with two specific edits, both on metric targets, not structure.

**Why this exists:** The 90-day operating plan is the single most reused artifact across senior operations interview prep. Every Director+ role asks some version of "walk me through your first 90 days." Every offer conversation references some version of "what would you ship in your first quarter." The pattern repeats. The structure is the same. The content changes. This tool productizes the pattern so the structure work happens in 90 seconds, leaving the operating leader to focus on context, specificity, and priorities. It also doubles as a follow-up asset post-panel, post-recruiter call, or post-skip-level meeting.

---

### Tool #12: Vendor Performance Scorecard

**[→ Open the scorecard](./vendor-scorecard.html)**

Rank your vendors against a **weighted multi-dimensional scorecard** across 5 dimensions: on-time delivery, defect rate, cost variance, lead time, and response time. A/B/C tier classification with sensitivity analysis on weights, per-vendor action recommendations, and money-on-the-table math.

**The math:**

```
dimension_score    = function(raw_input)        // each dimension scored 0-100
weighted_score     = Σ (weight_i × score_i) / Σ weights
tier               = A if rank ≤ 25%, C if rank ≥ 75%, B otherwise
sensitivity        = |weighted_score(weight ± 10) − weighted_score(weight)|
money_on_table     = bottom_vendor_volume × defect_gap × unit_cost × 12 months
```

**Four operator presets:**

| Preset | Weights focus | Use case |
|---|---|---|
| Kit sourcing (overseas mfg) | Defect 30%, Lead time 20%, Cost 25% | China/Vietnam manufacturers, multifamily renovation kits, container-based supply |
| 3PL last-mile | On-time 30%, Defect 25%, Cost 20% | Multi-carrier last-mile portfolio, monthly scorecard cadence |
| BPO offshore support | Response time 35%, Defect 30% | Outsourced support sub-team performance, drift detection |
| Balanced multi-vendor | Equal weighting | Generic multi-vendor portfolio, default starting point |

**Sensitivity analysis:** for each dimension, the tool shifts the weight by +/- 10 points and reports the absolute change in your top vendor's score. Bars above 3 points get an orange warning. This validates your weights before you take the scorecard to a vendor conversation. If a small weight shift flips the ranking, your weights are not the right ones.

**Action recommendations:** generated from tier + cost variance + volume. Tier A vendors get first-call status. Tier B middle gets targeted improvement plans. Tier C bottom gets structured remediation or replacement. The cheap vendor that is bleeding you on defects is the most expensive vendor in the portfolio, and the scorecard makes that visible.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: Multifamily kit sourcing with overseas manufacturers**
- *Setup:* Multifamily renovation supply firm sourcing 8-15 manufacturers across cabinets, flooring, lighting, plumbing fixtures, hardware out of China and Vietnam.
- *Problem:* Lead times unpredictable, defect rates variable, communication latency from time zones made everything slower. No scorecard rhythm meant vendor conversations were anecdotal.
- *Tool surfaced:* Kit sourcing preset ranked top 3 vendors (score 80+) holding 65% of volume, surfaced 2 bottom-tier vendors with combined volume drag of $180K annualized.
- *Outcome:* Renegotiated 2 bottom-tier vendors on volume commitment, 30-day improvement plans, cycle-2 PO shifted 18% of volume to top performers. Cost-per-unit down 4% in one cycle.

**Case 2: 3PL last-mile carrier renegotiation cycle**
- *Setup:* Logistics operator with 15+ last-mile carriers across regions, vendor performance drifting month over month.
- *Problem:* On-time delivery had dropped from 91% to 78% across the carrier base over two quarters and nobody had time to investigate carrier by carrier.
- *Tool surfaced:* 3PL preset ranked all carriers, surfaced 3 bottom-tier carriers driving most of the on-time drop, generated peer-relative scorecards for each.
- *Outcome:* Walked into each renegotiation with the carrier's own data. Zero carriers lost from the network. On-time recovered from 78% to 91% in two quarters, cost-per-handover down 6% on the bottom-tier renegotiations.

---

### Tool #13: Driver / Courier Performance Scorecard

**[→ Open the scorecard](./driver-scorecard.html)**

Rank drivers and couriers on **weighted multi-dimensional performance** with optional **tenure-based bias correction** so new drivers are not unfairly penalized by thin data. Five dimensions: acceptance rate, on-time delivery, customer rating, completion rate, response time. Four-tier classification (Top / Reliable / Watch / At-Risk), best-gets-first-call simulation, turnover risk surfacing, and per-driver action recommendations.

**The math:**

```
dimension_score      = function(raw_input)      // 0-100 per dimension
raw_score            = Σ (weight_i × score_i) / Σ weights
bias_corrected       = raw_score × (1 − blend) + median × blend     // for tenure < 30 days
                       where blend = max(0, (30 − tenure) / 30) × 0.5
tier                 = Top (top 20%), Reliable (next 40%), Watch (next 20%), At-Risk (bottom 20%)
first_call_sim       = allocate next 100 orders to ranked drivers, capped by daily capacity
turnover_risk        = score < 60 AND tenure < 90 days
money_on_table       = at_risk_volume × refund_rate_reduction × avg_order_value × 12 months
```

**Tenure-based bias correction (the differentiator):**

Most fleet scorecards penalize new drivers with thin data. A driver with 5 deliveries and one bad rating looks worse than a driver with 500 deliveries and 4 bad ratings. That is a math artifact, not a quality signal.

When bias correction is ON (default), drivers with under 30 days tenure get their score blended toward the portfolio median. The shorter the tenure, the more weight on the median. Drivers with 30+ days get their full raw score. **You stop firing drivers your scorecard could not measure yet.**

The same principle applies to vendor scorecards, content moderator QA, fraud analyst ranking, and anywhere you score people on early data. Bias correction is the line between data-driven decisions and structural unfairness.

**Four operator presets:**

| Preset | Weights focus | Use case |
|---|---|---|
| Instant delivery (Gopuff-style) | On-time 30%, Completion 30% | 30-min delivery network, SLA-critical, W2 + 1099 mix |
| Gig courier platform (Rappi-style) | Balanced across 5 dimensions | Gig courier ops, multi-country, hypergrowth |
| Ride-hail (inDrive-style) | Rating 30%, Acceptance 25% | Driver-rider matching, trip ETA in response time |
| 3PL last-mile (route-based) | Completion 35%, On-time 30% | Route-based delivery, larger volume per driver, multi-stop |

**Best-gets-first-call simulation:** the simplest way to model what supply allocation looks like under performance-based dispatch. Routes the next 100 orders to top-ranked drivers in order, capped by each driver's daily capacity, and reports what % goes to each tier. Top tier should absorb 60-80% in a healthy fleet. If your Top tier only absorbs 30%, your dispatch is not concentrated enough on your best supply.

**Action recommendations:** different for new drivers vs tenured drivers. New drivers get onboarding intervention or structured cuts before more onboarding cost gets sunk. Tenured drivers get remediation plans with explicit dimension targets. The dashboard says you onboarded 500 drivers this month. The P&L says 220 of them never delivered a second order. **That gap is where the money disappears**, and the scorecard surfaces it.

**Real-world impact** *(illustrative scenarios drawn from operator practice)*

**Case 1: Instant delivery driver onboarding leak**
- *Setup:* Instant-needs delivery platform onboarding ~500 drivers per month across markets.
- *Problem:* Dashboard reported 500 onboardings, P&L showed 220 never delivered a second order. Average cost per onboarding around $180. That was $40K per month of sunk onboarding cost on drivers who churned in week 1.
- *Tool surfaced:* Instant delivery preset with bias correction ON identified 38% of new drivers (under 30 days) in Watch or At-Risk tier despite limited data. Targeted intervention list ready by week 2.
- *Outcome:* Week-2 intervention recovered 24% of Watch-tier new drivers to Reliable by day 30. At-Risk new drivers cut early before more onboarding investment. Net effect: onboarding-to-second-order rate moved from 56% to 71% in one quarter, ~$95K annualized.

**Case 2: Gig courier supply during peak event**
- *Setup:* Gig courier platform running 8,000 active couriers, Black Friday surge incoming.
- *Problem:* Routing high-value orders to wrong courier during peak meant refunds, churn, customer feedback. Historical pattern: peak refund rate 2.1x normal week refund rate, with most of the spike on tail-tier couriers.
- *Tool surfaced:* Gig courier preset + best-gets-first-call sim confirmed Top tier could absorb 78% of peak volume across daily capacity. At-Risk tier paused for peak window, Reliable tier got high-value orders, At-Risk got low-stakes.
- *Outcome:* Peak refund rate stayed within 1.3x normal week (vs 2.1x prior peak). Avoided losses ~$220K across the peak event. Tier-based dispatch became the peak-event playbook going forward.

---

## Roadmap

Other tools planned for this toolkit (inspired by community feedback, especially from Ricardo Vieira-Gomes):

- **Tool #8: Escalation Decision Calculator** *(coming)*. When does it make sense to escalate vs close at agent level? Cost-benefit of the escalation layer.
- **Tool #9: PO + Delivery Tracking Template** *(coming)*. Procurement workflow that becomes a tracking layer: PO logged, vendor SLA, delivery validation, defect-drag, cost-per-unit reconciliation.
- **Tool #11: 90-Day Operating Plan Generator** *(coming)*. Input role title + JD priorities + company context, output a structured 30/60/90 one-pager with metrics and deliverables.

If a particular tool would be useful for your team, open an issue and I'll prioritize it.

---

## How to use

### Run locally
```bash
git clone https://github.com/everpaula/marketplace-ops-toolkit
cd marketplace-ops-toolkit
# Open agent-roi.html in any modern browser
```

No build step. No dependencies. Single HTML file with everything inline. Drop the file anywhere, double-click, it works offline.

### Or use the live version

**[Live demo →](https://everpaula.github.io/marketplace-ops-toolkit/)**

---

## A note on the benchmarks

The decomposition bars compare your inputs against generalized industry-level averages for fraud and review operations. They are **not** a competitive benchmark — they are a sanity check.

If your orders-per-agent is 50 against a 250 benchmark, that's a signal to investigate tooling or process bottlenecks, not a verdict that your team is bad. Real benchmarks come from your own data over time. The decomposition is meant to tell you *where to look first*, not *how to score yourself*.

---

## License

MIT. Use freely. If it helps you make a better decision, that's enough.

---

## About me

I'm Everton Paula. I spent the last 12+ years building and running operations at hypergrowth marketplaces and consumer fintech across multiple countries. Fraud, marketplace ops, logistics, vendor management, workforce planning at scale. This toolkit codifies the recurring patterns I've seen work, framed in a way any operations leader can adapt to their own environment.

Currently based in Tampa, FL, focused on Director / Head roles in operations and fraud operations at consumer fintech and marketplaces.

- LinkedIn: [linkedin.com/in/evertonpaula](https://linkedin.com/in/evertonpaula)
- GitHub: [github.com/everpaula](https://github.com/everpaula)

---

## Contributing

If you've used this tool in your own ops function and have feedback, suggestions, or want to add a tool to the toolkit, open an issue or PR. Particularly interested in:

- Real-world benchmark data from different industries (anonymized)
- Use cases I haven't thought of
- Edge cases where the ROI math breaks down
- Translations (Portuguese, Spanish would extend the audience meaningfully)
