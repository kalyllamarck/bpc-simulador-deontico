# AppScript — Norma deôntica do BPC

`.gs` e Python são a **mesma norma**, escrita em duas linguagens.

## Mapa regra → função .gs → função Python

| Regra | O que faz (1 linha) | Função `.gs` (`bpc.gs`) | Função Python (`bpc.py`) |
|-------|---------------------|-------------------------|--------------------------|
| R1 | Porta subjetiva: idoso OU deficiente | `elegivelSubjetiva(x)` | `elegivel_subjetiva(x)` |
| R2 | Deficiente precisa de impedimento longo prazo | `impedimentoLongoOk(x)` | `impedimento_longo_ok(x)` |
| R3 | Renda ≤ ¼ SM satisfaz critério econômico (estrita) | `criterioEconomicoObjetivo(x)` | `criterio_economico_objetivo(x)` |
| R4 | Renda > ¼ SM barra em princípio (derrotável) | parte de `criterioEconomico(x)` | parte de `criterio_economico(x)` |
| R5 | Miserabilidade comprovada derrota R4 (exceção vence) | parte de `criterioEconomico(x)` + `miseravel(x)` | parte de `criterio_economico(x)` + `miseravel(x)` |
| R6 | Vedação de acumulação de benefício incompatível | `acumulaBeneficio(x)` | `acumula_beneficio(x)` |
| R7 | Conclusão deôntica O(conceder) quando tudo passa | `decidirBPC(x)` → `"O_CONCEDER"` | `decidir_bpc(x)` → `"O_CONCEDER"` |

## Único ponto de IA

`LLM_escoreMiserabilidade()` — lê os 4 placeholders da Tela 1 e propõe escore 0..1.
A decisão é sempre `if escore >= LIMIAR` (determinístico). O LLM interpreta; o código decide.

## Arquivos

- `bpc.gs` — esqueleto das 7 regras + `decidirBPC` + stub do LLM
- `SLOT-GS-KALYL.md` — instruções para colar o `.gs` real exportado do AppScript
