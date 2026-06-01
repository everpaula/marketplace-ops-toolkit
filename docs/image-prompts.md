# Image Prompts — Canonical Reference

Committed by squad `linkedin-toolkit-assets` v1.0 on 2026-05-29.
Used by: LinkedIn hero asset pipeline (Background Maker + Designer agents).

## Tool → Variant Mapping

| Tool | Variant | Mood | Background filename |
|---|---|---|---|
| agent-roi | A | optimistic | variant-a-warm.png |
| workforce-forecast | A | optimistic | variant-a-warm.png |
| queue-ops-center | A | optimistic | variant-a-warm.png |
| logistics-supply ★ | B | flow | variant-b-cirrus.png |
| vendor-scorecard ★ | B | flow | variant-b-cirrus.png |
| driver-scorecard | B | flow | variant-b-cirrus.png |
| bin-monitor | C | vigilance | variant-c-twilight.png |
| chargeback-sop | C | vigilance | variant-c-twilight.png |
| surge-pid | C | vigilance | variant-c-twilight.png |
| index | D | premium cover | variant-d-panoramic.png |

`master.png` is the default fallback if a variant fails to fetch.

---

## MASTER (default for any tool)

```
A serene minimalist sky composition for premium SaaS marketing hero
banner. Wide cinematic 16:9 horizontal format. Soft pale blue gradient
sky from light cerulean at top to nearly white at the horizon line in
the lower third. Sparse, soft cumulus clouds scattered asymmetrically,
realistic but slightly stylized, with subtle warm golden highlights on
their upper edges suggesting gentle morning light. Generous empty space
in the center and upper portion of the frame, intentionally clean for
later typography overlay. No text, no words, no logos, no humans, no
buildings, no objects, no aircraft. Atmospheric haze near horizon with
a delicate hint of soft pink and warm gold tones blending into the
pale blue. Professional editorial photography aesthetic. Ultra-high
resolution, sharp focus, calm and optimistic mood, modern tech
marketing look. Negative space dominant. 1792x1024 or similar
widescreen ratio.
```

## VARIANT A — workforce, CS, queue ops (warmth, human-adjacent feel)

Applies to: `agent-roi`, `workforce-forecast`, `queue-ops-center`

```
A serene minimalist sky composition for premium SaaS marketing hero
banner. Wide cinematic 16:9 horizontal format. Sky composition shifts
toward warmer dawn palette. Soft amber and rose gradient on the
horizon, transitioning to pale blue at the top. Hints of sunrise
atmosphere. Sparse, soft cumulus clouds scattered asymmetrically with
warm golden highlights. Generous empty space in the center, intentionally
clean for typography overlay. No text, no words, no logos, no humans,
no buildings, no objects, no aircraft. Professional editorial photography
aesthetic. Ultra-high resolution, sharp focus, optimistic mood, modern
tech marketing look. Negative space dominant. 1792x1024 widescreen ratio.
```

## VARIANT B — logistics, supply chain (movement, altitude, flow)

Applies to: `logistics-supply`, `vendor-scorecard`, `driver-scorecard`

```
A serene minimalist sky composition for premium SaaS marketing hero
banner. Wide cinematic 16:9 horizontal format. Sky composition with
subtle aerial perspective suggesting altitude or movement. Pale blue
gradient with feathered cirrus clouds streaking horizontally, evoking
flight paths or trade routes without depicting them literally. Cool
tones dominant with a single warm horizon accent. Generous empty space
in the center, intentionally clean for typography overlay. No text, no
words, no logos, no humans, no buildings, no objects, no aircraft.
Professional editorial photography aesthetic. Ultra-high resolution,
sharp focus, calm controlled mood, modern tech marketing look. Negative
space dominant. 1792x1024 widescreen ratio.
```

## VARIANT C — fraud, risk, pricing (vigilance, precision, controlled tension)

Applies to: `bin-monitor`, `chargeback-sop`, `surge-pid`

```
A serene minimalist sky composition for premium SaaS marketing hero
banner. Wide cinematic 16:9 horizontal format. Sky composition at
twilight. Deep blue gradient at the top transitioning to a soft purple
pink horizon. A few high cirrus clouds catching last light. More
intensity and contrast than dawn or noon variants, but still calm and
controlled. Sense of vigilance and precision. Generous empty space in
the center, intentionally clean for typography overlay. No text, no
words, no logos, no humans, no buildings, no objects, no aircraft.
Professional editorial photography aesthetic. Ultra-high resolution,
sharp focus, modern tech marketing look. Negative space dominant.
1792x1024 widescreen ratio.
```

## VARIANT D — hub / index page (max minimalism, editorial cover)

Applies to: `index.html`

```
A serene minimalist sky composition for premium SaaS marketing hero
banner. Wide cinematic 16:9 horizontal format. Panoramic sky composition
with maximum negative space. Almost abstract minimalism. Pale gradient
from soft pale gold horizon to soft blue zenith. A single small cloud
asymmetrically placed in the lower right third. Premium editorial cover
style. Maximum calm. No text, no words, no logos, no humans, no
buildings, no objects, no aircraft. Professional editorial photography
aesthetic. Ultra-high resolution, sharp focus, modern tech marketing
look. Negative space dominant. 1792x1024 widescreen ratio.
```

## Universal Negative Prompt

```
text, words, letters, typography, logos, watermarks, signatures,
humans, faces, silhouettes, buildings, vehicles, aircraft, objects,
harsh shadows, cluttered composition, dark moody atmosphere, low
contrast, blurry, low quality, distorted, artifacts, fake clouds,
cartoon style, illustration style, painting style
```

---

## Acquisition mode

Default: **Unsplash fetch** via the squad's Background Maker agent (no API key required). Prompts translate to Unsplash search queries.

Alternative: if `OPENROUTER_API_KEY` is set in the environment, the squad can switch to the `image-ai-generator` skill in production mode (Gemini 3.1) and re-run Step 03 of the pipeline. The prompts above feed directly into the model.
