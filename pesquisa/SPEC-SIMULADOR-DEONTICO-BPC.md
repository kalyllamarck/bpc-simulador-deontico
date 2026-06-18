# SPEC — Simulador Deôntico do BPC (norma → lógica → código → teste → impacto)

> **Status:** ESQUELETO (2026-06-18). Preenchido pelo conselho de 3 Opus.
> **Apresentação:** 26/06/2026 — ObservaSocial (Prof. Eduardo Dias).
> **Tese (artigo em curso):** toda norma jurídica pode ser determinística desde que
> combine **camada deôntica** (silogismo formal, binário) + **camada de interpretação
> semântica por IA** (resíduo valorativo via LLM: Alexy, Müller, MacCormick).
> Caso de teste: critério de renda do **BPC** (LOAS, Lei 8.742/93; arts. 203, V e 201, CF).

---

## 0. Por que existe
Reformas previdenciárias miram equilíbrio atuarial (art. 201, CF) mas, ao aprovarem
normas regressivas às pressas, cruzam a fronteira da constitucionalidade e geram
**colateral reverso** (gasto maior). Hipótese: se a norma virar **código deôntico
auditável**, dá pra (a) antever incompatibilidades (inconstitucionalidade/ilegalidade)
e (b) prever impacto sobre o equilíbrio do seguro social, ANTES da norma entrar.

## 1. O método (o que provar)
Converter uma norma em código deôntico em duas passagens:
1. **Norma → linguagem de lógica** (deôntica), motivando cada estrutura escrita.
2. **Lógica → linguagem computacional** (Google AppScript), motivando cada estrutura.
3. **Testar contra decisões reais** (sentenças de BPC): se converge → a lógica está
   correta; se diverge → corrigir. Kalyl já obteve **convergência 5/5**.

## 2. As telas (produto)
### Tela 1 — Auditoria/valoração (jurista, sem jargão de programação)
- **Modo A:** jurista cola **trechos de valoração de provas** de uma sentença de BPC.
- **Modo B:** jurista **descreve o próprio sentimento** sobre as provas — o sistema
  então precisa **listar quais provas existem** e guiar o preenchimento.
- O sistema recebe o que é **objetivo** (parte objetiva da norma) e usa **prompts**
  para popular os **placeholders** subjetivos do código deôntico completo:
  - `{{CadÚnico}}` — dados objetivos, preenchimento manual.
  - `{{Atestado Médico}}` (impedimento de longo prazo) — dados objetivos + reproduzir
    fielmente o conteúdo subjetivo (ex.: grau de limitação).
  - `{{Descrição da residência}}` — descrição livre (do jurista ou do juiz).
  - `{{Condições socioeconômicas + vulnerabilidades interseccionais}}` — ambiência
    sociogeográfica-econômica, contexto de vulnerabilidades.

### Tela 2 — Simulador de impacto (constitucionalidade da MUDANÇA)
- Jurista **manipula o código deôntico vigente** e propõe alterações
  (canvas/grafo infinito? — em aberto).
- O sistema estima se a alteração causa **maior/menor impacto** sobre o **orçamento
  primário** pago pela assistência social ao BPC (ano passado) e **alerta** violação
  do equilíbrio atuarial e intergeracional (art. 201, CF).
- Requer mapear **como cada pedaço da norma** aumenta/diminui concessões e estimar
  impacto financeiro com dados do **INSS (BEPS)**.

## 3. Frentes de pesquisa (conselho 3 Opus) → arquivos
- **F1 — Formalização deôntica:** `research/2026-06-18-formalizacao-deontica-bpc.md`
- **F2 — UX jurista + placeholders + validação:** `research/2026-06-18-ux-jurista-placeholders.md`
- **F3 — Simulador de impacto + art. 201:** `research/2026-06-18-simulador-impacto-art201.md`

## 4. Decisões em aberto [A CONFIRMAR]
- Escopo para 26/06 (artigo só / artigo + demo passos 1-3 / visão completa).
- Onde mora o sistema (este repo / projeto novo forkado de nemesis-base).
- Fonte do AppScript atual (Kalyl exporta o `.gs`?).
- Quais sentenças de BPC formaram o teste 5/5 (corpus de validação).
- Canvas/grafo da Tela 2 (biblioteca? formato do código deôntico editável?).

## 5. Insumos existentes
- AppScript publicado: script.google.com/macros/.../exec (código aberto, auditável).
- Artigo-tese: "Artigo - Conversão de norma sustentável em linguística computacional.docx".
- Artigo BPC em curso: `tests/fixtures/reais/artigo-bpc.docx`.
- Harness Oficina (este repo) — gate determinístico já calibrado.
