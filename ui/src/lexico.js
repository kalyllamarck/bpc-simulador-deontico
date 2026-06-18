/* Léxico — traduz os termos do motor (tokens crus) para PT-BR jurídico de tela.
 *
 * Regra de ouro da auditoria: a trilha do raciocínio e a tela de impacto NUNCA
 * mostram os tokens crus (O_CONCEDER, baseline etc.). Tudo passa por aqui antes
 * de chegar aos olhos do jurista. A IA não decide; este arquivo só nomeia.
 */

/* ─── Functores deônticos (as três conclusões da norma) ─────────────────────── */
export const FUNCTOR = {
  O_CONCEDER: {
    rotulo: 'Dever de conceder',
    nota: 'A norma impõe o dever de conceder: todas as condições do art. 20 estão satisfeitas.',
    sinal: 'verde',
  },
  F_CONCEDER: {
    rotulo: 'Vedação de conceder',
    nota: 'A norma veda a concessão: uma condição estrita barra o benefício, ou a regra-geral do ¼ do salário mínimo não foi derrotada.',
    sinal: 'vermelho',
  },
  INDETERMINADO_VALORACAO_HUMANA: {
    rotulo: 'Indeterminado: exige valoração humana',
    nota: 'A norma não conclui por subsunção automática. A miserabilidade é resíduo valorativo: o caso segue para valoração humana (estudo social), nunca para negação automática.',
    sinal: 'amarelo',
  },
  DADOS_INVALIDOS: {
    rotulo: 'Dados de entrada inválidos',
    nota: 'A entrada não corresponde à do art. 20. Corrija os dados antes de aplicar a norma.',
    sinal: 'amarelo',
  },
}

export function functor(token) {
  return FUNCTOR[token] || FUNCTOR.DADOS_INVALIDOS
}

/* ─── Termos avulsos (tradução palavra a palavra) ───────────────────────────── */
const TERMOS = {
  baseline: 'patamar legal',
  O_CONCEDER: 'dever de conceder',
  F_CONCEDER: 'vedação de conceder',
  INDETERMINADO_VALORACAO_HUMANA: 'indeterminado: exige valoração humana',
  DADOS_INVALIDOS: 'dados de entrada inválidos',
}

/* Substitui qualquer token cru por sua forma jurídica dentro de um texto livre
 * (usado na trilha do raciocínio e nas mensagens vindas do motor). */
export function traduzir(texto) {
  if (texto == null) return texto
  let saida = String(texto)
  for (const [bruto, claro] of Object.entries(TERMOS)) {
    saida = saida.replaceAll(bruto, claro)
  }
  return saida
}
