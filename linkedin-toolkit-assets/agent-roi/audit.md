# Audit log — agent-roi

Run: 2026-05-30-124010
Ângulo: Portfolio mode + custo de false positive virando uma fila "fundável" (gross 0.6) em net-negativa. Pergunta central "where does the next dollar go?".

## Hard scans (pass/fail)

- [x] Em-dash scan: **PASS** (0 ocorrências de `—`/`–`/`--` no copy público).
- [x] Banned words scan: **PASS**. Atenção especial: o tier do meio da tool tem label "Optimize" (verbo banido). NÃO foi usado no corpo público; tiers descritos como "scale vs root-cause". "scalable" não aparece (só o verbo "scale", permitido).
- [x] Employer names scan: **PASS**. Protagonista = "an ops leader at a global marketplace" (label sanitizado, não empregador).
- [x] AI-claim on tool scan: **PASS** (a tool é descrita como math: gross vs net ROI, custo de FP, ranking por agente).

4/4 PASS. Segue para soft passes.

## Humanizer pass log (2026-05-30)

- Beat 1 opener: "Budget approved." — sem tell. Cena + stake front-loaded.
- Beat 2 opener: "The ROI math everyone trusted:" — sem tell. Substantivo concreto (a fórmula herdada).
- Beat 3 opener: "Gross hid the false positives." — sem tell. Sujeito concreto + ação.
- Beat 4 opener: "She ran it in portfolio mode" — sem tell. Verbo de ação com payoff (não é skill #16; não há filler).
- Beat 5 opener: "On the net basis" — sem tell. Âncora numérica/conceitual.
- Beat 6 opener: "Adding agents to a bleeding queue" — sem tell. Gerúndio que carrega o paradoxo central.
- Beat 7 tagline: "Gross ROI says the queue makes money. Net ROI says which mistake you are paying for." — **kept as-is.** Device de contraste (gross vs net), não paralelismo forçado nem AI tell. Mantido.
- Lista de ações no Beat 4 ("Subtract... Rank... Then ask...") — decomposição de levers, não rule-of-three com negação (skill #9). Mantida.

Tells procurados e ausentes: #9, #11, #14, #16, #22, #28, #41, #52 (sem sopa de acrônimos: "ROI", "LTV"/"lifetime value", "FP"/"false positive" usados com parcimônia e definidos em linguagem natural), #57, #71, #84.

## F-shape audit log (2026-05-30)

- P1 "Budget approved" — pass. P2 "The ROI math" — pass. P3 "Gross hid" — pass. P4 "She ran" — pass. P5 "On the net" — pass. P6 "Adding agents" — pass. P7 "Gross ROI says" — pass.
- Variância de parágrafo OK; tagline curta antes do CTA.
- Mobile cutoff (primeiros ~205 chars):
  "Budget approved. An ops leader at a global marketplace had sign-off to add two agents to a manual review queue screening 200 flagged orders a day. On paper, the queue made money."
  Cena (ops leader, marketplace, review queue, 200 orders/dia) + stake (budget pra 2 agentes) + tensão ("on paper, the queue made money" arma a reversão). **Landed? YES.**

## Notas de precisão (GAP do Scout)
- Figuras ($1,400/dia, $180 LTV, 6%→2.5%, $280K, 0.6 ROI) ilustrativas. README rotula cases como order-of-magnitude. Nenhuma apresentada como medição. OK.
- Post não implica modelagem de churn composto (GAP do Scout: FP cost é one-shot). O texto fica no efeito de bloqueio direto. OK.

## Decision

VERDICT: **APPROVE**
