# Audit log — surge-pid

Run: 2026-05-30-124010
Ângulo: city-average esconde desequilíbrio local; PID por polígono (3x3) vs multiplicador único. Modo Polygon do simulador.

## Hard scans (pass/fail)

- [x] Em-dash scan: **PASS** (0 ocorrências de `—`/`–`/`--`).
- [x] Banned words scan: **PASS**. Atenção: evitado o verbo banido para ajuste de ganho; usado "tune" no Beat 6. Sem leverage/optimize/scalable/etc.
- [x] Employer names scan: **PASS**. Protagonista = "a pricing manager at a Tier-2 ride-hail operation" (label sanitizado).
- [x] AI-claim on tool scan: **PASS** (tool descrita como simulador de PID control theory, não IA).

4/4 PASS.

## Humanizer pass log (2026-05-30)

- Beat 1 opener: "Weekday peak." — sem tell. Cena + tempo.
- Beat 2 opener: "One number for the whole city." — sem tell. Substantivo concreto.
- Beat 3 opener: "Four outer zones" — sem tell. Número front-loaded.
- Beat 4 opener: "She ran the polygon simulator." — sem tell. Verbo de ação com payoff.
- Beat 5 opener: "Cancellation in those zones" — sem tell. Substantivo concreto + número.
- Beat 6 opener: "A 1.0x city surge can be" — sem tell. Abre o paradoxo (média esconde extremos).
- Beat 6 par "Tune the average and both sides lose. Tune each zone and both problems disappear." — **kept as-is.** Paralelismo deliberado (device de copywriting, espelha o closer das referências). Mantido com rationale.
- Beat 7 tagline: "The city average is not a place anyone actually waits." — sem tell. Single-line cut.

Tells procurados e ausentes: #9 (a dupla "Tune..." é par, não trio com negação), #11, #14, #16, #22, #28, #41, #52 (acrônimos: "PID", "ETA" usados com moderação; "forecast error" usado em vez de despejar "MAPE" pra evitar sopa de acrônimo), #57, #71, #84.

## F-shape audit log (2026-05-30)

- P1 "Weekday peak" pass. P2 "One number" pass. P3 "Four outer zones" pass. P4 "She ran" pass. P5 "Cancellation in" pass. P6 "A 1.0x city" pass. P7 "The city average" pass.
- Mobile cutoff (primeiros ~150 chars):
  "Weekday peak. A pricing manager at a Tier-2 ride-hail operation ran one citywide surge multiplier, averaging 1.4x. The dashboard looked healthy."
  Cena (pricing manager, ride-hail, weekday peak) + stake (multiplicador único 1.4x) + tensão ("looked healthy" arma a reversão). **Landed? YES.**

## Notas de precisão (GAP do Scout)
- Figuras (1.4x, 18-22min, 8%→3.2%, $9K/peak, 1.0x/1.7x/2.5x/0.8x) ilustrativas. Não apresentadas como medição.
- Post NÃO afirma que PID vence sempre. O GAP do Scout (Storm Event derrota ambos os controllers) não é contradito: o post mostra um caso de ganho realista, não uma vitória universal. OK.

## Decision

VERDICT: **APPROVE**
