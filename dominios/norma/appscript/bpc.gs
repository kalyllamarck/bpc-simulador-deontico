/**
 * bpc.gs — Norma deôntica do BPC em Google AppScript
 *
 * Cada função = 1 regra deôntica (R1..R7).
 * Decisão final: decidirBPC(x) → "O_CONCEDER" ou "F_CONCEDER"
 *
 * Origem formal: pesquisa/01-formalizacao-deontica-bpc.md §4
 * Equivalente Python: dominios/norma/bpc.py
 *
 * REGRA DE OURO: a IA nunca decide.
 *   LLM_escoreMiserabilidade() interpreta e propõe um escore.
 *   A decisão é sempre o "if escore >= LIMIAR" — código determinístico.
 */

// ---------------------------------------------------------------------------
// CONSTANTES — [A CONFIRMAR] antes de colocar em produção
// ---------------------------------------------------------------------------

/** Salário mínimo vigente em reais. Atualizar conforme portaria anual. */
var SALARIO_MINIMO = 1518.00;  // [A CONFIRMAR] valor de 2025; checar portaria vigente

/** Limite de renda per capita para o critério econômico objetivo (¼ SM). */
var LIMITE_RENDA = SALARIO_MINIMO / 4;  // = R$ 379,50 em 2025

/** Limiar do escore de miserabilidade.
 *  [A CONFIRMAR] escolha política — deve ser calibrado com as sentenças-teste.
 *  Mudar este número muda quem entra. Decisão do jurista, não do código. */
var LIMIAR = 0.5;


// ---------------------------------------------------------------------------
// CAMADA OBJETIVA — puro determinístico, sem IA
// ---------------------------------------------------------------------------

/**
 * R1 — Porta de entrada subjetiva (estrita).
 * x deve ser idoso (≥ 65 anos) OU ter deficiência documentada.
 * LOAS art. 20, caput.
 * @param {Object} x - objeto com os dados do requerente
 * @return {boolean}
 */
function elegivelSubjetiva(x) {  // R1
  return idoso(x) || deficiente(x);
}

/**
 * R2 — Impedimento de longo prazo OK (forma positiva de R2).
 * Idosos não precisam do requisito de impedimento.
 * Para deficientes: exige impedimento de natureza física/mental/intelectual/sensorial
 * com efeitos de longo prazo (≥ 2 anos).
 * [A CONFIRMAR] prazo exato: checar redação vigente do art. 20, §§ 2º e 10 da LOAS.
 * @param {Object} x
 * @return {boolean}
 */
function impedimentoLongoOk(x) {  // R2 (positiva)
  return idoso(x) || (deficiente(x) && impedimentoLongo(x));
}

/**
 * R3 — Critério econômico objetivo (estrita).
 * Renda per capita dentro do teto satisfaz o critério econômico.
 * LOAS art. 20, §3º.
 * @param {Object} x
 * @return {boolean}
 */
function criterioEconomicoObjetivo(x) {  // R3
  return rendaPerCapita(x) <= LIMITE_RENDA;
}


// ---------------------------------------------------------------------------
// CAMADA VALORATIVA — LLM propõe, código decide
// ---------------------------------------------------------------------------

/**
 * LLM_escoreMiserabilidade — ÚNICO ponto de IA neste módulo.
 *
 * STUB / PLACEHOLDER: devolve escore mockado.
 * [A CONFIRMAR] colar a chamada real do AppScript do Kalyl aqui.
 *   (Extensões → Apps Script → copiar a função que chama o LLM externo)
 *
 * O LLM lê os 4 placeholders e PROPÕE um escore 0.0..1.0 + justificativa.
 * Ele INTERPRETA — não decide. Quem decide é o "if escore >= LIMIAR" abaixo.
 * Trocar o modelo de LLM não muda quem decide.
 *
 * // ÚNICO ponto de IA — interpreta, não decide
 *
 * @param {Object} campos - os 4 placeholders da Tela 1 da SPEC
 * @param {string} campos.cadUnico        - {{CadÚnico}}
 * @param {string} campos.atestado        - {{Atestado Médico / grau de limitação}}
 * @param {string} campos.residencia      - {{Descrição da residência}}
 * @param {string} campos.socioeconomico  - {{Condições socioeconômicas + vulnerabilidades}}
 * @return {number} escore entre 0.0 (não miserável) e 1.0 (claramente miserável)
 */
function LLM_escoreMiserabilidade(campos) {
  // --- STUB: substituir pelo bloco real do AppScript do Kalyl ---
  // Exemplo de retorno esperado da chamada real:
  //   { escore: 0.73, justificativa: "Reside em domicílio precário sem renda formal..." }
  //
  // Por ora devolve 0 para não produzir falsos-positivos enquanto o stub não for trocado.
  Logger.log("[STUB] LLM_escoreMiserabilidade chamado com: " + JSON.stringify(campos));
  return 0;  // [A CONFIRMAR] colar a chamada real aqui
}

/**
 * miseravel — alimenta R5.
 * Chama o LLM para obter escore e aplica o limiar determinístico.
 * A decisão NÃO é do LLM; é o "escore >= LIMIAR".
 * @param {Object} x
 * @return {boolean}
 */
function miseravel(x) {  // alimenta R5
  var escore = LLM_escoreMiserabilidade({
    cadUnico:       x["cadUnico"],        // coluna {{CadÚnico}} na planilha
    atestado:       x["atestado"],        // coluna {{Atestado Médico}}
    residencia:     x["residencia"],      // coluna {{Descrição da residência}}
    socioeconomico: x["socioeconomico"]   // coluna {{Condições socioeconômicas + vulnerabilidades}}
  });
  // A DECISÃO é esta linha — não o LLM:
  return escore >= LIMIAR;
}


// ---------------------------------------------------------------------------
// REGRA DERROTÁVEL R4 vs R5 — exceção (R5) vence a regra-geral (R4)
// ---------------------------------------------------------------------------

/**
 * criterioEconomico — R3 + R4 + R5 com prioridade R5 > R4.
 * R3: renda ≤ teto → satisfaz diretamente.
 * R4: renda > teto → em princípio barra (derrotável).
 * R5: renda > teto MAS miserabilidade comprovada → derrota R4 (exceção vence).
 * Alinhado à jurisprudência: ¼ SM é presunção relativa, não teto absoluto.
 * @param {Object} x
 * @return {boolean}
 */
function criterioEconomico(x) {  // R3 + R4 + R5
  if (criterioEconomicoObjetivo(x)) return true;  // R3
  if (miseravel(x))                 return true;  // R5 derrota R4
  return false;                                   // R4
}


// ---------------------------------------------------------------------------
// CONCLUSÃO DEÔNTICA — R6 + R7
// ---------------------------------------------------------------------------

/**
 * decidirBPC — conclusão deôntica principal.
 * Retorna "O_CONCEDER" (obrigatório conceder) ou "F_CONCEDER" (proibido conceder).
 *
 * Ordem das verificações codifica a prioridade das regras:
 *   1. Vedação de acumulação (R6) — testa primeiro, corta cedo
 *   2. Elegibilidade subjetiva (R1)
 *   3. Impedimento de longo prazo (R2)
 *   4. Critério econômico com exceção de miserabilidade (R3+R4+R5)
 *   5. Se tudo passa → O(conceder) (R7)
 *
 * @param {Object} x - objeto com todos os dados do requerente
 * @return {string} "O_CONCEDER" | "F_CONCEDER"
 */
function decidirBPC(x) {
  if (acumulaBeneficio(x))    return "F_CONCEDER";  // R6 — vedação de acumulação
  if (!elegivelSubjetiva(x))  return "F_CONCEDER";  // R1 — não é idoso nem deficiente
  if (!impedimentoLongoOk(x)) return "F_CONCEDER";  // R2 — deficiente sem impedimento longo
  if (!criterioEconomico(x))  return "F_CONCEDER";  // R4 — critério econômico não satisfeito
  return "O_CONCEDER";                              // R7 — obrigatório conceder
}


// ---------------------------------------------------------------------------
// FUNÇÕES AUXILIARES — ler dados do requerente (x)
// Estas funções leem os campos do objeto x (ou da planilha).
// [A CONFIRMAR] nomes de colunas: casar com as colunas reais da planilha do Kalyl.
// ---------------------------------------------------------------------------

/**
 * idoso — tem 65 anos ou mais. LOAS art. 20, caput.
 * @param {Object} x
 * @return {boolean}
 */
function idoso(x) {
  var hoje = new Date();
  var nascimento = new Date(x["dataNascimento"]);  // [A CONFIRMAR] nome da coluna
  var idade = (hoje - nascimento) / (1000 * 60 * 60 * 24 * 365.25);
  return idade >= 65;
}

/**
 * deficiente — tem deficiência documentada (flag de laudo). LOAS art. 20, §2º.
 * @param {Object} x
 * @return {boolean}
 */
function deficiente(x) {
  return x["temDeficiencia"] === true || x["temDeficiencia"] === "SIM";  // [A CONFIRMAR] coluna
}

/**
 * impedimentoLongo — impedimento de longo prazo (≥ 2 anos).
 * [A CONFIRMAR] prazo exato: ver redação vigente do art. 20, §10 da LOAS.
 * @param {Object} x
 * @return {boolean}
 */
function impedimentoLongo(x) {
  var prazoMeses = x["impedimentoMeses"];  // [A CONFIRMAR] coluna; prazo em meses
  return prazoMeses >= 24;  // 2 anos = 24 meses; [A CONFIRMAR] texto legal vigente
}

/**
 * rendaPerCapita — renda mensal familiar / número de membros. LOAS art. 20, §3º.
 * @param {Object} x
 * @return {number} renda per capita em reais
 */
function rendaPerCapita(x) {
  return x["rendaFamiliar"] / x["numMembros"];  // [A CONFIRMAR] nomes das colunas
}

/**
 * acumulaBeneficio — já recebe benefício incompatível com o BPC. LOAS art. 20, §4º.
 * @param {Object} x
 * @return {boolean}
 */
function acumulaBeneficio(x) {
  return x["acumulaBeneficio"] === true || x["acumulaBeneficio"] === "SIM";  // [A CONFIRMAR]
}
