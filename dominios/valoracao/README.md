# Domínio: Valoração (Tela 1)

Recebe o objetivo do jurista e usa prompts pra **valorar** o subjetivo, populando os 4
placeholders (`{{CadÚnico}}`, `{{Atestado}}`, `{{Residência}}`, `{{Condições socioeconômicas}}`).

Dois modos: (A) jurista cola a sentença → IA separa as provas; (B) jurista descreve seu
sentimento sobre as provas → sistema lista quais provas existem e guia.

A IA devolve `escore + justificativa` (nunca veredito) — pluga no `Propositor` de
`oficina/hibrido.py`. Validação por convergência (5×, epsilon + bits), `decidir()` decide.

**Projeto completo:** `../../pesquisa/02-ux-jurista-placeholders.md`.
