/* Ponte entre as telas e o motor (a norma já pronta).
 *
 * Cada função chama a API (FastAPI, ver ../../api/main.py) por `fetch`. Quando a API
 * não responde — por exemplo, numa demonstração sem o motor no ar — devolve um dado de
 * EXEMPLO com a MESMA forma que a função Python correspondente retorna. Assim a tela
 * funciona para mostrar, e passa a usar o motor real assim que ele estiver de pé.
 *
 * O sistema apenas APLICA a norma. Quando não conclui, manda para valoração humana.
 * A IA jamais decide.
 */

// Endereço da API, adaptado ao caminho de publicação. Em desenvolvimento o Vite serve na
// raiz ("/") e encaminha "/api" para o FastAPI (ver vite.config.js). Publicado num subcaminho
// (ex.: build com --base=/profeduardo/), vira "/profeduardo/api" automaticamente.
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/api'

/* ─── Tela 1 — Valoração ───────────────────────────────────────────────────────
 * Espelha o retorno de dominios.norma.bpc_conclusao_deontica.simular():
 *   { conclusao, rastro: [...], renda_per_capita_centavos, motivo }
 * Conclusões possíveis: O_CONCEDER, F_CONCEDER, INDETERMINADO_VALORACAO_HUMANA,
 * DADOS_INVALIDOS.
 */

// Três exemplos, um para cada functor deôntico, na forma exata do motor.
export const EXEMPLOS_VALORACAO = {
  O_CONCEDER: {
    conclusao: 'O_CONCEDER',
    renda_per_capita_centavos: 21000,
    motivo: null,
    rastro: [
      'R1 (art. 20, caput): integra o público (pessoa idosa ou com deficiência)',
      'R3 (art. 20, §3º): renda per capita dentro do ¼ do salário mínimo → critério econômico satisfeito',
      'R7 (art. 20): satisfeitas todas as condições → O_CONCEDER',
    ],
  },
  F_CONCEDER: {
    conclusao: 'F_CONCEDER',
    renda_per_capita_centavos: 90000,
    motivo: null,
    rastro: [
      'R1 (art. 20, caput): integra o público (pessoa idosa ou com deficiência)',
      'R4 (art. 20, §3º): renda per capita acima do ¼ do salário mínimo, miserabilidade afastada → F_CONCEDER',
    ],
  },
  INDETERMINADO_VALORACAO_HUMANA: {
    conclusao: 'INDETERMINADO_VALORACAO_HUMANA',
    renda_per_capita_centavos: 40000,
    motivo: null,
    rastro: [
      'R1 (art. 20, caput): integra o público (pessoa idosa ou com deficiência)',
      'Camada valorativa (art. 20, §11): renda acima do ¼ do salário mínimo e miserabilidade por resolver (grau ausente ou sem convergência) → INDETERMINADO, exige valoração humana',
    ],
  },
}

// Dado de exemplo padrão (o que a tela mostra sem o motor no ar).
const EXEMPLO_VALORACAO_PADRAO = EXEMPLOS_VALORACAO.O_CONCEDER

export async function simularValoracao(requerente) {
  try {
    const r = await fetch(`${BASE}/simular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requerente),
      signal: AbortSignal.timeout?.(4000),
    })
    if (!r.ok) throw new Error(`motor respondeu ${r.status}`)
    const dados = await r.json()
    return { ...dados, _origem: 'motor' }
  } catch (e) {
    // Sem motor no ar: escolhe o exemplo coerente com a entrada, para a demonstração.
    const exemplo = escolherExemploValoracao(requerente)
    return { ...exemplo, _origem: 'exemplo' }
  }
}

// Heurística leve só para a DEMONSTRAÇÃO offline (não é a norma; a norma vive no motor).
function escolherExemploValoracao(req) {
  if (!req) return EXEMPLO_VALORACAO_PADRAO
  const rendaTotal = (req.familia || []).reduce((s, m) => s + (m.renda_centavos || 0), 0)
  const membros = (req.familia || []).length || 1
  const perCapita = Math.floor(rendaTotal / membros)
  const teto = Math.floor((req.salario_minimo_centavos || 141200) / 4)
  if (req.acumula_beneficio) return EXEMPLOS_VALORACAO.F_CONCEDER
  if (perCapita <= teto) return { ...EXEMPLOS_VALORACAO.O_CONCEDER, renda_per_capita_centavos: perCapita }
  if (req.escore_miserabilidade == null) {
    return { ...EXEMPLOS_VALORACAO.INDETERMINADO_VALORACAO_HUMANA, renda_per_capita_centavos: perCapita }
  }
  return { ...EXEMPLOS_VALORACAO.F_CONCEDER, renda_per_capita_centavos: perCapita }
}

/* ─── Tela 2 — Impacto ─────────────────────────────────────────────────────────
 * Espelha o retorno de dominios.impacto.impacto.simular():
 *   { parametro, valor_novo, delta_beneficiarios, delta_reais, gasto_atual,
 *     gasto_novo, semaforo: { cor, peso, peso_pct, mensagem_honesta }, aviso }
 */

const AVISO_HONESTO =
  'Estimativa de ordem de grandeza, não previsão oficial. Este sinal EXPÕE a tensão ' +
  'orçamentária; NÃO é declaração de inconstitucionalidade. O BPC é assistência social ' +
  '(art. 203, V), custeado pelo orçamento, e não seguro contributivo do art. 201; o elo ' +
  'com o equilíbrio do art. 201 é argumentativo (pressão sobre a seguridade), não ' +
  'automático. Quem decide é o jurista, não a máquina.'

export async function simularImpacto(parametro, valor_novo, elasticidade_hipotese = null) {
  try {
    const r = await fetch(`${BASE}/impacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parametro, valor_novo, elasticidade_hipotese }),
      signal: AbortSignal.timeout?.(4000),
    })
    if (!r.ok) throw new Error(`motor respondeu ${r.status}`)
    const dados = await r.json()
    return { ...dados, _origem: 'motor' }
  } catch (e) {
    return { ...exemploImpacto(parametro, valor_novo, elasticidade_hipotese), _origem: 'exemplo' }
  }
}

// Âncoras CONFIRMADAS (espelham ancoras.json), só para a DEMONSTRAÇÃO offline. A verdade
// calibrada vive no motor Python. As elasticidades são [A_CONFIRMAR] (PNADc) — por isso o
// offline NÃO inventa número: sem hipótese do jurista, devolve NAO_CALIBRADO, igual ao motor.
const ANCORAS_DEMO = {
  gasto_2024_reais: 113.421e9, // RTN dez/2024 (CONFIRMADO)
  estoque_2025: 7645372, // BEPS abr/2026, Quadro 2 (CONFIRMADO)
  salario_minimo_2024: 1412.0, // Portaria MPS/MF (CONFIRMADO)
  meses: 12,
  semaforo: { amarelo_pct: 20, vermelho_pct: 50 },
  baselines: { renda: 0.25, idade: 65, deficiencia: 24 },
}
const FONTE_ANCORAS = {
  gasto_bpc_2024: 'Tesouro Nacional, RTN dez/2024',
  estoque_2025: 'BEPS abr/2026, Quadro 2 (INSS/MPS)',
  beneficio_unitario: 'Portaria Interministerial MPS/MF',
}
const MENSAGEM_NAO_CALIBRADO =
  'elasticidade não calibrada — calcular sobre PNADc; ou informe uma hipótese explícita do jurista'

function exemploImpacto(parametro, valor_novo, elasticidade_hipotese) {
  const a = ANCORAS_DEMO
  const baseline = a.baselines[parametro]
  const gasto_atual = a.gasto_2024_reais

  // Guardrail (igual ao motor): sem elasticidade calibrada e sem hipótese → não inventa número.
  if (elasticidade_hipotese == null) {
    return {
      estado: 'NAO_CALIBRADO',
      parametro,
      valor_novo,
      mensagem: MENSAGEM_NAO_CALIBRADO,
      delta_beneficiarios: null,
      delta_reais: null,
      gasto_atual,
      gasto_novo: null,
      semaforo: null,
      fonte_ancoras: FONTE_ANCORAS,
      aviso: AVISO_HONESTO,
    }
  }

  // Com hipótese explícita do jurista → calcula e ROTULA como não calibrada em PNADc.
  const delta_beneficiarios = a.estoque_2025 * elasticidade_hipotese * (valor_novo - baseline)
  const delta_reais = delta_beneficiarios * a.salario_minimo_2024 * a.meses
  const gasto_novo = gasto_atual + delta_reais
  const peso = gasto_novo / gasto_atual
  const peso_pct = Math.round((peso - 1.0) * 100.0 * 1e6) / 1e6
  let cor = 'verde'
  let forca = 'BAIXA'
  if (peso_pct >= a.semaforo.vermelho_pct) {
    cor = 'vermelho'
    forca = 'ALTA'
  } else if (peso_pct >= a.semaforo.amarelo_pct) {
    cor = 'amarelo'
    forca = 'MODERADA'
  }
  const sinal = peso_pct >= 0 ? '+' : ''
  return {
    estado: 'CALCULADO',
    parametro,
    valor_novo,
    calibracao: 'hipótese do jurista — não calibrada em PNADc',
    delta_beneficiarios,
    delta_reais,
    gasto_atual,
    gasto_novo,
    semaforo: {
      cor,
      peso,
      peso_pct,
      mensagem_honesta: `Pressão orçamentária ${forca}: a alteração leva o gasto do BPC a ${sinal}${peso_pct.toFixed(
        1
      )}% do patamar atual (peso ${peso.toFixed(2)}x). ${AVISO_HONESTO}`,
    },
    fonte_ancoras: FONTE_ANCORAS,
    aviso: AVISO_HONESTO,
  }
}

/* ─── Fase 1 — Grafo da norma (complexidade ciclomática) ───────────────────────
 * Espelha GET /grafo: nós = condições do art. 20; arestas sim/não; folhas = os
 * três functores. A complexidade é apresentada "conforme a Lei", não como métrica
 * de software.
 */
const GRAFO_DEMO = {
  nos: [
    { id: 'p04', rotulo: 'Acumula benefício vedado?', dispositivo: 'Art. 20, §4º', tipo: 'condicao' },
    { id: 'caput', rotulo: 'Integra o público (idoso 65+ ou com deficiência)?', dispositivo: 'Art. 20, caput', tipo: 'condicao' },
    { id: 'p02', rotulo: 'Impedimento de longo prazo (≥ 2 anos)?', dispositivo: 'Art. 20, §2º e §10', tipo: 'condicao' },
    { id: 'p03', rotulo: 'Renda per capita < ¼ do salário mínimo?', dispositivo: 'Art. 20, §3º', tipo: 'condicao' },
    { id: 'p11', rotulo: 'Miserabilidade afasta a presunção do ¼?', dispositivo: 'Art. 20, §11', tipo: 'condicao' },
    { id: 'F', rotulo: 'F_CONCEDER', dispositivo: 'Art. 20 (síntese)', tipo: 'terminal' },
    { id: 'O', rotulo: 'O_CONCEDER', dispositivo: 'Art. 20 (síntese)', tipo: 'terminal' },
    { id: 'IND', rotulo: 'INDETERMINADO_VALORACAO_HUMANA', dispositivo: 'Art. 20, §11 (síntese)', tipo: 'terminal' },
  ],
  arestas: [
    { de: 'p04', para: 'F', condicao: 'sim' },
    { de: 'p04', para: 'caput', condicao: 'não' },
    { de: 'caput', para: 'F', condicao: 'não' },
    { de: 'caput', para: 'p02', condicao: 'sim' },
    { de: 'p02', para: 'F', condicao: 'não' },
    { de: 'p02', para: 'p03', condicao: 'sim' },
    { de: 'p03', para: 'O', condicao: 'sim' },
    { de: 'p03', para: 'p11', condicao: 'não' },
    { de: 'p11', para: 'O', condicao: 'sim' },
    { de: 'p11', para: 'IND', condicao: 'não' },
  ],
  complexidade: {
    decisoes: 5,
    caminhos: 6,
    ciclomatica: 6,
  },
  explicacao:
    'A complexidade não é defeito: ela reproduz a própria estrutura do art. 20 da LOAS. ' +
    'São cinco decisões (uma por dispositivo) que, combinadas, geram seis caminhos até um ' +
    'dos três desfechos da norma. A medida ciclomática (decisões + 1) apenas conta esses ' +
    'caminhos — é o retrato fiel da lei, não uma escolha do sistema.',
}

export async function obterGrafo() {
  try {
    const r = await fetch(`${BASE}/grafo`, { signal: AbortSignal.timeout?.(4000) })
    if (!r.ok) throw new Error(`motor respondeu ${r.status}`)
    const dados = await r.json()
    return { ...dados, _origem: 'motor' }
  } catch (e) {
    return { ...GRAFO_DEMO, _origem: 'exemplo' }
  }
}

/* ─── Fase 3 — Valoração (âncora metodológica Alexy | Müller) ───────────────────
 * Espelha POST /valorar. A âncora é explícita; o sistema NÃO decide (decide:false):
 * apenas estrutura o argumento conforme o método escolhido pelo jurista.
 */
export async function valorar(requerente, ancora) {
  try {
    const r = await fetch(`${BASE}/valorar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...requerente, ancora }),
      signal: AbortSignal.timeout?.(4000),
    })
    if (!r.ok) throw new Error(`motor respondeu ${r.status}`)
    const dados = await r.json()
    return { ...dados, _origem: 'motor' }
  } catch (e) {
    return { ...exemploValoracaoMetodologica(ancora), _origem: 'exemplo' }
  }
}

function exemploValoracaoMetodologica(ancora) {
  if (ancora === 'muller') {
    return {
      ancora: 'muller',
      programa:
        'Programa da norma: o §11 abre o ¼ do salário mínimo a outros elementos probatórios ' +
        'de miserabilidade — o texto não esgota a hipótese de incapacidade econômica.',
      ambito:
        'Âmbito da norma: a realidade do grupo familiar (gastos com saúde, moradia, dependentes) ' +
        'que o programa normativo recorta como juridicamente relevante.',
      tensao:
        'A concretização confronta programa e âmbito: o caso concreto cabe no recorte da norma, ' +
        'mas a decisão final cabe ao jurista, não à máquina.',
      decide: false,
    }
  }
  return {
    ancora: 'alexy',
    dimensoes: [
      { nome: 'Dignidade da pessoa humana', escore: 8, peso: 0.4, parcela: 3.2 },
      { nome: 'Mínimo existencial', escore: 7, peso: 0.35, parcela: 2.45 },
      { nome: 'Equilíbrio orçamentário (art. 201)', escore: 4, peso: 0.25, parcela: 1.0 },
    ],
    peso_total: 6.65,
    ressalva:
      'A ponderação estrutura o argumento; ela não substitui a decisão do jurista. ' +
      'Os pesos são ilustrativos e dependem do caso concreto.',
    decide: false,
  }
}

/* ─── Fase 4 — Decisão (MacCormick: silogismo + três gates) ─────────────────────
 * Espelha POST /decidir-maccormick. Primeiro tenta a justificação de 1ª ordem
 * (silogismo dedutivo). Se não fecha, sobe à 2ª ordem (universalizabilidade,
 * consistência, coerência). Os "gates" são portões deônticos, não da máquina.
 */
export async function decidirMacCormick(requerente) {
  try {
    const r = await fetch(`${BASE}/decidir-maccormick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requerente),
      signal: AbortSignal.timeout?.(4000),
    })
    if (!r.ok) throw new Error(`motor respondeu ${r.status}`)
    const dados = await r.json()
    return { ...dados, _origem: 'motor' }
  } catch (e) {
    return { ...exemploMacCormick(requerente), _origem: 'exemplo' }
  }
}

function exemploMacCormick(req) {
  const rendaTotal = (req?.familia || []).reduce((s, m) => s + (m.renda_centavos || 0), 0)
  const membros = (req?.familia || []).length || 1
  const perCapita = Math.floor(rendaTotal / membros)
  const teto = Math.floor((req?.salario_minimo_centavos || 141200) / 4)
  const fechaDireto = perCapita < teto && !req?.acumula_beneficio

  if (fechaDireto) {
    return {
      silogismo: {
        fecha: true,
        rastro: [
          'Premissa maior: a norma do art. 20 obriga a conceder a quem integra o público e tem renda per capita inferior a ¼ do salário mínimo.',
          'Premissa menor: o caso integra o público e a renda per capita está abaixo do ¼.',
          'Conclusão: dever de conceder, por subsunção dedutiva (justificação de 1ª ordem).',
        ],
      },
      gates: null,
      functor_final: 'O_CONCEDER',
    }
  }
  return {
    silogismo: {
      fecha: false,
      rastro: [
        'Premissa maior: a norma exige renda per capita inferior a ¼ do salário mínimo.',
        'Premissa menor: a renda per capita do caso supera o ¼, mas o §11 admite outros elementos de miserabilidade.',
        'Conclusão: o silogismo de 1ª ordem não fecha — sobe-se à justificação de 2ª ordem.',
      ],
    },
    gates: [
      {
        nome: 'Universalizabilidade',
        passou: true,
        explicacao:
          'A solução proposta para este caso poderia ser aplicada a todos os casos iguais? ' +
          'Sim: tratar como miserável quem comprova vulnerabilidade equivalente é regra universalizável.',
      },
      {
        nome: 'Consistência',
        passou: true,
        explicacao:
          'A decisão não contraria norma válida do sistema? Não há conflito com regra vigente — ' +
          'o §11 expressamente autoriza outros elementos probatórios.',
      },
      {
        nome: 'Coerência',
        passou: false,
        explicacao:
          'A decisão se harmoniza com os princípios do sistema (dignidade, mínimo existencial) ' +
          'sem ferir o equilíbrio do art. 201? Aqui o juízo é valorativo e cabe ao jurista — ' +
          'o sistema não fecha a coerência sozinho.',
      },
    ],
    functor_final: 'INDETERMINADO_VALORACAO_HUMANA',
  }
}
