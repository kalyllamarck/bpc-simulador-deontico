# BPC Deôntico — simulador de norma jurídica em código auditável

Converter a norma do **BPC** em **código deôntico** (lógica formal + IA só no resíduo
valorativo), testar contra **decisões reais**, e simular o **impacto** de mudanças na norma
sobre o orçamento e o equilíbrio do art. 201 da CF.

> Tese: toda norma pode ser determinística se juntar **camada deôntica** (silogismo binário) +
> **interpretação semântica por IA** (Alexy/Müller/MacCormick), acionada só quando o silogismo
> não fecha. A IA interpreta; a camada deôntica **decide**.

## Por onde começar
1. `HANDOFF-CHAT-DEDICADO.md` — plano de paralelização e pendências. **Leia primeiro.**
2. `dominios/norma/NORMA-DEONTICA-BPC.md` — a norma já em 7 regras deônticas.
3. `pesquisa/` — SPEC + as 3 frentes do conselho (deôntica, UX, impacto).

## Mapa (orientado a domínios)
- `dominios/norma/` — a norma deôntica (7 regras) e sua conversão pra AppScript.
- `dominios/valoracao/` — Tela 1: placeholders + prompts + validação híbrida.
- `dominios/impacto/` — Tela 2: calculadora de impacto + semáforo art. 201.
- `ui/` — tela única de teste, identidade ObservaSocial.
- `fixtures/sentencas-bpc/` — corpus de sentenças reais (validação 5/5).
- `pesquisa/` — pesquisa do conselho.

## Princípios (herdados)
KISS · IA nunca decide o gate · validação determinística reusa `oficina/hibrido.py`.
