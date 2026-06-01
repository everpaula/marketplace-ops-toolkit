# Audit log — workforce-forecast

Run: 2026-05-29-184759
Ângulo: Case 2 (footprint vendor-heavy, crossover de custo por caso). Escolhido para não repetir o Post #5 (gold standard), que já usou o Case 1 (38 → 31 FTE, headcount de chargeback).

## Hard scans (pass/fail)

- [x] Em-dash scan: **PASS** (0 ocorrências no copy público: post body, follow-up, featured card, CTAs, hashtags, punchy, subtitle). Confirmado por grep `—|–|--` no texto final. Os únicos hits no rascunho estavam no cabeçalho de metadados e nos separadores markdown `---`, fora do artefato público, e foram removidos do header antes do audit.
- [x] Banned words scan: **PASS** (nenhum hit de leverage/optimize/scalable/robust/seamless/holistic/transformative/streamline/empower/data-driven, nem equivalentes PT).
- [x] Employer names scan: **PASS** (nenhum hit de Shopee/Rappi/inDrive/Embraer/Porto Seguro/Stellantis). Protagonista é "a review-ops lead at a high-growth ecommerce platform", categoria genérica.
- [x] AI-claim on tool scan: **PASS** (a tool nunca é descrita como IA. É descrita como math + 4 presets + comparação de modelos de custo).

Todas as 4 hard scans passaram. Segue para os passes soft.

## Humanizer pass log (2026-05-29)

O rascunho chegou limpo. Nenhuma reescrita de linha foi necessária. Registro tell por tell:

- Beat 1 opener: "Quarterly review." — sem tell. Cena front-loaded (substantivo + tempo). Não é skill #16 (sem verbo-filler tipo "She opened").
- Beat 2 opener: "36 vendor reviewers" — sem tell. Número front-loaded.
- Beat 3 opener: "Day-rate math hid the real number." — sem tell. Substantivo concreto na abertura.
- Beat 4 opener: "She ran three models on the same inputs" — sem tell. Verbo de ação carregando o payoff (permitido pela regra F-shape 1). NÃO confundir com skill #16: não há filler narrativo, a ação é a substância (rodar os 3 modelos).
- Beat 4 lista de levers: "Volume by case type, handle time, productive minutes, shrinkage, peak ratio." — lista de 5 itens (decomposição de levers, igual ao Post #5 "4 levers"). NÃO é skill #9 (rule-of-three + tailing-negation): são 5 itens, sem negação na cauda, sem paralelismo forçado. Mantido.
- Beat 5 opener: "Hybrid still won, but not at 60% vendor." — sem tell. Substantivo + verbo.
- Beat 6 opener: "The cheap vendor was the expensive one." — borderline F-shape ("The + adjetivo + substantivo"). MANTIDO: "cheap vendor" é substantivo concreto e a linha É o insight contraintuitivo do post (skill nenhum acionado; é o paradoxo central). Não é "The + abstract noun".
- Beat 7 tagline: "Seat cost is what you negotiate. Case cost is what you pay." — **kept as-is.** Paralelismo negativo deliberado, mesmo device do closer do Post #5 ("...because the math is wrong / ...because the math isn't visible"). Não é AI tell, é copywriting device. Mantido com rationale.
- Closer CTA: "Live calculator + 4 preset scenarios pinned in my Featured section." — sem tell. CTA pragmático, não-agressivo (sem "Share"/"Tag"/"Like").

Tells procurados e NÃO encontrados: skill #9 (rule-of-three+negação), #11 (rule-of-three positivo), #14 (paralelismo forçado entre parágrafos), #16 (meta-narrativa no opener), #22 ("stands as"/"serves as"), #28 (signposting), #41 (bold como header), #57 ("in today's world"), #71 (closer "in conclusion"), #84 (cadeia de em-dash). Nenhum presente.

## F-shape audit log (2026-05-29)

- P1 opener: "Quarterly review." — **pass** (cena + tempo, substantivo).
- P2 opener: "36 vendor reviewers" — **pass** (número).
- P3 opener: "Day-rate math" — **pass** (substantivo concreto).
- P4 opener: "She ran three" — **pass** (verbo de ação com payoff).
- P5 opener: "Hybrid still won" — **pass** (substantivo + verbo).
- P6 opener: "The cheap vendor" — **pass (borderline)** (substantivo concreto carregando o paradoxo; é a linha de insight).
- P7 opener: "Seat cost is" — **pass** (substantivo, abre o paralelismo).

- Variância de tamanho de parágrafo: P1 médio, P2 médio, P3 médio, P4 médio, P5 médio, P6 médio, P7 tagline curta de 1 linha + CTA de 1 linha. Ritmo OK; o tagline curto quebra a cadência antes do CTA.

- Mobile cutoff (primeiros 210 chars):
  "Quarterly review. A review-ops lead at a high-growth ecommerce platform had one line flagged: 60% of case review running on vendor seats, a per-case rate locked three years ago. Vendor looked like the cheap option."
  Cena (review-ops lead, ecommerce, quarterly review) + stake (60% em vendor, rate travado há 3 anos) + tensão (linha "flagged" + "looked like the cheap option" arma a reversão). **Landed cena+stake+tensão? YES.**

## Notas de precisão (do GAP do Scout)

- Todos os valores em dólar ($4.20, $3.10, $360K, $230K) são ilustrativos. O README rotula os dois cases como estimativas de ordem de grandeza, não medições de deployment. O post não apresenta nenhum número como resultado medido. OK.
- A tool NÃO é apresentada como calculadora do split ótimo. O post enquadra a intervenção como tornar o custo-por-caso visível ao rodar 3 modelos fixos nos mesmos inputs, não como a tool derivando 45%. Alinhado ao GAP do Scout. OK.

## Decision

VERDICT: **APPROVE**

Hard scans 4/4 PASS. Humanizer pass: 0 reescritas necessárias, 1 device intencional documentado (tagline, paralelismo negativo), 1 opener borderline mantido com rationale. F-shape: 7/7 openers pass, mobile cutoff entrega cena+stake+tensão. Copy liberado para o Designer (Step 8).
