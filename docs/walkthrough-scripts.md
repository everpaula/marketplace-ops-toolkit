# Walkthrough video scripts

Two 90-120 second walkthroughs for the tools that landed in the BySupply R2 panel demo (2026-05-28). Use Loom or similar. Record in the same browser window the tool runs in.

Both scripts share the same structure:
1. **Hook** (5-10s): what problem the tool solves
2. **Demo** (60-90s): walk through clicking, narrate what you see
3. **Closing** (10-15s): one specific use-case framing + CTA

Both should land at 90-120 seconds at normal speaking pace.

---

## Vendor Performance Scorecard walkthrough

### Setup before recording

- Open `vendor-scorecard.html` in a fresh tab
- Click "Reset" to clear any state
- Click the **Kit sourcing (overseas mfg)** preset so the demo starts loaded
- Verify the page is fully rendered
- Mouse cursor in the top-left corner
- Audio: clear mic, no background noise

### Voice-over script (read while recording)

> Most operators rank vendors by gut. This tool replaces that with weighted scoring across five dimensions, in 90 seconds.
>
> [Click into the scorecard]
>
> Here are the five dimensions: on-time delivery, defect rate, cost variance, lead time, response time. The weights at the top let you tune what matters for your context. The kit sourcing preset weighs defect at 30%, lead time at 20%, cost at 25%, because for overseas manufacturing on the first PO cycle, a single defective container blows a project schedule. Defect heavier than cost.
>
> [Scroll to the vendor rows]
>
> Each row is a vendor. The weighted score on the right collapses the five dimensions into one number, then maps to A/B/C tier. A tier locks in for the next PO. B tier gets a sixty-day improvement plan. C tier goes to remediation.
>
> [Scroll to sensitivity card]
>
> This is the part most scorecards skip. The sensitivity panel shifts each weight by ten points and reports how much the top vendor's ranking moves. Anything over three points flags orange. If a small weight shift flips the ranking, your weights are not the right ones. Test before you take the scorecard to a vendor conversation.
>
> [Scroll to money on the table]
>
> The dollar gap between your worst and best vendor, annualized. That number is what you bring to the renegotiation.
>
> [Pause briefly]
>
> Use case: kit-based supply chain with overseas manufacturers, where defect economics dominate cost. Link to the live tool in the description.

### Beat-by-beat actions

| Second | Action | Voice-over cue |
|---|---|---|
| 0-5 | Page visible, cursor top-left | Hook line |
| 5-15 | Hover over the five dimension headers | Naming the five dimensions |
| 15-30 | Click into the weights row, highlight defect 30% | Kit sourcing preset rationale |
| 30-50 | Scroll to vendor rows, hover top vendor and bottom vendor | A/B/C tier explanation |
| 50-75 | Scroll to sensitivity card, hover an orange bar if present | "Most scorecards skip" framing |
| 75-90 | Scroll to money-on-the-table figure | Negotiation framing |
| 90-105 | Hold on the final view | Closing line + CTA |

### Target length: 90-105 seconds

---

## Logistics Supply Forecaster walkthrough

### Setup before recording

- Open `logistics-supply.html` in a fresh tab
- Click "Reset"
- Select **3PL last-mile** persona, **Daily** granularity
- Load the **Brazil 3PL Black Friday week** preset
- Verify all panels rendered (operational, financial, sensitivity, occupation trend)
- Mouse cursor top-left
- Audio: clear mic

### Voice-over script

> Logistics teams get a marketplace forecast and have to turn it into capacity. How many couriers, how many vans, how many sort lines. Most teams answer by gut. This forecaster answers by math, in 90 seconds.
>
> [Show persona selector]
>
> Two personas at the top: 3PL last-mile or fulfillment warehouse. Two granularities: daily 14-day horizon or hourly intraday. I am showing the daily 3PL persona, loaded with the Brazil 3PL Black Friday week preset.
>
> [Scroll to operational panel]
>
> Operational output on the left: headcount peaks and averages, vehicles, sortation hours, dock utilization. Each tier colored. The financial panel below shows total cost over the horizon, cost per package, annualized projection, and cost stack across labor, fleet, facility, and SLA penalty.
>
> [Scroll to sensitivity card]
>
> This is the part most forecasters skip. Sensitivity at minus thirty, minus fifteen, base, plus fifteen, plus thirty percent forecast error. If you are thirty percent under-forecast, the tool tells you exactly how much more you pay on emergency couriers and overtime. The plus fifteen row is the case most planners actually face.
>
> [Scroll to occupation trend]
>
> The thing most ops teams miss is the cascade. Today's overflow becomes tomorrow's effective inbound. The trend bar shows each day's storage occupation across 14 days, and the cascade is built into the math. If you bake in a 20% buffer and have a 14% forecast miss, you have 6% headroom, not 20%. Most static models hide that.
>
> [Pause briefly]
>
> Use case: weekly capacity planning conversation, especially around peak events where the wrong forecast costs hundreds of thousands. Link to the live tool in the description.

### Beat-by-beat actions

| Second | Action | Voice-over cue |
|---|---|---|
| 0-5 | Page visible, cursor top-left | Hook line |
| 5-15 | Hover persona + granularity selectors | Two personas, two granularities |
| 15-30 | Click into preset dropdown, hover Brazil 3PL Black Friday | Preset selected |
| 30-50 | Scroll through operational panel, then financial | Outputs |
| 50-75 | Scroll to sensitivity card, hover plus-15% row | Forecast error framing |
| 75-95 | Scroll to occupation trend, hover a tall bar if present | Cascade and storage |
| 95-110 | Hold on the final view | Closing line + CTA |

### Target length: 100-115 seconds

---

## Production notes

### Recording tool
- Loom (preferred, free tier sufficient, easy share link)
- Or QuickTime + manual upload to YouTube as unlisted

### Audio
- Test mic levels with a 10-second test recording first
- Speak slightly slower than feels natural; on-screen narration always feels rushed at playback
- No need for music or transitions

### Video
- Browser at 1280x720 minimum, 1920x1080 ideal
- Hide browser bookmarks bar before recording (cleaner frame)
- Mouse cursor visible (Loom defaults are fine)

### Editing
- Trim any false starts and dead air at start/end
- No need to add captions; Loom auto-captions if shared via link
- Resist the urge to over-edit; rough is fine

### After recording

1. Get the shareable link from Loom (anyone with link can view)
2. Add to README.md under the tool's section: `**[Watch 90s walkthrough →](https://www.loom.com/share/...)**`
3. Add to `index.html` hub: small thumbnail or text link per tool
4. Add to LinkedIn Featured section for any tool you want to surface in your profile
5. Use the link in follow-up emails: "If useful for the next conversation, here is a 90-second walkthrough of the scorecard"

### Why these two tools first

Both demoed live to the BySupply R2 panel on 2026-05-28. Robert Peay (CFO) reacted to Vendor Scorecard with "this looks super impressive." Logistics Supply was the active pilot example. These two have proven landing power; the walkthrough video lets them keep landing in async contexts where screen share is not possible.

Tool #5 (Workforce Forecast) is the next candidate for a walkthrough, given it lands in workforce planning conversations specifically (TFD, FNF, any Director WFP role).
