/* Fase complementar — Impacto e art. 201.
 *
 * O jurista altera hipoteticamente um parâmetro do benefício e o sistema estima a
 * variação de beneficiários e de gasto, acendendo o indicador argumentativo de pressão
 * sobre o equilíbrio do art. 201. Tudo é estimativa de ordem de grandeza, não previsão
 * oficial. O sistema aplica a norma; a IA jamais decide.
 *
 * Correção da auditoria: "baseline" vira "patamar legal" na tela; o slider persiste
 * o valor no cálculo (estado local controlado, lido no botão Estimar).
 */
import { useState } from 'react'
import { simularImpacto } from '../api'
import { OrigemDado } from '../componentes/Resultado'
import NotaCitacao from '../componentes/NotaCitacao'

const CLASSE_SINAL = {
  verde: { ponto: 'bg-sinal-verde', texto: 'text-sinal-verde', borda: 'border-sinal-verde' },
  amarelo: {
    ponto: 'bg-sinal-amarelo',
    texto: 'text-sinal-amarelo',
    borda: 'border-sinal-amarelo',
  },
  vermelho: {
    ponto: 'bg-sinal-vermelho',
    texto: 'text-sinal-vermelho',
    borda: 'border-sinal-vermelho',
  },
}

function reaisGrandes(valor) {
  const bi = valor / 1e9
  if (Math.abs(bi) >= 1) return `R$ ${bi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`
  const mi = valor / 1e6
  return `R$ ${mi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
}

const PARAMETROS = {
  renda: {
    rotulo: 'Limiar de renda (frações do salário mínimo)',
    patamar: 0.25,
    min: 0.25,
    max: 0.5,
    step: 0.01,
    fmt: (v) => `${v.toFixed(2)} SM`,
    descricao:
      'Sobe ou desce o teto de renda per capita do art. 20, §3º (patamar legal: ¼ = 0,25 SM).',
  },
  idade: {
    rotulo: 'Idade mínima da pessoa idosa (anos)',
    patamar: 65,
    min: 60,
    max: 70,
    step: 1,
    fmt: (v) => `${v} anos`,
    descricao: 'Corte etário do art. 20, caput (patamar legal: 65 anos).',
  },
  deficiencia: {
    rotulo: 'Prazo de impedimento de longo prazo (meses)',
    patamar: 24,
    min: 6,
    max: 36,
    step: 1,
    fmt: (v) => `${v} meses`,
    descricao: 'Duração mínima do impedimento (art. 20, §10; patamar legal: 24 meses).',
  },
}

function SemaforoArt201({ semaforo }) {
  if (!semaforo) return null
  const c = CLASSE_SINAL[semaforo.cor]
  const rotuloForca = {
    verde: 'Pressão BAIXA',
    amarelo: 'Pressão MODERADA',
    vermelho: 'Pressão ALTA',
  }[semaforo.cor]
  return (
    <div className={`rounded-marca border-l-4 ${c.borda} bg-white p-5 shadow-carta`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
        Indicador argumentativo do art. 201, CF/88 — pressão sobre a seguridade social
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-block h-4 w-4 rounded-full ${c.ponto}`} />
        <span className={`text-lg font-bold ${c.texto}`}>{rotuloForca}</span>
        <span className="text-sm text-observa-petroleo/70">
          (gasto a {semaforo.peso_pct >= 0 ? '+' : ''}
          {semaforo.peso_pct.toFixed(1)}% do patamar atual · peso {semaforo.peso.toFixed(2)}x)
        </span>
      </div>
      <p className="mt-3 rounded-marca bg-observa-palido/40 p-3 text-sm leading-relaxed text-observa-petroleo/85">
        Este sinal é{' '}
        <strong>
          indicador argumentativo; não declara inconstitucionalidade nem emite veredito
        </strong>
        . O benefício de prestação continuada é prestação de assistência social (art. 203, V), não
        seguro contributivo regido pelo equilíbrio do art. 201 — o vínculo entre a despesa e o
        equilíbrio da seguridade social é argumentativo, não automático. O semáforo apenas mede a
        pressão fiscal sobre a seguridade, cuja ordem de grandeza se aproxima do gasto público
        brasileiro com pensões em proporção do PIB
        <NotaCitacao id="O001-u01" />, e a cuja leitura ortodoxa se associa a controvertida tese do
        limiar dívida/PIB
        <NotaCitacao id="EC05-u01" />. Essa pressão deve ser ponderada contra o mínimo existencial
        que o benefício assegura
        <NotaCitacao id="LN09-u01" />.
      </p>
    </div>
  )
}

export default function TelaImpacto() {
  const [parametro, setParametro] = useState('renda')
  const [valor, setValor] = useState(PARAMETROS.renda.patamar)
  const [hipotese, setHipotese] = useState('')
  const [resposta, setResposta] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const p = PARAMETROS[parametro]

  function trocarParametro(novo) {
    setParametro(novo)
    setValor(PARAMETROS[novo].patamar)
    setResposta(null)
  }

  async function calcular() {
    setCarregando(true)
    const elasticidadeHipotese =
      hipotese.trim() === '' ? null : parseFloat(hipotese.replace(',', '.'))
    // Lê o valor atual do slider (persistido no estado) — corrige o slider que não entrava no cálculo.
    const r = await simularImpacto(parametro, valor, elasticidadeHipotese)
    setResposta(r)
    setCarregando(false)
  }

  const naoCalibrado = resposta && resposta.estado === 'NAO_CALIBRADO'

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/80">
        Fase complementar. O jurista altera hipoteticamente um parâmetro do benefício — parâmetros
        cuja competência legislativa é privativa da União
        <NotaCitacao id="RD01-u01" /> — e o sistema estima a variação de beneficiários e de gasto,
        acendendo o semáforo de pressão sobre o equilíbrio do art. 201. Todos os números são
        estimativas de ordem de grandeza, não previsão oficial.
      </p>

      <p className="rounded-marca border-l-4 border-observa-menta bg-observa-menta/10 p-3 text-xs leading-relaxed text-observa-petroleo/85">
        Estimativa de ordem de grandeza (microssimulação de primeira ordem). Não capta resposta
        comportamental nem efeitos de equilíbrio geral. As elasticidades permanecem pendentes de
        calibração na PNAD Contínua.
      </p>

      <div className="flex flex-wrap gap-2">
        {Object.keys(PARAMETROS).map((id) => (
          <button
            key={id}
            onClick={() => trocarParametro(id)}
            className={`rounded-marca px-4 py-2 text-sm font-semibold transition ${
              parametro === id
                ? 'bg-observa-petroleo text-white'
                : 'bg-white text-observa-petroleo/80 border border-observa-borda'
            }`}
          >
            {{ renda: 'Limiar de renda', idade: 'Idade do idoso', deficiencia: 'Deficiência' }[id]}
          </button>
        ))}
      </div>

      <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
        <label className="block text-sm font-semibold text-observa-petroleo">{p.rotulo}</label>
        <p className="mt-0.5 text-xs text-observa-petroleo/70">{p.descricao}</p>
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
          <span className="min-w-28 text-right text-base font-bold text-observa-menta">
            {p.fmt(valor)}
          </span>
        </div>
        <p className="mt-1 text-xs text-observa-petroleo/70">Patamar legal: {p.fmt(p.patamar)}</p>

        <div className="mt-4 border-t border-observa-borda pt-4">
          <label className="block text-sm font-semibold text-observa-petroleo">
            Hipótese de elasticidade (jurista) — opcional
          </label>
          <input
            value={hipotese}
            onChange={(e) => setHipotese(e.target.value)}
            placeholder="deixe vazio: pendente de calibração na PNAD Contínua"
            className="mt-1 w-full rounded-marca border border-observa-borda bg-white px-3 py-2 text-sm text-observa-petroleo focus:border-observa-menta focus:outline-none"
          />
          <p className="mt-1 text-xs italic text-observa-petroleo/70">
            Sem este campo, o sistema não arbitra valores: as elasticidades permanecem pendentes de
            calibração na PNAD Contínua. Informada uma hipótese, o resultado sai rotulado como
            hipótese do jurista, não calibrada.
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
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Estimativa pendente de calibração (PNAD Contínua)
          </p>
          <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/85">
            O sistema não arbitra valores. A elasticidade deste parâmetro ainda não foi calibrada
            sobre a PNAD Contínua. Calibre a elasticidade na PNAD Contínua ou informe acima uma
            hipótese explícita do jurista — que sairá rotulada como não calibrada.
          </p>
          {resposta.mensagem && (
            <p className="mt-2 text-sm italic text-observa-petroleo/70">{resposta.mensagem}</p>
          )}
        </div>
      )}

      {resposta && !naoCalibrado && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
              <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
                Variação de beneficiários
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${resposta.delta_beneficiarios >= 0 ? 'text-sinal-vermelho' : 'text-sinal-verde'}`}
              >
                {resposta.delta_beneficiarios >= 0 ? '+' : ''}
                {Math.round(resposta.delta_beneficiarios).toLocaleString('pt-BR')}
              </p>
              <p className="mt-1 text-xs text-observa-petroleo/70">pessoas (ordem de grandeza)</p>
            </div>
            <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
              <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
                Variação de gasto anual
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${resposta.delta_reais >= 0 ? 'text-sinal-vermelho' : 'text-sinal-verde'}`}
              >
                {resposta.delta_reais >= 0 ? '+' : '−'}
                {reaisGrandes(Math.abs(resposta.delta_reais))}/ano
              </p>
              <p className="mt-1 text-xs text-observa-petroleo/70">
                gasto novo: {reaisGrandes(resposta.gasto_novo)}/ano
              </p>
            </div>
          </div>

          {resposta.calibracao && (
            <p className="text-xs italic text-observa-petroleo/70">
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
