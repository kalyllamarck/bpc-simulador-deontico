# Fixtures de valoração — SLOT (a confirmar)

Aqui entram as **5 sentenças reais** do teste 5/5 (ver `pesquisa/02 §4`).

Cada sentença vira um fixture com:
- **texto** — os trechos das provas (laudo, estudo social, renda, residência);
- **gabarito** — o resultado real do juiz: `concede` / `nega`;
- **objetivos** — renda per capita, nº pessoas no grupo, CID, "longo prazo? (≥2 anos)";
- **escores capturados** — os graus de uma rodada LLM real (viram a `Proposta` fixa do
  `MockProposer`, para o gate rodar sem rede e reprodutível).

O teste 5/5: o `decidir()` final BATE com o juiz nas 5 sentenças (acerto 100%) e a distância
de valoração por eixo fica baixa ("aproxima"). LLM real só sob `-m llm_real` (nightly), para
RECAPTURAR escores quando o prompt muda.

> **[A CONFIRMAR]** Kalyl cola as 5 sentenças (texto + gabarito + objetivos).
