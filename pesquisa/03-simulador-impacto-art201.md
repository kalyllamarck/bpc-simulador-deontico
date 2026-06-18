# F3 — Simulador de Impacto do BPC + Alerta art. 201 (Tela 2)

> Conselheiro 3 (Opus) · 2026-06-18 · Apresentação ObservaSocial 26/06/2026.
> Frente: o jurista mexe no código deôntico VIGENTE do BPC, e o sistema diz se a
> mudança gasta MAIS ou MENOS dinheiro público e ALERTA risco ao art. 201 da CF
> (equilíbrio atuarial e intergeracional).
> Honestidade: marco como **[A CONFIRMAR]** tudo que não validei direto na fonte.

---

## 1. Inventário de dados (fontes reais + links)

### 1.1 Números-âncora do BPC (mais recente que achei)
- **Gasto total 2024: R$ 102,1 bilhões** pagos a **5,8 milhões** de pessoas.
  Fonte: Portal da Transparência / matéria com base nele.
  (Projeção 2025 ≈ R$ 112 bi; em 2019 era R$ 55,3 bi — mais que dobrou em 5 anos.)
- **Estoque de beneficiários**: subiu de 4.651.924 (2018) para 5.710.833 (2023);
  ~5,8 mi em 2024. Maiores estoques: SP (767 mil), MG (475 mil), BA (459 mil). [A CONFIRMAR estoque exato 2024 idoso x deficiência]
- **Valor do benefício**: 1 salário mínimo cheio (R$ 1.412 em 2024). Sem 13º, sem
  pensão a dependente. Isso simplifica MUITO a conta: **valor unitário ≈ 1 SM**.
- **Critério legal (art. 20, Lei 8.742/93)**: renda per capita familiar **≤ 1/4 do
  salário mínimo**; idoso ≥ 65 anos OU pessoa com deficiência com **impedimento de
  longo prazo ≥ 2 anos**.

Links:
- BPC (MDS, regras): https://www.gov.br/mds/pt-br/acoes-e-programas/suas/beneficios-assistenciais/beneficio-assistencial-ao-idoso-e-a-pessoa-com-deficiencia-bpc
- Portal Transparência — comunicado de gastos BPC: http://www.portaldatransparencia.gov.br/comunicados/603478-portal-da-transparencia-divulga-gastos-com-beneficio-de-prestacao-continuada-bpc
- Portal Transparência — download de dados BPC: https://portaldatransparencia.gov.br/download-de-dados/bpc
- Lei 8.742/93 (LOAS), texto: https://www.planalto.gov.br/ccivil_03/leis/l8742.htm

### 1.2 BEPS — Boletim Estatístico da Previdência Social (mensal, INSS/MPS)
É a série mensal oficial de concessões e estoque. O BPC aparece como espécies
**88 (BPC idoso)** e **87 (BPC deficiência)** nas tabelas (espécies 87/88). [A CONFIRMAR códigos exatos no BEPS — o boletim distingue concessão x estoque x valor]
- Página dos boletins: https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/Dados-estatisticos-previdencia-social-e-inss/boletins-da-previdencia-social
- BEPS dez/2024 (PDF): https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/arquivos/beps122024_final.pdf
- BEPS em dados abertos (Base dos Dados): https://basedosdados.org/dataset/e843a98c-051c-42d8-9b40-604d70455a33
- Metadados BEPS (IBGE/CES): https://ces.ibge.gov.br/base-de-dados/metadados/mps/boletim-estatistico-da-previdencia-social-beps.html

Nota técnica: o WebFetch do PDF do BEPS veio como binário ilegível (não dá pra
extrair número direto da web). Para o número fino (concessões/mês de BPC), o
caminho prático é **baixar o CSV do Base dos Dados ou o XLSX do BEPS** e ler local
com pandas. Marco como **[A CONFIRMAR via download]**.

### 1.3 Execução orçamentária (o "orçamento primário pago" que o SPEC pede)
- Portal Transparência — Orçamento: https://portaldatransparencia.gov.br/orcamento
- Tesouro — Execução orçamentária e financeira (SIAFI): http://www.tesouro.fazenda.gov.br/execucao-orcamentaria-e-financeira
- RREO (Relatório Resumido da Execução Orçamentária): https://www.tesourotransparente.gov.br/temas/contabilidade-e-custos/relatorio-resumido-da-execucao-orcamentaria-rreo-uniao

Para a Tela 2 o número que vale como "linha de base" é o **R$ 102,1 bi pago em 2024**
(despesa primária da assistência social com BPC). É esse o "ano passado" do SPEC.

### 1.4 Perfil (etário / deficiência) — para sensibilidade por parâmetro
- Painel "Benefícios ao Cidadão" (Portal Transparência) traz estoque por UF/município.
- Repartição idoso x deficiência e faixa etária fina: **[A CONFIRMAR]** — vem do
  BEPS (espécies 87/88) + microdados do CadÚnico. CadÚnico/MDS dá renda per capita,
  que é exatamente a variável do critério.

---

## 2. Método de estimativa de impacto (o mais simples que funciona)

Ideia central, em palavras: **cada parâmetro da norma é uma "torneira".** Mexer no
parâmetro muda quantas pessoas passam a ter (ou perdem) direito. Impacto em R$ =
variação no nº de benefícios × 1 salário mínimo × 12 meses.

### 2.1 Fórmula base (em palavras)
> **Impacto anual (R$) = (Δ beneficiários) × (1 salário mínimo) × 12**

onde **Δ beneficiários** é estimado pela sensibilidade do parâmetro que o jurista mexeu.

### 2.2 Sensibilidade por parâmetro (os 3 que mais pesam)

**(a) Limiar de renda per capita (1/4 SM → 1/2 SM, etc.)**
A população está distribuída por faixa de renda. Subir o limiar "varre" mais gente
para dentro.
> **Δ beneficiários = (nº de pessoas elegíveis por idade/deficiência com renda
> entre o limiar VELHO e o NOVO) × taxa de adesão**

- Os "envelopes" de renda saem do **CadÚnico** (renda per capita por família) e da
  **PNAD Contínua/IBGE** (distribuição de renda na população idosa e com deficiência).
- "Taxa de adesão" (take-up) = nem todo elegível pede o benefício. Histórico do BPC
  sugere adesão alta mas <100%. **[A CONFIRMAR número]** — para a v1, usar um valor
  default editável (ex.: 70–85%) e deixar o jurista ver o efeito.

**(b) Critério etário do idoso (65 → 60, ou 65 → 67)**
> **Δ beneficiários ≈ (nº de pessoas na faixa etária aberta/fechada que já cumprem
> o critério de renda) × adesão**
- Fonte da pirâmide etária + renda: PNAD Contínua e projeção populacional do IBGE.

**(c) Critério de deficiência (impedimento ≥ 2 anos → outro prazo / outro conceito)**
Este é o mais difícil de quantificar (depende de avaliação biopsicossocial, não é
um número de renda). Para v1, tratar como **elasticidade calibrada**: "afrouxar o
conceito em X% aumenta concessões de deficiência em ~Y%", com Y vindo de séries
históricas de deferimento/indeferimento. **[A CONFIRMAR Y empírico]**.

### 2.3 Versão honesta para o dia 26 (v1 = "calculadora de 1ª ordem")
Sem econometria fina dá pra entregar uma estimativa de ordem de grandeza:
1. Pega o estoque atual (5,8 mi) e o gasto (R$ 102,1 bi) como ÂNCORA.
2. Para cada parâmetro, o jurista informa (ou o sistema sugere) um **fator de
   elasticidade** (quanto % o estoque muda por unidade de mudança no parâmetro).
3. Mostra **MAIOR/MENOR gasto** + valor estimado em R$ e em % do orçamento.
A elasticidade vem de tabela calibrada (BEPS histórico) — NÃO de chute da IA.
Honestidade na tela: rótulo "estimativa de ordem de grandeza, não previsão oficial".

---

## 3. Operacionalizar o art. 201 como restrição CHECÁVEL

### 3.1 O problema (admitido na cara)
A CF manda "preservar o **equilíbrio financeiro e atuarial**" (art. 201, caput) e a
EC 103/2019 adicionou a lógica de **equidade intergeracional**. Mas **não existe
definição legal objetiva de "sustentável"**: ninguém fixou se é déficit zero,
superávit, ou só "tendência controlada". O STF trata como princípio (solidariedade +
equilíbrio), não como número. Logo: **não dá pra checar "constitucionalidade" de
verdade** — o sistema NÃO pode dizer "isto é inconstitucional".

Ressalva jurídica importante: o BPC é **assistência social (art. 203, V)**, custeada
pelo orçamento, NÃO é seguro contributivo do art. 201. O art. 201 é o parâmetro que
o SPEC pediu como alerta, mas o link é argumentativo (pressão sobre a seguridade como
um todo, art. 194-195), não automático. Isso precisa estar explícito no artigo.

### 3.2 Proxy verificável proposto (3 sinais, tipo semáforo)
Em vez de julgar "sustentável", o sistema mede **PRESSÃO** e acende um alerta:

- **Sinal 1 — Peso no orçamento**: gasto BPC pós-mudança ÷ gasto BPC atual.
  Ex.: +20% acende amarelo, +50% vermelho. (Limiares são escolha do Kalyl,
  editáveis, não verdade absoluta.)
- **Sinal 2 — Trajetória demográfica**: projeção de idosos do IBGE → o mesmo
  parâmetro aplicado em 2024, 2030, 2040. Se o gasto CRESCE sozinho com o
  envelhecimento, acende. (Brasil: gasto de seguridade vai de ~8% para ~15% do PIB
  até 2100 segundo projeções; o BPC herda essa pressão.)
- **Sinal 3 — Regra fiscal**: a mudança cabe no **arcabouço fiscal** vigente
  (teto de crescimento real da despesa primária)? Estoura → vermelho. Este é o
  proxy MAIS objetivo e defensável: é uma regra numérica que já existe em lei.

> Saída honesta: "Esta alteração eleva a despesa primária em R$ X bi (+Y%) e tende a
> crescer com o envelhecimento. **Risco de tensão com o equilíbrio do art. 201/arcabouço
> fiscal** — não é declaração de inconstitucionalidade." O sistema EXPÕE, não DECIDE
> (coerente com a tese: máquina nunca julga passa/falha).

---

## 4. Representação em GRAFO/CANVAS do código deôntico editável

Recomendação: **para a v1 (26/06), grafo infinito é OVERKILL.**

- O código deôntico do BPC é pequeno: ~4-6 "nós" (idade, renda, deficiência,
  composição familiar, prazo do impedimento). Um **formulário com sliders/campos**
  por parâmetro já entrega a Tela 2 inteira, e é mais honesto: mostra o número
  mudando ao vivo.
- Se quiser o "canvas" visual (apelo de demo), a opção barata é **React Flow**
  (`@xyflow/react`): nós = condições deônticas, arestas = conectores lógicos
  (E/OU). Encaixa no stack React + lsa-ui do contrato. **Mas é polimento, não núcleo.**
- O código deôntico editável em si pode ser um **JSON** simples (lista de regras
  com operador, parâmetro, valor) — o mesmo formato que alimenta a fórmula da §2.
  O grafo, se existir, é só uma VIEW desse JSON.

Veredito do item: **v1 = formulário + JSON de regras. React Flow só se sobrar tempo.**

---

## 5. Veredito de viabilidade (26/06 vs artigo futuro)

**DÁ PRA TER dia 26/06 (realista):**
- Calculadora de 1ª ordem com âncora real (R$ 102,1 bi / 5,8 mi / 1 SM).
- 3 parâmetros editáveis (renda, idade, deficiência) com elasticidade calibrada
  por tabela (não por IA).
- Semáforo do art. 201 com os 3 sinais (peso no orçamento + demografia + arcabouço
  fiscal), com o aviso honesto "expõe, não decide / não é declaração de
  inconstitucionalidade".
- Formulário + JSON de regras como "código deôntico editável".

**FICA PRA DEPOIS (artigo derivado / v2):**
- Elasticidades empíricas de verdade (regressão sobre BEPS/CadÚnico/PNAD).
- O "canvas/grafo" React Flow polido.
- O artigo sobre **déficit securitário comparado (OCDE/CEPAL)** que o Kalyl já
  cogita — material rico: Brasil entre os sistemas menos sustentáveis do mundo,
  passivo atuarial implícito > R$ 8 tri, gasto rumo a ~15% do PIB. Isso é um paper
  próprio, NÃO entra na demo de 26/06.

**Risco maior:** o número fino de concessões do BEPS exige baixar e ler arquivo
local (o PDF não abre via web). Recomendo um subagente Sonnet baixar o XLSX/CSV do
BEPS e do Painel da Transparência e devolver as tabelas de estoque/concessão do BPC
2024. **[A CONFIRMAR com o Kalyl se autoriza o download]**.

---

### Fontes
- Portal Transparência (BPC, gastos, download, orçamento): portaldatransparencia.gov.br
- MDS — regras do BPC: gov.br/mds
- Lei 8.742/93 (LOAS): planalto.gov.br
- BEPS / Boletins Previdência: gov.br/previdencia + basedosdados.org
- Tesouro/SIAFI/RREO: tesourotransparente.gov.br
- art. 201 CF + jurisprudência: portal.stf.jus.br
- Sustentabilidade/déficit (contexto artigo futuro): TCU (fatos-fiscais), CLP, Câmara/LDO
