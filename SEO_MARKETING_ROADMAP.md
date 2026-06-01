# Marketplace Ops Toolkit — SEO + Content Marketing Roadmap

**Status atual (pós-2026-05-23 SEO pass):** SEO foundation está completo. Sitemap, robots.txt, per-tool meta tags, OG/Twitter cards, JSON-LD SoftwareApplication, canonical URLs, ItemList no index. Discovery surface pronta.

**Audiência primária:** recruiters técnicos + senior ops leaders procurando portfolio do Everton Paula. Audiência secundária: peer operators procurando ferramentas práticas.

**Objetivo:** descoberta orgânica de Director/VP Ops opportunities + posicionamento de Everton como peer operator credível.

---

## Estado atual da base SEO

✅ **Done:**
- Sitemap.xml com 10 URLs
- Robots.txt
- index.html: canonical + OG/Twitter + WebSite + ItemList schema
- 9 tool HTMLs: canonical + OG/Twitter + SoftwareApplication schema
- Author metadata (Everton Paula + LinkedIn)
- MIT license signaled

⚠️ **Pending:**
- OG images: schema referencia `images/og-toolkit.png`, `images/agent-roi-portfolio.png`, etc. **Algumas dessas imagens existem (já no /images), outras NÃO.** Verificar uma a uma:
  - `agent-roi-portfolio.png` ✓ existe
  - `bin-monitor.png` ⚠️ checar
  - `surge-polygon-map.png` ✓ existe
  - `chargeback-sop.png` ⚠️ checar
  - `workforce-forecast.png` ✓ existe
  - `logistics-supply.png` ⚠️ checar
  - `queue-ops-center.png` ✓ existe
  - `vendor-scorecard.png` ⚠️ ainda não criada
  - `driver-scorecard.png` ⚠️ ainda não criada
  - `og-toolkit.png` ⚠️ ainda não criada (general OG)

**Ação:** gerar imagens faltantes (1200x630 OG-spec). Pode ser screenshots das próprias tools, ou geradas com design skill.

---

## Top 4 wins continuados (próximas 4-6 semanas)

### 1. OG images completas (impacto: alto · esforço: baixo)

Gerar/screenshotear as 5 imagens faltantes:
- vendor-scorecard.png — screenshot da tool em uso (kit-sourcing preset, dados do exemplo)
- driver-scorecard.png — screenshot com instant-delivery preset
- og-toolkit.png — overview com brand + tagline
- bin-monitor.png + chargeback-sop.png + logistics-supply.png se não existirem

**Esforço:** 1-2h.

### 2. Content marketing: 1 post LinkedIn por tool (impacto: alto · esforço: contínuo)

Você já está rodando isso com 7-beat structure. Pipeline atual já tem #4 Chargeback Wizard pronto, #5 Workforce Forecast, etc.

**Adicionar:** quando todos os 9 posts forem ao ar, repurpose como blog posts standalone hospedados na própria toolkit (`/blog/agent-roi-deep-dive.html`, etc). Cada um vira:
- 1500-2500 palavras explicando a operação interna
- Backlink natural pro tool
- Indexável por Google
- Cita ativos de carreira ("This is the same logic I used at Shopee...")

**Esforço:** 2-3h por blog post post-LinkedIn-launch. Manter cadência consistente.

### 3. GitHub repo discovery (impacto: médio · esforço: baixo)

GitHub é canal de descoberta sub-utilizado pra esses tools. Movimentos:

- **Topics on the repo:** adicionar topics tipo `fraud-operations`, `marketplace-operations`, `ops-tools`, `python-calculator`, `vendor-management`, `driver-scorecard`, `workforce-planning`, `surge-pricing`, `logistics-forecasting`. Topics melhoram discovery na busca GitHub.
- **README badges:** adicionar shields.io badges (built with HTML, MIT, GitHub Pages live)
- **Submeter pra awesome lists:** awesome-operations, awesome-fintech-tools, awesome-marketplace-tools
- **Cross-link from your profile:** garantir que o pinned repo do everpaula/everpaula linka claramente

**Esforço:** 2h.

### 4. Author E-E-A-T page (impacto: médio · esforço: médio)

Cria uma página `/about.html` (ou enhance o block "About" no index) com:
- Bio detalhada do Everton (sem nomear empregadores específicos por causa da regra do toolkit ser PUBLIC artifact)
- Links pra LinkedIn, GitHub, Twitter (se ativo)
- "Why I built this" narrative
- E-E-A-T signal: ano de início, propósito, sem promessas inflacionadas

**Esforço:** 2-3h.

---

## Marketing pra job search (objetivo principal)

O toolkit serve principalmente como portfolio piece. Próximos movimentos pra amplificar pra recruiters:

### 1. Pin no LinkedIn Featured section
Todos os 9 tools deveriam aparecer no Featured do LinkedIn de Everton, com 1-2 frases cada explicando o problema operacional que resolvem. Já tá feito em parte? Verificar.

### 2. Email signature
Adicionar link pra toolkit em assinatura de email profissional: "Open-source ops calculators: github.com/everpaula/marketplace-ops-toolkit"

### 3. Recruiter outreach reference
Em todas as conversas com recruiters Director/VP Ops:
- "I publish open-source calculators for the operational decisions I built solutions for"
- Link visível
- 9 tools = 9 mini-portfolio pieces de domínio diferente (fraud, supply chain, workforce, vendor, driver)

### 4. Job application body
Em cada cover letter ou application, include 1 sentence + link to relevant toolkit page. Ex: applying pra Director Fraud Ops → reference agent-roi.html + bin-monitor.html + chargeback-sop.html

---

## Métricas pra acompanhar

- **GitHub stars** (target: +10/mês primeiro 3 meses)
- **GitHub Pages traffic** (Google Analytics via tag)
- **LinkedIn post engagement** nos tool launches
- **Recruiter mentions** ("I saw your toolkit on...")
- **Backlinks** via Ahrefs free tier

---

## O que NÃO mexer

- ❌ Não mude domain (everpaula.github.io). GitHub Pages é credible signal.
- ❌ Não adicione tracking pesado (já tem reputation como "open source, no tracking" — manter)
- ❌ Não adicione paywalled "premium tools" — defeats purpose
- ❌ Não use HowTo schema (deprecated Set/2023)
- ❌ Não use FAQPage schema (Google Aug/2023 restriction)

---

*Roadmap gerado 2026-05-23 pós-SEO pass. Próxima revisão em 6 semanas.*
