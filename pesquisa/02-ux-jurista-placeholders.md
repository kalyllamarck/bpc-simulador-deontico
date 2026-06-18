# F2 — Interface para o jurista, placeholders e validação

> **Conselheiro 2 (Opus).** Frente F2 do simulador deôntico do BPC.
> **Tese herdada:** a IA INTERPRETA e VALORA a prova; ela NUNCA decide o gate. Quem decide é a
> camada deôntica (função pura `decidir()` em `src/oficina/hibrido.py`).
> **Princípio de UX:** o jurista trabalha em linguagem de jurista. Zero jargão de programação.
> "Placeholder" some da tela — vira "campo a preencher". "Escore" some — vira "grau (de 0 a 10)".

---

## 0. Visão de uma frase

O jurista entrega uma sentença de BPC (ou descreve as provas dela com suas palavras). O sistema
mostra **os 4 campos do código deôntico** já preenchidos, separa o que é **objetivo** (número,
data, valor — preenchimento manual, sem IA) do que é **subjetivo** (grau de limitação,
miserabilidade, vulnerabilidade — valorado pela IA com 5 leituras que precisam concordar), e ao
final diz **se a simulação bate com a decisão real** (aproxima/afasta), de forma auditável.

---

## 1. Os dois modos de entrada (UX passo a passo)

Os dois modos chegam no MESMO lugar: **a Ficha de Valoração** (os 4 placeholders preenchidos +
o grau valorado de cada prova subjetiva). A diferença é só COMO se chega lá.

### Modo A — "Tenho a sentença" (colar trechos)
Para quando o jurista TEM o texto da sentença e quer auditar a valoração que o juiz fez.

1. **Colar.** Uma caixa grande: "Cole aqui os trechos da sentença que falam das provas
   (laudo, perícia, estudo social, renda, residência)." Aceita o texto inteiro; não precisa
   recortar fino.
2. **O sistema separa as provas.** A IA lê e DESTACA, no próprio texto colado, onde está cada
   prova (laudo médico, CadÚnico/renda, estudo social, fotos/descrição da casa). O jurista vê
   marcações coloridas — confirma ou corrige "isto aqui é o laudo", "isto é a renda".
3. **Campos objetivos saltam pré-preenchidos.** Número do CadÚnico, valor da renda per capita,
   CID, data do laudo: a IA SUGERE, o jurista CONFIRMA (nunca aceita cego — ver §3).
4. **Campos subjetivos são valorados.** A IA lê o trecho e propõe um grau (0 a 10) para: grau
   de limitação, miserabilidade, vulnerabilidade interseccional — SEMPRE com a frase da
   sentença que justifica (citação literal). Roda 5×; só mostra se as 5 concordam (§4).
5. **Ficha pronta → simula.** O sistema roda o código deôntico e diz: concede / nega, e
   **se isso bate com o que a sentença real decidiu** (§5).

### Modo B — "Não colei a sentença, vou descrever" (guiar pelo sentimento)
Para quando o jurista quer simular a partir do que ELE achou das provas (audiência, memória,
caso hipotético). Aqui o sistema PRECISA listar quais provas existem e conduzir.

1. **Checklist de provas.** O sistema mostra a lista fechada de provas do BPC e pergunta, uma a
   uma: "Existe laudo médico/perícia? (sim/não)", "Tem CadÚnico ou comprovante de renda?",
   "Houve estudo social / visita?", "Há descrição ou foto da residência?". Só abre o campo da
   prova que existe.
2. **Para cada prova que existe, uma pergunta em linguagem natural.** Ex. (limitação):
   "Com suas palavras, o quanto a doença impede a pessoa de trabalhar e se sustentar?" O
   jurista escreve livre. A IA NÃO inventa nota — ela LÊ a descrição do jurista e propõe o grau,
   devolvendo a frase do próprio jurista que sustenta a nota (§3).
3. **Objetivos são digitados.** Renda, nº de pessoas na casa, CID, data: campos de formulário
   normais (sem IA).
4. **Ficha pronta → simula.** Igual ao Modo A, passo 5. (No Modo B não há "decisão real" para
   comparar, a não ser que o jurista informe o resultado esperado — aí entra como teste.)

**Regra de ouro dos dois modos:** o jurista vê SEMPRE, lado a lado, [o que ele/o juiz escreveu]
× [o grau que a IA propôs] × [a frase que justifica]. Pode sobrescrever qualquer grau na mão —
e essa sobrescrita fica registrada como "valoração do jurista" (auditoria).

---

## 2. Os 4 placeholders — o que é manual × o que a IA infere

Mapa rápido. "Manual" = jurista digita/confirma, sem IA. "IA valora" = propositor 5× + convergência.

| Placeholder | Campos OBJETIVOS (manuais) | Conteúdo SUBJETIVO (IA valora) | Saída p/ o deôntico |
|---|---|---|---|
| `{{CadÚnico}}` | nº NIS, nº pessoas no grupo familiar, renda total, renda per capita, data de referência | — (nenhum: é puro dado) | renda per capita ÷ salário mínimo → fração (objetivo) |
| `{{Atestado Médico}}` | CID, data, médico/perito, "longo prazo? (≥2 anos)" | **grau de limitação** (0–10): quanto o impedimento barra trabalho e vida independente | grau de limitação convergido |
| `{{Descrição da residência}}` | — | descrição livre (do jurista ou do juiz); a IA EXTRAI sinais de precariedade | sinal de precariedade (entra na vulnerabilidade) |
| `{{Condições socioeconômicas + vulnerabilidades interseccionais}}` | região, zona (urbana/rural), composição do grupo (idosos, crianças, deficientes) | **miserabilidade** e **vulnerabilidade interseccional** (0–10 cada) | grau de miserabilidade + grau de vulnerabilidade convergidos |

### Detalhe de cada um

**`{{CadÚnico}}` — 100% objetivo, zero IA.** É o dado duro da renda. O sistema só calcula a
fração `renda per capita / salário mínimo` (o critério do art. 20, §3º da LOAS — 1/4 do SM, hoje
discutido até 1/2 pela jurisprudência). NÃO pedir IA aqui: número é número. A IA pode no máximo
SUGERIR os valores a partir do texto colado (Modo A), mas o jurista confirma.

**`{{Atestado Médico}}` — objetivo (CID, data, "longo prazo") + valoração do grau de limitação.**
O "impedimento de longo prazo" (≥2 anos) é objetivo: tem ou não tem. O **grau de limitação** é o
resíduo valorativo — a IA lê o laudo e reproduz FIELMENTE o quanto a pessoa está limitada, sem
diagnosticar nada novo. Ancorar numa escala conhecida ajuda a convergir (ver §3, escala-âncora).

**`{{Descrição da residência}}` — descrição livre, IA extrai precariedade.** Não tem campo
objetivo próprio; é texto. A IA tira sinais ("chão de terra", "sem saneamento", "alagamento") e
soma à vulnerabilidade. Saída: um sinal 0–10 de precariedade habitacional.

**`{{Condições socioeconômicas + vulnerabilidades interseccionais}}` — o mais subjetivo.** Junta
ambiência sociogeográfica-econômica (Bourdieu/Müller, conforme a tese do artigo BPC) com
interseccionalidade (raça, gênero, idade, deficiência somadas). A IA propõe **dois** graus:
miserabilidade e vulnerabilidade interseccional. Objetivos de apoio (região, zona, composição)
são manuais e servem de contexto para a IA não alucinar.

---

## 3. Templates de prompt — para VALORAR prova, não para decidir

Princípio: cada prompt devolve o sinal estruturado que o `Propositor` de `hibrido.py` já espera —
**escore (0–1), justificativa obrigatória, bit**. Na tela vira "grau 0–10" (escore×10). Todo
prompt roda a **temperatura 0**, **5 vezes**. Regras comuns a todos:

- **Só valora o que está no texto.** Proibido inferir além do escrito. Se não há base, escore =
  indeterminado → escala humana (não chuta).
- **Justificativa = citação literal.** A IA tem de devolver a(s) frase(s) exata(s) do laudo/
  sentença/descrição do jurista que sustentam a nota. Sem citação, a proposta é descartada.
- **Escala-âncora.** Para cada grau, o prompt traz uma régua de 3–4 pontos com exemplos
  concretos. Isso é o que faz as 5 leituras CONVERGIREM (reduz a amplitude < epsilon).
- **A IA nunca diz "concede/nega".** Ela só descreve o grau. A decisão é do `decidir()`.

### Template 1 — Grau de limitação (placeholder Atestado Médico)
```
PAPEL: Você lê laudos/perícias e MEDE o grau de limitação descrito. Você NÃO diagnostica,
NÃO decide benefício. Só reproduz, em nota, o que o texto afirma.
TEXTO: <<trecho do laudo ou descrição do jurista>>
RÉGUA (devolva o ponto mais fiel ao texto):
  0,0–0,3  limitação leve: trabalha com adaptação, vida independente.
  0,4–0,6  limitação moderada: restrição relevante a trabalho; precisa de apoio parcial.
  0,7–0,9  limitação grave: impede trabalho habitual; dependência significativa.
  1,0      limitação total: incapaz para trabalho e atos da vida independente.
DEVOLVA JSON: {"escore": <0-1>, "bit": <true se ≥0,7 (grave/total)>,
  "justificativa": "<frase(s) LITERAL(is) do texto que sustentam a nota>"}
SE o texto não permitir medir: {"escore": null, "justificativa": "sem base no texto"}.
```

### Template 2 — Miserabilidade (placeholder Condições socioeconômicas)
```
PAPEL: Você MEDE o grau de miserabilidade descrito no estudo social / na descrição.
NÃO decide o benefício. A renda formal NÃO é seu objeto (isso é o CadÚnico, objetivo);
aqui você valora a privação concreta DESCRITA (alimentação, moradia, acesso a serviços).
TEXTO: <<estudo social / descrição do jurista / descrição da residência>>
RÉGUA:
  0,0–0,3  privação baixa: necessidades básicas atendidas.
  0,4–0,6  privação relevante: faltas recorrentes em itens essenciais.
  0,7–1,0  privação extrema: insegurança alimentar, moradia precária, sem serviços.
DEVOLVA JSON: {"escore","bit": <true se ≥0,7>, "justificativa": "<citação literal>"}.
```

### Template 3 — Vulnerabilidade interseccional (mesmo placeholder)
```
PAPEL: Você MEDE como vulnerabilidades SE SOMAM (raça, gênero, idade, deficiência, território,
violência). NÃO decide. Quanto mais eixos sobrepostos e agravantes, maior o grau.
TEXTO + CONTEXTO OBJETIVO: <<descrição>> | região=<>, zona=<>, composição=<>
RÉGUA:
  0,0–0,3  um eixo isolado, sem agravante.
  0,4–0,6  dois eixos somados OU um eixo com agravante territorial/violência.
  0,7–1,0  múltiplos eixos sobrepostos e agravados.
DEVOLVA JSON: {"escore","bit": <true se ≥0,7>, "justificativa":
  "<eixos identificados + citação literal de cada um>"}.
```

### Template 4 — Precariedade habitacional (placeholder Descrição da residência)
```
PAPEL: Você EXTRAI sinais de precariedade da moradia descritos no texto. NÃO decide.
RÉGUA: 0 = moradia adequada ... 1,0 = insalubre/risco (terra, sem água/esgoto, alagamento).
DEVOLVA JSON: {"escore","bit": <true se ≥0,6>, "justificativa": "<sinais citados literalmente>"}.
```

> Esses 4 prompts devolvem exatamente `Proposta(escore, justificativa, bit)`. Plugam direto no
> `Propositor` de `hibrido.py` sem mudar o contrato.

---

## 4. Protocolo de validação/convergência — reusando `hibrido.py`

O `hibrido.py` já É o protocolo. Não criar outro. Cada placeholder subjetivo passa pelo mesmo
fluxo de 3 camadas:

1. **PROPOSITOR (IA), 5×, temp 0.** Cada prompt do §3 vira um `Propositor`. `rodar(propositor,
   prompt, texto, n=5)` devolve 5 `Proposta`.
2. **CONVERGÊNCIA (determinística).** `avaliar_convergencia` com `epsilon=0,15` (amplitude máx-mín
   dos escores) e `limiar_bits=0,80` (≥4 de 5 bits iguais). Convergiu → **mediana** dos escores +
   bit majoritário. Não convergiu → **indeterminação valorativa → escalada para estudo social**
   (DC-09: o caso sobe ao estudo social, externo ao sistema, e fica registrado como tal).
3. **DEÔNTICO (função pura `decidir(escore, limiar)`).** Recebe só números, sem rede. É o único
   ponto que vira o grau em flag (ex.: limitação satisfeita? miserabilidade satisfeita?).
   Os limiares de cada eixo são **constantes auditáveis** (overlay em `regras/*.json`, mesma
   filosofia do harness), NUNCA escolhidos pela IA.

**Na tela do jurista isso aparece simples:** uma luz verde "as 5 leituras concordaram" ou amarela
"as leituras divergiram — confira você mesmo". Ele nunca vê epsilon nem mediana; vê "concordância
forte/fraca" e a justificativa.

### Como medir "aproxima / afasta" da decisão real (a convergência 5/5 do Kalyl)

O teste 5/5 é: rodar o simulador sobre N sentenças reais cujo RESULTADO já se conhece (concedeu /
negou) e ver se o `decidir()` final BATE com o juiz. Para tornar isso **auditável e
determinístico-no-gate**:

- **Cada sentença vira um fixture** (como `tests/fixtures/reais/`): texto + objetivos + o
  resultado real (concedeu/negou) + a JUSTIFICATIVA do juiz por eixo, se houver.
- **Caminho do gate é mockado.** Igual ao harness: nos testes o `Propositor` é um `MockProposer`
  com os escores já fixados (capturados de uma rodada LLM real anterior). Assim o teste de
  convergência roda **sem rede**, reprodutível. O LLM real só roda sob a flag `llm_real` (nightly),
  para RECAPTURAR os escores quando o prompt muda.
- **Métrica objetiva "aproxima/afasta":** dois números por sentença:
  1. **Acerto do resultado** (bit): simulador concedeu = juiz concedeu? (sim/não). O "5/5" é
     5 sentenças, 5 acertos.
  2. **Distância de valoração** (escore): |grau do simulador − grau lido na sentença do juiz|,
     por eixo. Perto de 0 = "aproxima"; grande = "afasta", mesmo que o resultado final tenha
     batido por sorte. Isso mostra se a lógica acertou pelos motivos certos.
- **Gate determinístico:** um teste pytest que roda os N fixtures e EXIGE acerto de resultado =
  100% (ou o piso que o Kalyl fixar) e distância média ≤ um limiar. Falhou → vermelho, igual ao
  `oficina lint`. A IA não opina; o pytest decide.

---

## 5. Ligação com o resto do produto

- **Saída da Tela 1 → entrada da Tela 2.** A Ficha de Valoração preenchida (os 4 placeholders +
  graus convergidos) é o "estado atual" que a Tela 2 (frente F3) vai manipular para simular o
  impacto da mudança de norma.
- **Reuso direto:** `src/oficina/hibrido.py` (Proposta, rodar, avaliar_convergencia, decidir) e a
  filosofia de `regras/*.json` (limiares auditáveis) e `tests/fixtures/reais/` (corpus).
- **Não reinventar docx:** se a sentença vier em .docx, usar o extractor/playbook já consolidado
  em `INSUMOS-CHAT-EDUARDO.md`.

---

## 6. Itens [A CONFIRMAR] (precisam do Kalyl / do conselho)

- **[A CONFIRMAR]** Os limiares de cada eixo (limitação, miserabilidade, vulnerabilidade) e como
  o deôntico COMBINA os 4 placeholders na decisão final (E lógico? pesos à la Alexy? hoje o
  `decidir()` é corte fixo simples — v1).
- **[A CONFIRMAR]** Critério de renda do CadÚnico: 1/4 do SM (lei) ou 1/2 (jurisprudência) — é
  parâmetro objetivo, mas precisa ser uma constante auditável escolhida pelo Kalyl.
- **[A CONFIRMAR]** Quais são as N sentenças do teste 5/5 (o corpus de validação) — vira fixtures.
- **[A CONFIRMAR]** No Modo B, sem sentença real, como o jurista informa o "resultado esperado"
  para que vire teste (ou se Modo B é só exploratório, sem gate).
- **[A CONFIRMAR]** Onde mora o sistema: este repo (reusando hibrido.py direto) ou projeto novo
  forkado de nemesis-base que IMPORTA esse módulo.
- **[A CONFIRMAR]** Tela: web (React + lsa-ui) confirmado? Os "campos a preencher" e o "lado a
  lado [texto]×[grau]×[justificativa]" precisam de componente próprio.
