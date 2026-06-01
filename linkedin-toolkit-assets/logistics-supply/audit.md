# Audit log — logistics-supply

Run: 2026-05-29-180403
Auditor: Humanizer Auditor 🧪
Reviewed: post body + meta copy (hero punchy, subtitle, CTAs, Featured card, follow-up comment)

## Hard scans (pass/fail)

- [x] **Em-dash scan: PASS** (0 hits no copy público; 5 hits totais no arquivo, todos em metadata header / markdown separator `---` / NOTES section interno — não contam como violação)
- [x] **Banned words scan: PASS** (0 hits: leverage, optimize, scalable, robust, seamless, holistic, transformative, streamline, empower, data-driven todos ausentes)
- [x] **Employer names scan: PASS** (0 hits: Shopee, Rappi, inDrive, Embraer, Porto Seguro, Stellantis — Scout sanitizou na extração)
- [x] **AI-claim on tool scan: PASS** (0 hits: nenhuma menção a "AI-powered", "AI-driven", "powered by AI", "this AI", "AI tool")

## Humanizer pass log (2026-05-29)

- Beat 1 opener: "Q4 forecast hit a regional 3PL on a Tuesday." — kept as-is. Front-loaded substantivo + número + tempo. F-shape compliant.
- Beat 2 opener: "140 couriers. 18 vans. 3 hubs." — kept as-is. Sequência de números front-loaded é stop-scroll legítimo, não rule-of-three filler (são três contagens reais de inventário, não três adjetivos paralelos). Confere com padrão "14 tabs. Last touched 8 months ago." de Reference Post #5.
- Beat 3 closer: "Couriers idle. OT bleeding to clear before Day 4 inbound landed." — kept as-is. Duas frases curtas, não rule-of-three (skill #9 evitado). A versão draft original tinha "Couriers idle, vans full, OT bleeding" que era rule-of-three; Copywriter já corrigiu antes do handoff.
- Beat 4 closer: "Couriers hit 78%. Vans hit 96%. The bottleneck was the fleet, not the labor." — kept as-is. Duas medições paralelas (78%, 96%) + uma conclusão. Não é rule-of-three porque a terceira frase quebra o padrão sintático (não começa com "X hit Y%"). Conclusão funciona como punch line.
- Beat 5 opener: "8 extra vehicles. 22 couriers, not 50." — kept as-is. Padrão de números front-loaded, mesma técnica de Beat 2. Diferencia outcome do palpite original ("not 50") sem usar signposting.
- Beat 6 opener: "The forecast was right." — kept as-is. Frase declarativa curta como pivot. Não é signposting (skill #28), é assertion. Setup pro contraintuitivo na próxima frase.
- Beat 7 tagline: "Linear models tell you what's missing. Cascade models tell you what's already broken upstream." — **kept as-is, INTENTIONAL negative parallelism**. Mirror direto da técnica de closer do Reference Post #5 ("Capacity asks don't get rejected because the math is wrong. They get rejected because the math isn't visible."). Documentado como copywriting device deliberado, NÃO AI tell.
- Beat 7 CTA: "Live tool + 4 preset scenarios pinned in my Featured section." — kept as-is. Mirror direto do Reference Post #5 / #6 closer. Padrão estabelecido.

## F-shape audit log (2026-05-29)

Paragraph openers (primeiros 2-3 words de cada beat):

- P1 (Beat 1) opener: "Q4 forecast" → **PASS** (substantivo + número, front-loaded)
- P2 (Beat 2) opener: "140 couriers." → **PASS** (número, front-loaded)
- P3 (Beat 3) opener: "Old playbook" → **PASS** (substantivo, front-loaded; mesma técnica de Reference Post #5 P3 opener)
- P4 (Beat 4) opener: "She rebuilt" → **PASS** (action verb que carrega o payoff)
- P5 (Beat 5) opener: "8 extra" → **PASS** (número, front-loaded)
- P6 (Beat 6) opener: "The forecast" → **PASS** (artigo + substantivo; substantivo carrega o weight, "forecast" é o conceito que será virado)
- P7 (Beat 7) opener: "Linear models" → **PASS** (substantivo + adjetivo, front-loaded; setup pro contraintuitivo)

**Mobile cutoff check (first ~210 chars do post body):**

```
Q4 forecast hit a regional 3PL on a Tuesday. 35% volume jump over last year. Linear model said add 50 couriers, POs by Friday. $180K of wrong-sizing risk either way.

140 couriers. 18 vans. 3 hubs. The
```

Contagem: 205 chars antes do final esperado de truncamento (~210). Lands:
- **Cena**: regional 3PL, Tuesday, network planner implícito no contexto
- **Stake**: $180K wrong-sizing risk, POs by Friday
- **Tensão**: linear model says X, but...?

Cena + stake + tensão **landed**. ✅

## Decision

**VERDICT: APPROVE**

Total word count: 200 (target 100-200, exact upper bound)
Beats present: 7 of 7
Specific numbers in body: 9 (35%, 50, $180K, 140, 18, 3, 15%, 35%, 78%, 96%, 8, 22, 94%, 89%, $140K — counted distinct anchors, ≥2 required)
Hashtag count: 5 (target exact 5)
Hashtag pattern: 3 vertical (#LogisticsOps, #SupplyChain, #LastMile) + 1 framework (#NetworkPlanning) + 1 constant (#OpenSourceTools) ✅
Follow-up word count: 38 (≤60 required)
Hero punchy: 4 words (target 4-6)
Subtitle: 10 words (target ≤14)
CTA labels: 2 (target exactly 2)
Featured title: 8 words (target 6-10)
Featured description: 3 lines (target 2-3)

Sem mudanças requeridas. Copy pode ir pro Designer renderizar.
