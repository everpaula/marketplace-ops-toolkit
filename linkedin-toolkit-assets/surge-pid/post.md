Weekday peak. A pricing manager at a Tier-2 ride-hail operation ran one citywide surge multiplier, averaging 1.4x. The dashboard looked healthy.

One number for the whole city. Forecast error under 30%, surge held at baseline, green across the board.

Four outer zones sat at 18 to 22 minute ETAs while downtown cleared in 4. Around 8% of trips in those zones cancelled. The city average was fine. The map was not.

She ran the polygon simulator. Nine PID controllers, one per zone on a 3 by 3 grid. Two outer cells stuck in deep undersupply at 1.0x while downtown overshot at 1.7x. She raised the proportional gain on the outer cells.

Cancellation in those zones fell from 8% to 3.2%. About $9K per weekday peak came back in completed trips. The citywide average barely moved.

A 1.0x city surge can be downtown at 2.5x and the suburbs at 0.8x, averaged into one tidy number. Tune the average and both sides lose. Tune each zone and both problems disappear.

The city average is not a place anyone actually waits.

Live simulator + 5 scenarios pinned in my Featured section.

#PricingStrategy #MarketplaceOps #SurgePricing #ControlTheory #OpenSourceTools
