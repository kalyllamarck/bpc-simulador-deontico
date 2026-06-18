# `dominios/decisao` — justificação (MacCormick)

Estrutura a **justificação** da decisão segundo Neil MacCormick, sem decidir o mérito:

1. **1ª ordem (dedutiva):** se o caso cabe no silogismo, a conclusão decorre direto.
2. **2ª ordem:** quando o silogismo não fecha, três portões filtram a admissibilidade —
   **universalizabilidade**, **consistência** e **coerência**.

- `maccormick_justificacao.py` — monta o silogismo e avalia os três portões.
- Prova em `tests/test_maccormick_justificacao.py`.

A IA não "salva" decisão que falha nos portões: persistindo a indeterminação, o caso escala para
o estudo social (DC-09, DC-14).
