# Corpus de validação — sentenças reais de BPC

Aqui entram as **5 sentenças** que deram convergência 5/5 (e outras que forem testadas).

Para cada sentença, o ideal é um par:
- `NNN-sentenca.txt` — o texto da valoração de provas (ou o trecho relevante).
- `NNN-gabarito.json` — o resultado real (concedido/negado) + os dados objetivos
  (renda per capita, idade/deficiência, impedimento) + qual placeholder cada prova alimenta.

Isso vira fixture do teste: o sistema roda a norma deôntica sobre os dados e checa se
**aproxima ou afasta** da decisão real. Um pytest decide passa/falha (a IA não decide).

> [A CONFIRMAR] Kalyl: colar as 5 sentenças aqui.
