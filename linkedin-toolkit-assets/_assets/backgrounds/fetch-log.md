# Background Fetch Log

Run: 2026-05-29-180403
Scope: 1 variant needed (B — cirrus altitude) for logistics-supply

## Attempts

| Variant | Source | Result |
|---|---|---|
| variant-b-cirrus | Unsplash URL `photo-1561484930-998b6a7b22e8` | Downloaded but off-spec (mountain lake, multiple objects). Rejected. |
| variant-b-cirrus | Unsplash URL `photo-1494294233208-fbc5e75eebca` | 404 (29-byte HTML stub). Rejected. |
| variant-b-cirrus | Unsplash URL `photo-1517524008697-84bbe3c3fd98` | Downloaded but off-spec (white car in snowy forest). Rejected. |
| variant-b-cirrus | **CSS gradient + Playwright render** | **Accepted.** 1792×1024 PNG, 276KB. Matches variant B spec verbatim (pale blue dominant, cirrus streaks horizontal, single warm horizon accent lower-right, negative space dominant). |

## Fallback decision

Unsplash photo-ID acquisition is unreliable (photo IDs go stale, returns can land off-spec for editorial sky compositions). The squad's bg-maker agent definition allows fallback to CSS-rendered backgrounds when Unsplash fails the spec match. Adopted that path for variant B in this run.

The CSS template for variant B is reproducible from the HTML source at `_assets/backgrounds/variant-b-cirrus.html` (preserved alongside the PNG). Future runs can either keep the CSS-rendered version, swap to a hand-picked Unsplash photo, or switch to AI generation (image-ai-generator skill, requires `OPENROUTER_API_KEY`).

## Learning for memory

The squad's `fetch-backgrounds.md` task currently lists Unsplash-only URLs as the acquisition path. The reliability issue surfaced in run 1. Memory updated: backgrounds in this squad will default to **CSS-rendered + Playwright** path going forward, unless the user explicitly requests AI gen or hand-picked photos.
