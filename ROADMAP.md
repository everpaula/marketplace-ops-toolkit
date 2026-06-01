# Marketplace Ops Toolkit — Roadmap

Last updated: 2026-06-01

## Current state (11 tools live)

All shipped, deployed to GitHub Pages, indexed in `sitemap.xml`, documented in `README.md`.

| # | Tool | File | Category |
|---|---|---|---|
| 1 | Agent ROI Calculator V2 | `agent-roi.html` | Workforce ROI |
| 2 | BIN Monitoring Detection | `bin-monitor.html` | Fraud (card testing) |
| 3 | Marketplace Surge Simulator V2 | `surge-pid.html` | Pricing (PID control) |
| 4 | Chargeback Dispute Wizard | `chargeback-sop.html` | Fraud (disputes) |
| 5 | Workforce Forecast Calculator | `workforce-forecast.html` | Workforce planning |
| 6 | Logistics Supply Forecaster V2 ★ | `logistics-supply.html` | Supply chain |
| 7 | Queue Operations Command Center | `queue-ops-center.html` | Ops triage |
| 10 | Customer Feedback Cost Analyzer ✦ | `customer-feedback-cost.html` | Customer ops / Finance |
| 12 | Vendor Performance Scorecard ★ | `vendor-scorecard.html` | Supply chain |
| 13 | Driver / Courier Scorecard | `driver-scorecard.html` | Last-mile |
| - | Landing hub | `index.html` | - |

★ = demoed live and validated in pipeline (BySupply R2 panel, 2026-05-28, Robert Peay CFO: "this looks super impressive")
✦ = built around the "cost of preventable feedback" metric cited across Gopuff R2, TFD, FNF, Lume preps

Why the gap between #7 and #10, and between #10 and #12: tools #8, #9, and #11 are planned but still in the Tier 2 backlog below. #10 shipped 2026-06-01 because the "cost of preventable feedback" metric was the most-cited frame in interview preps and a clean fit for the toolkit shape.

## Tier 1 — Active priorities (next 1-2 weeks)

Capture more value from what is already converting. These compound the proven tools into more usable assets.

| Priority | Item | Effort | Why now |
|---|---|---|---|
| 1 | **ROADMAP.md refresh** (this doc) | 30 min | Removes 5-month-stale `NEXT_STEPS.md` that still references "Tool #1 only" |
| 2 | **Share-by-URL state encoding** on `vendor-scorecard.html` | 2-3h | Enables sending pre-configured scorecards in follow-up emails. Demoed live at BySupply, can be pre-configured for them async if it advances. |
| 3 | **Share-by-URL state encoding** on `logistics-supply.html` | 2-3h | Same as above. Two tools that landed in the BySupply demo. |
| 4 | **Walkthrough videos** (Loom-style, 90-120s each) for `vendor-scorecard.html` and `logistics-supply.html` | 1h per tool to record after scripts ready | Async demo for panels where screen share is not possible. Footer link "Watch 90s walkthrough" per tool. |
| 5 | **Case studies page** (`/case-studies.html`) | 1-2h | Surfaces the impact narratives that already exist in the README, in a dedicated SEO-indexed page. Anchored from each tool. |
| 6 | **`index.html` evolution** to surface the 3 most-demoed tools (workforce-forecast, vendor-scorecard, logistics-supply) in a hero band | 1h | Drives clicks to the tools that convert in interviews and outreach. |

## Tier 2 — New tools (next 2-4 weeks)

Operators have surfaced clear gaps. These fill them.

| # | Tool | Why | Source of insight |
|---|---|---|---|
| 8 | **Escalation Decision Calculator** | Most "auto-escalate" AI tools (Emma/Gratero etc.) skip the taxonomy: which exception warrants escalation vs which self-resolves. 80% of "stuck movement" alerts self-resolve within 4-6h. Tool maps exception types → SLA decay → escalation decision logic. | Comment on Harsh Baranwal post (2026-05-29), conversations with Ricardo Vieira-Gomes |
| 9 | **PO + Delivery Tracking Template** | JD priority #1 in many ops director roles (ROI BySupply 2026-05-28 most recent). Spreadsheet template that becomes a workflow: PO logged, vendor SLA, delivery validation, defect-drag, cost-per-unit reconciliation. | ROI BySupply R2 panel, multifamily kits use case |
| ~~10~~ | ~~**Customer Feedback Cost Analyzer**~~ | **Shipped 2026-06-01.** See `customer-feedback-cost.html`. Two personas (Ops Manager + CFO), 5 presets, Pareto category breakdown, sensitivity card. | Used in Gopuff R2, TFD prep, FNF prep |
| 11 | **90-Day Operating Plan Generator** | Productizes the BySupply 90-day one-pager pattern. Input: role title, JD priorities (5 bullets), company context. Output: structured Markdown one-pager mapped to JD priorities with day 30/60/90 deliverables and metrics. | Used in every Director/Head interview prep since 2026-05 |

## Tier 3 — Productization (next 4-12 weeks, conditional)

Only attack if Tier 1 + Tier 2 show traffic or conversion signal worth investing further.

- **Lead capture** (optional email gate per tool, behind a value-add wall)
- **Saved scenarios** (per-user state persistence, requires backend)
- **API endpoints** (`/api/vendor-scorecard/score` etc.) for dev-friendly integration
- **Vertical-specific landing pages** (e-commerce ops, ride-hail ops, fintech fraud ops) for SEO
- **Multi-language** (PT-BR following FakeForge pattern)
- **Pre-built integrations** (CSV import, Google Sheets sync, Slack notifications)

## Tier 4 — Maintenance backlog

Not blockers but worth tracking:

- Image alt text audit across all tools for accessibility
- Mobile breakpoint review (some tools have layout issues on <640px)
- Dark/light mode toggle (currently dark only)
- Print stylesheet for case studies and scorecards
- Multi-currency support (USD/EUR/BRL toggle)
- Add favicon variants for OG/Twitter sharing per tool

## Strategic posture

This toolkit is **not** a SaaS product. It is a **portfolio asset and operator-credibility artifact**. Every decision below should be filtered through that lens:

- **Build features that demo well in interviews.** Share-by-URL is high priority because it makes the toolkit usable in async follow-up. Productization features (lead capture, API) are low priority because they signal "side hustle" rather than "operator who built tools."
- **Keep the rough-edge feel.** Real ops tooling has edges. SaaS-polished UI signals it is the product, not the operator who built it.
- **Anchor every tool to a real operating story.** The case studies are the spine. Tools without a case study are leaving credibility on the table.
- **Sanitize references.** No employer names in public artifacts (see central memory `feedback-no-employer-attribution-public`). Use "a global marketplace," "a regional fintech," etc.

## How to add a tool

1. Build the single-file HTML in repo root with dark theme matching existing tools
2. Add the tool's section to `README.md` following the established pattern (intro + math + presets + real-world impact)
3. Add the tool to `sitemap.xml` with appropriate priority
4. Add the tool card to `index.html` hub
5. Mark this `ROADMAP.md` to show shipped
6. Commit + push

## How to add a feature to existing tool

1. Update the tool file directly
2. Add a `V[N+1] update YYYY-MM-DD` block to the README section
3. Update screenshots in `images/` if visual change
4. Commit + push
