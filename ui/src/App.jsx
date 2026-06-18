import { useState } from 'react'
import { simularValoracao, simularImpacto } from './api'

/* ════════════════════════════════════════════════════════════════════════════
 *  Simulador deôntico do BPC — ObservaSocial
 *  O sistema apenas APLICA a norma (art. 20 da LOAS). Quando não conclui, manda
 *  para valoração humana (estudo social). A IA jamais decide — ela só interpreta
 *  e propõe; quem decide é a linha determinística.
 * ════════════════════════════════════════════════════════════════════════════ */

/* ─── Apresentação das conclusões deônticas ─────────────────────────────────── */
const CONCLUSAO = {
  O_CONCEDER: {
    rotulo: 'Obrigatório conceder',
    sinal: 'verde',
    nota: 'A norma impõe o dever de conceder: todas as condições do art. 20 estão satisfeitas.',
  },
  F_CONCEDER: {
    rotulo: 'Proibido conceder',
    sinal: 'vermelho',
    nota: 'A norma veda a concessão: uma condição estrita barra o benefício, ou a regra-geral do ¼ do salário mínimo não foi derrotada.',
  },
  INDETERMINADO_VALORACAO_HUMANA: {
    rotulo: 'Indeterminado: exige valoração humana (estudo social)',
    sinal: 'amarelo',
    nota: 'A norma não conclui por subsunção automática. A miserabilidade é resíduo valorativo: o caso segue para valoração humana, nunca para negação automática.',
  },
  DADOS_INVALIDOS: {
    rotulo: 'Dados de entrada inválidos',
    sinal: 'amarelo',
    nota: 'A entrada não corresponde à do art. 20. Corrija os dados antes de aplicar a norma.',
  },
}

const CLASSE_SINAL = {
  verde: { ponto: 'bg-sinal-verde', texto: 'text-sinal-verde', borda: 'border-sinal-verde' },
  amarelo: { ponto: 'bg-sinal-amarelo', texto: 'text-sinal-amarelo', borda: 'border-sinal-amarelo' },
  vermelho: { ponto: 'bg-sinal-vermelho', texto: 'text-sinal-vermelho', borda: 'border-sinal-vermelho' },
}

function reaisDeCentavos(centavos) {
  if (centavos == null) return '—'
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function reaisGrandes(valor) {
  const bi = valor / 1e9
  if (Math.abs(bi) >= 1) return `R$ ${bi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`
  const mi = valor / 1e6
  return `R$ ${mi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
}

/* ─── Luz de concordância das cinco leituras ────────────────────────────────── */
function LuzConcordancia({ concordaram }) {
  const cor = concordaram ? 'verde' : 'amarelo'
  const c = CLASSE_SINAL[cor]
  return (
    <div className={`flex items-start gap-3 rounded-marca border ${c.borda} bg-white p-3`}>
      <span className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${c.ponto}`} />
      <div className="text-sm leading-relaxed">
        <strong className={c.texto}>
          {concordaram ? 'As cinco leituras concordaram' : 'As cinco leituras divergiram — confira'}
        </strong>
        <p className="mt-0.5 text-observa-petroleo/70">
          {concordaram
            ? 'O leitor-propositor leu o caso cinco vezes e convergiu. O grau de miserabilidade foi tratado como definido.'
            : 'O leitor-propositor não convergiu nas cinco leituras. O grau de miserabilidade fica em aberto e o caso tende ao estado de valoração humana.'}
        </p>
      </div>
    </div>
  )
}

/* ─── Bloco de resultado (conclusão + trilha) ──────────────────────────────── */
function Resultado({ resposta, concordaram }) {
  if (!resposta) return null
  const meta = CONCLUSAO[resposta.conclusao] || CONCLUSAO.DADOS_INVALIDOS
  const c = CLASSE_SINAL[meta.sinal]

  return (
    <div className="flex flex-col gap-4">
      <LuzConcordancia concordaram={concordaram} />

      {/* Conclusão deôntica */}
      <div className={`rounded-marca border-l-4 ${c.borda} bg-white p-5 shadow-carta`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
          Conclusão da norma (art. 20 da LOAS)
        </p>
        <p className={`mt-1 text-xl font-bold ${c.texto}`}>{meta.rotulo}</p>
        <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/80">{meta.nota}</p>
        {resposta.renda_per_capita_centavos != null && (
          <p className="mt-3 text-sm text-observa-petroleo/70">
            Renda familiar per capita apurada:{' '}
            <strong>{reaisDeCentavos(resposta.renda_per_capita_centavos)}</strong>/mês.
          </p>
        )}
        {resposta.motivo && (
          <p className="mt-2 text-sm italic text-sinal-vermelho">{resposta.motivo}</p>
        )}
      </div>

      {/* Trilha (rastro) com os dispositivos */}
      <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
        <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
          Trilha do raciocínio — dispositivos aplicados
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {resposta.rastro.map((linha, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-observa-petroleo/85">
              <span className="font-mono text-observa-menta">{i + 1}.</span>
              <span>{linha}</span>
            </li>
          ))}
        </ol>
      </div>

      <OrigemDado origem={resposta._origem} />
    </div>
  )
}

/* Avisa, com sobriedade, se o resultado veio do motor ou de um exemplo (demo). */
function OrigemDado({ origem }) {
  return (
    <p className="text-xs italic text-observa-petroleo/50">
      {origem === 'motor'
        ? 'Resultado produzido pelo motor da norma.'
        : 'Demonstração com dado de exemplo (o motor da norma não respondeu). Os valores espelham a forma real da saída.'}
    </p>
  )
}

/* ─── Tela 1 — Valoração ────────────────────────────────────────────────────── */
function TelaValoracao() {
  const [modo, setModo] = useState('descrever') // 'colar' | 'descrever'
  const [sentenca, setSentenca] = useState('')

  // Os quatro campos da norma (família resumida em um requerente + sua renda).
  const [idade, setIdade] = useState(67)
  const [deficiente, setDeficiente] = useState(false)
  const [impedimentoMeses, setImpedimentoMeses] = useState(0)
  const [acumula, setAcumula] = useState(false)
  const [rendaReais, setRendaReais] = useState('210,00')
  const [membros, setMembros] = useState(1)
  const [smReais, setSmReais] = useState('1412,00')
  const [grauMiserabilidade, setGrauMiserabilidade] = useState('') // vazio = sem convergência

  const [resposta, setResposta] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const reaisParaCentavos = (s) => Math.round(parseFloat(String(s).replace(/\./g, '').replace(',', '.') || '0') * 100)

  async function valorar() {
    setCarregando(true)
    const rendaCentavos = reaisParaCentavos(rendaReais)
    const escore = grauMiserabilidade === '' ? null : parseFloat(grauMiserabilidade)
    const requerente = {
      familia: [
        { renda_centavos: rendaCentavos, papel: 'requerente' },
        ...Array.from({ length: Math.max(0, membros - 1) }, () => ({ renda_centavos: 0, papel: 'filho ou enteado solteiro' })),
      ],
      idade: Number(idade),
      deficiente,
      impedimento_meses: Number(impedimentoMeses),
      acumula_beneficio: acumula,
      salario_minimo_centavos: reaisParaCentavos(smReais),
      escore_miserabilidade: escore,
    }
    const r = await simularValoracao(requerente)
    setResposta(r)
    setCarregando(false)
  }

  // Concordância das cinco leituras: convergiram quando há um grau definido.
  const concordaram = grauMiserabilidade !== ''

  const campo = 'w-full rounded-marca border border-observa-borda bg-white px-3 py-2 text-sm text-observa-petroleo focus:border-observa-menta focus:outline-none'
  const rotulo = 'block text-sm font-semibold text-observa-petroleo'

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/75">
        O sistema aplica o art. 20 da LOAS aos fatos do caso e devolve uma das três conclusões:
        Obrigatório conceder, Proibido conceder ou Indeterminado (que exige valoração humana). A
        máquina não julga: ela aplica a norma e, no resíduo valorativo, devolve o caso ao jurista.
      </p>

      {/* Dois modos */}
      <div className="flex gap-2">
        {[
          { id: 'colar', label: 'Colar a sentença' },
          { id: 'descrever', label: 'Descrever as provas' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={`rounded-marca px-4 py-2 text-sm font-semibold transition ${
              modo === m.id
                ? 'bg-observa-petroleo text-white'
                : 'bg-white text-observa-petroleo/70 border border-observa-borda'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modo === 'colar' && (
        <div>
          <label htmlFor="sentenca" className={rotulo}>
            Cole o texto da sentença
          </label>
          <textarea
            id="sentenca"
            rows={6}
            value={sentenca}
            onChange={(e) => setSentenca(e.target.value)}
            placeholder="Ex.: Trata-se de pedido de BPC formulado por requerente com 58 anos, portador de sequela motora de longo prazo..."
            className={`${campo} mt-1 resize-y leading-relaxed`}
          />
          <p className="mt-1 text-xs italic text-observa-petroleo/50">
            O leitor-propositor leria a sentença e proporia os quatro campos abaixo. Aqui, confira ou ajuste
            os campos antes de aplicar a norma.
          </p>
        </div>
      )}

      {/* Os quatro campos da norma */}
      <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
          Os campos da norma (art. 20)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={rotulo}>Idade (anos completos)</label>
            <input type="number" min={0} value={idade} onChange={(e) => setIdade(e.target.value)} className={`${campo} mt-1`} />
          </div>
          <div>
            <label className={rotulo}>Pessoas no grupo familiar</label>
            <input type="number" min={1} value={membros} onChange={(e) => setMembros(Number(e.target.value))} className={`${campo} mt-1`} />
          </div>
          <div>
            <label className={rotulo}>Renda mensal do grupo (R$)</label>
            <input value={rendaReais} onChange={(e) => setRendaReais(e.target.value)} className={`${campo} mt-1`} />
          </div>
          <div>
            <label className={rotulo}>Salário mínimo de referência (R$)</label>
            <input value={smReais} onChange={(e) => setSmReais(e.target.value)} className={`${campo} mt-1`} />
          </div>
          <div className="flex items-center gap-2">
            <input id="def" type="checkbox" checked={deficiente} onChange={(e) => setDeficiente(e.target.checked)} className="h-4 w-4 accent-observa-petroleo" />
            <label htmlFor="def" className="text-sm text-observa-petroleo">Tem deficiência atestada (§2º)</label>
          </div>
          <div>
            <label className={rotulo}>Impedimento de longo prazo (meses)</label>
            <input type="number" min={0} value={impedimentoMeses} onChange={(e) => setImpedimentoMeses(e.target.value)} className={`${campo} mt-1`} />
          </div>
          <div className="flex items-center gap-2">
            <input id="acu" type="checkbox" checked={acumula} onChange={(e) => setAcumula(e.target.checked)} className="h-4 w-4 accent-observa-petroleo" />
            <label htmlFor="acu" className="text-sm text-observa-petroleo">Acumula benefício vedado (§4º)</label>
          </div>
          <div>
            <label className={rotulo}>Grau de miserabilidade (0 a 1)</label>
            <input
              value={grauMiserabilidade}
              onChange={(e) => setGrauMiserabilidade(e.target.value)}
              placeholder="vazio = sem convergência das 5 leituras"
              className={`${campo} mt-1`}
            />
            <p className="mt-1 text-xs italic text-observa-petroleo/50">
              Resíduo valorativo (§11). Deixe vazio para simular leituras sem convergência → valoração humana.
            </p>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={valorar}
          disabled={carregando}
          className="rounded-marca bg-observa-petroleo px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-50"
        >
          {carregando ? 'Aplicando a norma…' : 'Aplicar a norma'}
        </button>
      </div>

      <Resultado resposta={resposta} concordaram={concordaram} />
    </div>
  )
}

/* ─── Tela 2 — Impacto ──────────────────────────────────────────────────────── */
const PARAMETROS = {
  renda: { rotulo: 'Limiar de renda (frações do salário mínimo)', baseline: 0.25, min: 0.25, max: 0.5, step: 0.01, fmt: (v) => `${v.toFixed(2)} SM`, descricao: 'Sobe ou desce o teto de renda per capita do art. 20, §3º (baseline legal: ¼ = 0,25 SM).' },
  idade: { rotulo: 'Idade mínima da pessoa idosa (anos)', baseline: 65, min: 60, max: 70, step: 1, fmt: (v) => `${v} anos`, descricao: 'Corte etário do art. 20, caput (baseline legal: 65 anos).' },
  deficiencia: { rotulo: 'Prazo de impedimento de longo prazo (meses)', baseline: 24, min: 6, max: 36, step: 1, fmt: (v) => `${v} meses`, descricao: 'Duração mínima do impedimento (art. 20, §10; baseline legal: 24 meses).' },
}

function SemaforoArt201({ semaforo }) {
  if (!semaforo) return null
  const c = CLASSE_SINAL[semaforo.cor]
  const rotuloForca = { verde: 'Pressão BAIXA', amarelo: 'Pressão MODERADA', vermelho: 'Pressão ALTA' }[semaforo.cor]
  return (
    <div className={`rounded-marca border-l-4 ${c.borda} bg-white p-5 shadow-carta`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
        Semáforo do art. 201, CF/88 — tensão com a seguridade
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-block h-4 w-4 rounded-full ${c.ponto}`} />
        <span className={`text-lg font-bold ${c.texto}`}>{rotuloForca}</span>
        <span className="text-sm text-observa-petroleo/60">
          (gasto a {semaforo.peso_pct >= 0 ? '+' : ''}
          {semaforo.peso_pct.toFixed(1)}% do patamar atual · peso {semaforo.peso.toFixed(2)}x)
        </span>
      </div>
      <p className="mt-3 rounded-marca bg-observa-palido/40 p-3 text-sm leading-relaxed text-observa-petroleo/80">
        Este sinal <strong>expõe a tensão orçamentária; não declara inconstitucionalidade</strong>. O BPC é
        assistência social (art. 203, V), e não seguro contributivo do art. 201 — o elo é argumentativo, não
        automático. Quem decide é o jurista, não a máquina.
      </p>
    </div>
  )
}

function TelaImpacto() {
  const [parametro, setParametro] = useState('renda')
  const [valor, setValor] = useState(PARAMETROS.renda.baseline)
  const [hipotese, setHipotese] = useState('') // hipótese de elasticidade do jurista (opcional)
  const [resposta, setResposta] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const p = PARAMETROS[parametro]

  function trocarParametro(novo) {
    setParametro(novo)
    setValor(PARAMETROS[novo].baseline)
    setResposta(null)
  }

  async function calcular() {
    setCarregando(true)
    const elasticidadeHipotese = hipotese.trim() === '' ? null : parseFloat(hipotese.replace(',', '.'))
    const r = await simularImpacto(parametro, valor, elasticidadeHipotese)
    setResposta(r)
    setCarregando(false)
  }

  const naoCalibrado = resposta && resposta.estado === 'NAO_CALIBRADO'

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/75">
        O jurista mexe num parâmetro da norma e o sistema estima a variação de beneficiários e de gasto, e
        acende o semáforo de pressão sobre o art. 201. Tudo é estimativa de ordem de grandeza, não previsão
        oficial.
      </p>

      {/* Rótulo obrigatório de honestidade metodológica */}
      <p className="rounded-marca border-l-4 border-observa-menta bg-observa-menta/10 p-3 text-xs leading-relaxed text-observa-petroleo/80">
        ⚠️ Estimativa de ordem de grandeza (microssimulação de 1ª ordem). Não capta comportamento nem
        equilíbrio geral. Elasticidades pendentes de calibração na PNADc.
      </p>

      {/* Escolha do parâmetro */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PARAMETROS).map(([id, def]) => (
          <button
            key={id}
            onClick={() => trocarParametro(id)}
            className={`rounded-marca px-4 py-2 text-sm font-semibold transition ${
              parametro === id
                ? 'bg-observa-petroleo text-white'
                : 'bg-white text-observa-petroleo/70 border border-observa-borda'
            }`}
          >
            {{ renda: 'Limiar de renda', idade: 'Idade do idoso', deficiencia: 'Deficiência' }[id]}
          </button>
        ))}
      </div>

      {/* Controle */}
      <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
        <label className="block text-sm font-semibold text-observa-petroleo">{p.rotulo}</label>
        <p className="mt-0.5 text-xs text-observa-petroleo/60">{p.descricao}</p>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={valor}
            onChange={(e) => setValor(parseFloat(e.target.value))}
            className="flex-1 accent-observa-petroleo"
          />
          <span className="min-w-28 text-right text-base font-bold text-observa-menta">{p.fmt(valor)}</span>
        </div>
        <p className="mt-1 text-xs text-observa-petroleo/50">Baseline legal: {p.fmt(p.baseline)}</p>

        {/* Campo opcional: hipótese de elasticidade do jurista (não calibrada) */}
        <div className="mt-4 border-t border-observa-borda pt-4">
          <label className="block text-sm font-semibold text-observa-petroleo">
            Hipótese de elasticidade (jurista) — opcional
          </label>
          <input
            value={hipotese}
            onChange={(e) => setHipotese(e.target.value)}
            placeholder="deixe vazio: pendente de calibração na PNADc"
            className="mt-1 w-full rounded-marca border border-observa-borda bg-white px-3 py-2 text-sm text-observa-petroleo focus:border-observa-menta focus:outline-none"
          />
          <p className="mt-1 text-xs italic text-observa-petroleo/50">
            Sem este campo, o sistema não inventa número: as elasticidades estão pendentes de calibração na
            PNADc. Ao informar uma hipótese, o resultado sai rotulado como hipótese do jurista, não calibrada.
          </p>
        </div>

        <button
          onClick={calcular}
          disabled={carregando}
          className="mt-4 rounded-marca bg-observa-petroleo px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-50"
        >
          {carregando ? 'Estimando…' : 'Estimar impacto'}
        </button>
      </div>

      {naoCalibrado && (
        <div className="rounded-marca border-l-4 border-sinal-amarelo bg-white p-5 shadow-carta">
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
            Estimativa pendente de calibração (PNADc)
          </p>
          <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/80">
            O sistema não inventa número. A elasticidade deste parâmetro ainda não foi calibrada sobre a PNADc.
            Calcule a elasticidade na PNADc ou informe acima uma hipótese explícita do jurista — que sairá
            rotulada como não calibrada.
          </p>
          {resposta.mensagem && (
            <p className="mt-2 text-sm italic text-observa-petroleo/60">{resposta.mensagem}</p>
          )}
        </div>
      )}

      {resposta && !naoCalibrado && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
              <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
                Variação de beneficiários
              </p>
              <p className={`mt-1 text-2xl font-bold ${resposta.delta_beneficiarios >= 0 ? 'text-sinal-vermelho' : 'text-sinal-verde'}`}>
                {resposta.delta_beneficiarios >= 0 ? '+' : ''}
                {Math.round(resposta.delta_beneficiarios).toLocaleString('pt-BR')}
              </p>
              <p className="mt-1 text-xs text-observa-petroleo/50">pessoas (ordem de grandeza)</p>
            </div>
            <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
              <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/60">
                Variação de gasto anual
              </p>
              <p className={`mt-1 text-2xl font-bold ${resposta.delta_reais >= 0 ? 'text-sinal-vermelho' : 'text-sinal-verde'}`}>
                {resposta.delta_reais >= 0 ? '+' : '−'}
                {reaisGrandes(Math.abs(resposta.delta_reais))}/ano
              </p>
              <p className="mt-1 text-xs text-observa-petroleo/50">
                gasto novo: {reaisGrandes(resposta.gasto_novo)}/ano
              </p>
            </div>
          </div>

          {resposta.calibracao && (
            <p className="text-xs italic text-observa-petroleo/60">
              Base da estimativa: {resposta.calibracao}.
            </p>
          )}

          <SemaforoArt201 semaforo={resposta.semaforo} />
          <OrigemDado origem={resposta._origem} />
        </>
      )}
    </div>
  )
}

/* ─── App ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const [aba, setAba] = useState('valoracao')
  const abas = [
    { id: 'valoracao', label: 'Valoração do caso' },
    { id: 'impacto', label: 'Impacto e art. 201' },
  ]

  return (
    <div className="flex min-h-screen flex-col font-principal text-observa-petroleo">
      {/* Cabeçalho com o logo do ObservaSocial */}
      <header className="bg-observa-petroleo text-white shadow">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <img
            src="/marca/logo-fundo-verde.jpg"
            alt="ObservaSocial"
            className="h-12 w-12 rounded-marca object-cover"
          />
          <div>
            <div className="text-base font-bold leading-tight">ObservaSocial · Simulador deôntico do BPC</div>
            <div className="text-xs leading-tight text-white/70">
              Benefício de Prestação Continuada — o sistema aplica a norma; quem decide é o jurista
            </div>
          </div>
        </div>
      </header>

      {/* Aviso de protótipo */}
      <div className="bg-observa-menta/15 text-center text-xs font-semibold text-observa-petroleo/80">
        <div className="mx-auto max-w-4xl px-4 py-1.5">
          PROTÓTIPO / ILUSTRATIVO — sem execução empírica real. A IA apenas interpreta e propõe; jamais decide.
        </div>
      </div>

      {/* Abas */}
      <nav className="border-b-2 border-observa-borda bg-white">
        <div className="mx-auto flex max-w-4xl px-4">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`-mb-0.5 border-b-2 px-4 py-3 text-sm transition ${
                aba === a.id
                  ? 'border-observa-petroleo font-bold text-observa-petroleo'
                  : 'border-transparent text-observa-petroleo/55'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 bg-observa-fundo py-8">
        <div className="mx-auto max-w-4xl px-4">
          {aba === 'valoracao' && <TelaValoracao />}
          {aba === 'impacto' && <TelaImpacto />}
        </div>
      </main>

      <footer className="border-t border-observa-borda bg-white py-3 text-center text-xs text-observa-petroleo/50">
        ObservaSocial · Pesquisa em Políticas Sociais · publicação futura em aluno.lamarck.adv.br/profeduardo
      </footer>
    </div>
  )
}
