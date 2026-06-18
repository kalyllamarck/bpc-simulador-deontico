# F1 — Formalização deôntica do BPC (norma → lógica → código)

> **Conselheiro 1 (Opus).** Frente F1 da `SPEC-SIMULADOR-DEONTICO-BPC.md`.
> Caso de teste: critério de elegibilidade do BPC (LOAS, Lei 8.742/93, art. 20;
> arts. 203, V e 201 da CF). Data: 2026-06-18.
>
> **Tese que esta frente serve:** a norma tem duas camadas. Uma **formal** (silogismo
> binário, lógica deôntica clássica) e um **resíduo valorativo** interpretado por LLM com
> método de argumentação jurídica (Alexy, Müller, MacCormick), acionado **só** quando o
> silogismo dedutivo não fecha. A IA **nunca** decide o gate. Ela interpreta; a camada
> deôntica decide.

---

## 0. Resumo da decisão (para quem não vai ler tudo)

- **Formalismo recomendado: Lógica Deôntica Derrotável (Defeasible Deontic Logic, DDL)**,
  escrita num molde simples inspirado em **LegalRuleML / Catala**. Não usar Lógica Deôntica
  Padrão (SDL) sozinha: ela não sabe lidar com exceção, e a norma do BPC é toda feita de
  regra + exceção.
- **A norma vira regras "SE… ENTÃO O/P/F"** (Obrigatório / Permitido / Proibido), com
  algumas regras marcadas como **derrotáveis** (valem "em princípio", até prova em contrário).
- **A fronteira é clara:** renda per capita, deficiência atestada e prazo de impedimento são
  **objetivos** (o computador decide sozinho). **Miserabilidade** é **resíduo valorativo** (a
  máquina sozinha não fecha; o LLM interpreta e propõe, a função determinística grava).
- **AppScript:** cada regra vira uma `function` que devolve `true/false/INDETERMINADO`. As
  partes valorativas viram **placeholders** que o LLM preenche com um escore + justificativa,
  mas a decisão final é uma `if` determinística.

Isto bate com a própria tese do artigo, que ancora a camada fechada em Hohfeld/Bobbio
(`D(p→q)`), localiza o limite da formalização em Prakken & Sartor (raciocínio não-monotônico)
e em Catala/Mérigoux (o "negativo" da codificação: o que exige *human appreciation*), e
estrutura o resíduo com Alexy (fórmula do peso que **expõe**, não decide), MacCormick e Müller.

---

## 1. Qual formalismo usar (e por quê)

Comparo três candidatos. KISS: a coluna que importa é "sabe lidar com exceção?".

| Formalismo | O que é (em 1 frase) | Sabe exceção? | Bom para BPC? |
|---|---|---|---|
| **SDL — Lógica Deôntica Padrão** | A lógica clássica de Obrigatório/Permitido/Proibido (`O`, `P`, `F`). | **Não.** É monotônica: acrescentar um fato nunca derruba uma conclusão. | **Não sozinha.** A norma do BPC é regra-geral + exceção (renda > ¼ SM, *mas* há precedente que afasta). SDL trava nisso. |
| **DDL — Lógica Deôntica Derrotável** | SDL + regras que valem "em princípio" e podem ser **derrotadas** por exceção/prova em contrário. | **Sim**, é o ponto dela (non-monotonic). | **Sim.** Modela "em princípio inelegível, salvo se a miserabilidade for demonstrada" naturalmente. |
| **Carneades / ASP (answer-set)** | Frameworks de **argumentação** com ônus da prova e "perguntas críticas"; ASP é o motor de execução. | Sim, e ainda modelam **ônus da prova**. | **Sim, mas pesado.** Excelente teoricamente; complexo demais para AppScript e para um jurista editar. Fica como referência, não como base. |

**Justificativa (2 linhas, textura aberta):** normas de textura aberta (Hart) exigem um
formalismo que admita conclusões provisórias e derrotáveis por novos fatos; SDL é monotônica
e quebra, então adoto **DDL**, que modela exceção e prova em contrário sem abandonar os
operadores deônticos `O/P/F`.

**LegalRuleML e Catala** entram como **vocabulário/estilo de escrita**, não como motor:
LegalRuleML é o padrão que já casa DDL + operadores deônticos + temporalidade das normas;
Catala é a linguagem francesa que codifica lei separando explicitamente o que **exige
apreciação humana** (exatamente o nosso "resíduo valorativo"). Pego deles a disciplina de
escrita; rodo em AppScript por KISS.

Fontes: defeasible deontic logic + LegalRuleML (ICAIL 2025, "Legal Explanation in Defeasible
Deontic Logic via LegalRuleML", https://dl.acm.org/doi/10.1145/3769126.3769257 ; "Practical
Normative Reasoning with Defeasible Deontic Logic",
https://link.springer.com/chapter/10.1007/978-3-030-00338-8_1 ; "Enabling Reasoning with
LegalRuleML", https://arxiv.org/pdf/1711.06128 ); formalização de lei via LLM em DDL
(https://arxiv.org/pdf/2506.08899 ); Carneades ↔ ASP/ASPIC+
(https://doi.org/10.1080/19462166.2012.661766 ; relação Carneades–Defeasible Logic,
Governatori, https://www.semanticscholar.org/paper/9c622c1247b8bee317ad3a2a2dc0d9741f1fa4de ).

---

## 2. Esqueleto deôntico da norma do BPC

### 2.1 Vocabulário (predicados — os "fatos" que o sistema conhece)

Cada predicado é uma pergunta de SIM/NÃO (ou um número) sobre o requerente `x`:

```
idoso(x)                  # tem 65 anos ou mais (art. 20, caput, LOAS)
deficiente(x)             # tem deficiência (art. 20, §2º)
impedimento_longo(x)      # impedimento de natureza física/mental/intelectual/sensorial
                          # com efeitos de longo prazo: >= 2 anos (art. 20, §2º + §10)
renda_per_capita(x) = R   # renda mensal do grupo familiar / nº de membros (art. 20, §3º)
limite_renda            = ¼ do salário mínimo  # critério econômico legal
familia(x) = {...}        # composição do grupo familiar (art. 20, §1º)
miseravel(x)              # situação de miserabilidade / vulnerabilidade efetiva  ← RESÍDUO
acumula_beneficio(x)      # já recebe outro benefício incompatível (art. 20, §4º)
```

### 2.2 Operadores deônticos

- `O(conceder)` — **Obrigatório conceder** (Estado tem o dever).
- `P(conceder)` — **Permitido conceder**.
- `F(conceder)` — **Proibido conceder** (vedado).

A norma do BPC é, no fundo, uma máquina que decide entre `O(conceder)` e `F(conceder)`.

### 2.3 Regras (estilo "SE… ENTÃO", com marca de derrotável)

Uso `=>` para regra **estrita** (sem exceção) e `~>` para regra **derrotável** (vale em
princípio, pode cair). É o coração do DDL.

```
# R1 — porta de entrada: quem é o público (estrita)
R1:  idoso(x) OR deficiente(x)                       => elegivel_subjetiva(x)

# R2 — deficiência só conta com impedimento de longo prazo (estrita)
R2:  deficiente(x) AND NOT impedimento_longo(x)      => F(conceder, x)

# R3 — critério econômico objetivo (estrita): renda dentro do teto satisfaz o critério
R3:  renda_per_capita(x) <= limite_renda             => criterio_economico(x)

# R4 — regra-geral derrotável: renda acima do teto, em princípio, barra
R4:  renda_per_capita(x) >  limite_renda             ~> NOT criterio_economico(x)

# R5 — EXCEÇÃO que derrota R4 (derrotável): miserabilidade comprovada salva
#       (alinhada à jurisprudência: o ¼ SM é presunção relativa, não teto absoluto)
R5:  renda_per_capita(x) >  limite_renda AND miseravel(x)  ~> criterio_economico(x)
     # prioridade: R5 > R4  (a exceção vence a regra-geral)

# R6 — vedação de acumulação (estrita)
R6:  acumula_beneficio(x)                            => F(conceder, x)

# R7 — conclusão deôntica (estrita)
R7:  elegivel_subjetiva(x) AND criterio_economico(x)
     AND impedimento_longo_ok(x) AND NOT acumula_beneficio(x)  => O(conceder, x)
```

Onde `impedimento_longo_ok(x)` = `idoso(x)` OU (`deficiente(x)` E `impedimento_longo(x)`).

**Leitura jurídica do desenho:** R4 é a regra do "¼ de salário mínimo". R5 é a abertura que a
jurisprudência consolidou (a renda per capita é presunção **relativa** de miserabilidade; pode
ser afastada pela situação concreta). A prioridade **R5 > R4** é o que torna a lógica
**derrotável** — e é exatamente o ponto onde o resíduo valorativo entra: o predicado
`miseravel(x)` não se calcula, **interpreta-se**.

### 2.4 A cláusula aberta — `miseravel(x)`

`miseravel(x)` **não é** uma conta. É um conceito de textura aberta alimentado por quatro
placeholders (os mesmos da Tela 1 da SPEC):

```
miseravel(x)  ⇐  interpretar({
    {{CadÚnico}},                                   # objetivo
    {{Atestado Médico / grau de limitação}},        # objetivo + conteúdo subjetivo fiel
    {{Descrição da residência}},                    # livre
    {{Condições socioeconômicas + interseccionais}} # ambiência / vulnerabilidades
})
```

O `⇐ interpretar(...)` é o **único** ponto em que o LLM atua: ele lê esses campos e devolve um
**escore + justificativa** (não um veredito). A função determinística aplica um limiar e
grava `miseravel(x) = true/false`. Isto materializa "a IA interpreta, a camada deôntica
decide".

---

## 3. Fronteira BINÁRIO × LLM

| Condição da norma | Tipo | Decide quem? | Por quê |
|---|---|---|---|
| Idade ≥ 65 (`idoso`) | Objetiva | **Binário** | Data de nascimento; conta exata. |
| Tem deficiência (`deficiente`) | Objetiva (com laudo) | **Binário** | Existe/não existe laudo; flag. |
| Impedimento ≥ 2 anos (`impedimento_longo`) | Objetiva | **Binário** | Prazo no atestado; comparação de datas. |
| Renda per capita ≤ ¼ SM (`criterio_economico`, R3) | Objetiva | **Binário** | Divisão e comparação numérica. |
| Acumulação de benefício (`acumula_beneficio`) | Objetiva | **Binário** | Consulta de base; flag. |
| Grau de limitação clínica (dentro do laudo) | Misto | **LLM propõe, binário grava** | Texto do laudo precisa ser lido e pontuado. |
| **Miserabilidade** (`miseravel`, R5) | **Valorativa** | **LLM interpreta → binário decide** | Conceito aberto; depende de contexto, moradia, vulnerabilidades interseccionais. |
| Tensão cobertura × equilíbrio (art. 201) | Valorativa (Tela 2) | **LLM expõe peso (Alexy), humano decide** | Ponderação de princípios; fórmula do peso **mostra**, não fecha. |

Regra de ouro: **tudo que é número ou flag = binário; tudo que exige *ler e julgar texto* =
LLM-interpreta-mas-não-decide.** A linha é a mesma de Catala/Mérigoux (*human appreciation*).

---

## 4. Mapeamento para Google AppScript

Tradução direta: **1 regra deôntica → 1 função**. Cada função devolve `true`, `false` ou a
constante `INDETERMINADO` (quando depende do resíduo ainda não preenchido).

```javascript
// ---- Camada OBJETIVA (puro determinístico) ----
const LIMITE_RENDA = SALARIO_MINIMO / 4;   // critério econômico legal

function elegivelSubjetiva(x) {            // R1
  return idoso(x) || deficiente(x);
}

function impedimentoLongoOk(x) {           // R2 (forma positiva)
  return idoso(x) || (deficiente(x) && impedimentoLongo(x));
}

function criterioEconomicoObjetivo(x) {    // R3 / R4
  return rendaPerCapita(x) <= LIMITE_RENDA;
}

// ---- Camada VALORATIVA (placeholder preenchido por LLM, decisão determinística) ----
function miseravel(x) {                     // alimenta R5
  // escore: número 0..1 que o LLM PROPÔS lendo os 4 placeholders. NÃO é veredito.
  const escore = LLM_escoreMiserabilidade({
    cadUnico:        x["{{CadÚnico}}"],
    atestado:        x["{{Atestado Médico}}"],
    residencia:      x["{{Descrição da residência}}"],
    socioeconomico:  x["{{Condições socioeconômicas + vulnerabilidades}}"]
  });
  // A DECISÃO é esta linha determinística — não o LLM:
  const LIMIAR = 0.5;                       // [A CONFIRMAR] calibrar com as 5 sentenças
  return escore >= LIMIAR;
}

// ---- Regra derrotável R4 vs R5 (exceção vence a regra-geral) ----
function criterioEconomico(x) {            // R3 + R4 + R5 com prioridade R5 > R4
  if (criterioEconomicoObjetivo(x)) return true;        // R3
  if (miseravel(x))                 return true;        // R5 derrota R4
  return false;                                         // R4
}

// ---- Conclusão deôntica O(conceder) (R6 + R7) ----
function decidirBPC(x) {
  if (acumulaBeneficio(x))     return "F_CONCEDER";     // R6 (vedação)
  if (!elegivelSubjetiva(x))   return "F_CONCEDER";
  if (!impedimentoLongoOk(x))  return "F_CONCEDER";     // R2
  if (!criterioEconomico(x))   return "F_CONCEDER";
  return "O_CONCEDER";                                  // R7: obrigatório conceder
}
```

Padrões de codificação:
- **Cada `if` é uma regra**; a ordem das `if` codifica a **prioridade** das regras
  (exceção testada antes da regra-geral, vedação testada primeiro).
- **`LLM_escoreMiserabilidade` é o único ponto de IA.** Ela só devolve número + texto; quem
  decide é o `escore >= LIMIAR`. Trocar o LLM não muda quem decide.
- **Placeholders `{{...}}`** são colunas da planilha; a Tela 1 da SPEC os preenche.
- **Auditável:** o `.gs` é aberto; cada decisão pode ser rastreada à regra (R1…R7) e ao
  escore + justificativa gravados.

---

## 5. Riscos e limitações honestas

1. **Convergência 5/5 é amostra pequena.** Bate com a jurisprudência testada, mas não prova
   generalidade. Risco de *overfitting* ao corpus. [A CONFIRMAR: quais 5 sentenças.]
2. **O LIMIAR (0.5) é uma escolha política disfarçada de número.** Onde se corta o escore de
   miserabilidade muda quem entra. Tem que ser calibrado com o juiz/jurista e declarado, não
   escondido no código.
3. **Escore numérico de miserabilidade dá falsa aparência de precisão** (a mesma crítica que o
   artigo faz à fórmula do peso de Alexy: ela **expõe**, não mede a verdade). O número é um
   organizador do argumento, não uma medida objetiva.
4. **LLM não é determinístico nem estável** entre versões/execuções. Mitigação: temperatura 0,
   prompt e versão do modelo congelados, e **a decisão nunca é do LLM** — só o escore.
5. **DDL "na mão" em AppScript** não tem motor formal de prova: a prioridade entre regras é
   codificada como ordem de `if`. Funciona para o BPC (poucas regras), mas não escala para
   normas com dezenas de exceções cruzadas — aí seria preciso um motor DDL/ASP de verdade.
6. **Risco constitucional do próprio projeto:** automatizar concessão de direito social pode
   violar individualização e devido processo se o gate virar decisão automática. O desenho
   responde a isso (IA não decide; humano homologa), mas é preciso dizer isso alto.
7. **`impedimento_longo` "≥ 2 anos" é interpretação corrente, não texto literal exato** da
   LOAS — conferir redação vigente do art. 20, §10. [A CONFIRMAR.]

---

## 6. Itens [A CONFIRMAR] (passados ao Kalyl)

- Limiar do escore de miserabilidade (calibrar com as 5 sentenças do teste 5/5).
- Corpus exato das 5 sentenças que deram convergência.
- Redação vigente do art. 20 da LOAS para `impedimento_longo` (prazo) e §§ de acumulação.
- Se a Tela 2 (impacto/art. 201) usa a fórmula do peso de Alexy só para **expor** a tensão
  (recomendado) ou também para ranquear cenários — é fronteira da frente F3.
- Formato do `.gs` atual exportado pelo Kalyl, para casar o esqueleto com o código real.
