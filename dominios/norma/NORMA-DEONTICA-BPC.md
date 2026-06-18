# A norma do BPC em código deôntico — folha de estudo

> Ponto de partida pra estudar **o comportamento deôntico da norma**.
> Base: `pesquisa/01-formalizacao-deontica-bpc.md` (conselho Opus, 2026-06-18).
> Fonte legal: LOAS (Lei 8.742/93), art. 20; CF arts. 203, V e 201.

## Em uma frase
A norma do BPC é uma máquina que decide entre **DEVE conceder** e **NÃO PODE conceder**.
Quase tudo nela é número/flag (decisão binária). **Só um ponto é valorativo**: a
*miserabilidade*. É nele — e só nele — que a IA entra (interpreta e propõe; quem decide é
uma linha determinística).

## As 7 regras (o coração)
Lê-se "SE… ENTÃO". `=>` é regra firme (sem exceção). `~>` é regra que vale **em princípio**
e pode ser derrubada por prova em contrário (é isso que torna a lógica "derrotável").

| # | Regra (SE → ENTÃO) | Tipo | O que significa |
|---|---|---|---|
| R1 | idoso(65+) OU deficiente → entra na porta | firme | quem é o público do BPC |
| R2 | deficiente SEM impedimento ≥2 anos → **NÃO PODE** conceder | firme | deficiência só conta com impedimento de longo prazo |
| R3 | renda per capita ≤ ¼ salário mínimo → critério econômico OK | firme | o critério objetivo de renda |
| R4 | renda per capita > ¼ SM → **em princípio** reprova | derrotável | a regra-geral do ¼ SM |
| R5 | renda > ¼ SM **MAS miserável** → critério econômico OK | derrotável | **a exceção que vence R4** |
| R6 | já acumula benefício incompatível → **NÃO PODE** conceder | firme | vedação de acumulação |
| R7 | porta OK **E** econômico OK **E** impedimento OK **E** sem acumulação → **DEVE conceder** | firme | a conclusão |

**A peça-chave: R5 vence R4.** A jurisprudência diz que o ¼ de salário mínimo é
*presunção relativa* — pode ser afastada pela situação concreta. É exatamente aí que mora
o resíduo valorativo.

## A única porta da IA: `miserável`
`miserável` **não se calcula, interpreta-se**. A IA lê os 4 placeholders e devolve um
**escore (0 a 1) + justificativa** — nunca um veredito. A decisão é uma linha:
`if (escore >= LIMIAR) miserável = verdadeiro`.

Os 4 placeholders (vêm da Tela 1):
- `{{CadÚnico}}` — objetivo, digitado à mão (renda vira número).
- `{{Atestado Médico}}` — objetivo + reproduzir fielmente o subjetivo (grau de limitação).
- `{{Descrição da residência}}` — texto livre.
- `{{Condições socioeconômicas + vulnerabilidades interseccionais}}` — ambiência.

## O que é binário e o que é IA
- **Binário (computador decide sozinho):** idade, existência de laudo, prazo do impedimento,
  renda per capita, acumulação.
- **IA interpreta, binário grava:** grau de limitação do laudo, e a **miserabilidade**.
- **IA expõe, humano decide (Tela 2):** a tensão cobertura × equilíbrio (art. 201).

## O que estudar / decidir na sentença real (corpus 5/5)
Ao ler cada sentença de BPC, mapear:
1. Quais predicados o juiz tratou como objetivos (R1–R3, R6)?
2. Houve R5 (renda acima do teto salva por miserabilidade)? Com base em quê?
3. Onde calibrar o **LIMIAR** do escore pra bater com o resultado real?
4. A justificativa do juiz cabe nos 4 placeholders? Falta algum?

## Pendências [A CONFIRMAR] (do conselho)
- Limiar do escore de miserabilidade (calibrar com as 5 sentenças).
- Quais são as 5 sentenças do teste 5/5.
- Redação vigente do art. 20, §10 da LOAS (prazo do impedimento).
- Formato do `.gs` atual exportado pelo Kalyl (casar com este esqueleto).
