/* Fase 3 — Fase valorativa.
 *
 * Entra quando as regras rígidas não fecham (resíduo valorativo, §11). O jurista
 * escolhe a âncora metodológica — Alexy ou Müller — de forma explícita, e o sistema
 * estrutura o argumento conforme o método (decide:false). Chama POST /valorar.
 */
import { useState } from 'react'
import { useCaso, casoParaRequerente } from '../CasoContext'
import { valorar } from '../api'
import AncoraMetodologica from './AncoraMetodologica'
import ExplicacaoAlexy from './ExplicacaoAlexy'
import ExplicacaoMuller from './ExplicacaoMuller'
import { OrigemDado } from '../componentes/Resultado'

export default function FaseValorativa() {
  const { caso, registrarResultado } = useCaso()
  const [ancora, setAncora] = useState('alexy')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function aplicar() {
    setCarregando(true)
    const r = await valorar(casoParaRequerente(caso), ancora)
    setResultado(r)
    registrarResultado('valorativa', r)
    setCarregando(false)
  }

  function escolher(novaAncora) {
    setAncora(novaAncora)
    setResultado(null) // troca de método zera só o resultado, nunca o caso
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/80">
        Quando as regras rígidas não fecham — a renda supera o ¼, mas o §11 admite outros elementos de
        miserabilidade —, abre-se o resíduo valorativo. Aqui o jurista escolhe, de forma explícita, o método
        de valoração. O sistema apenas estrutura o argumento; a decisão continua sendo humana.
      </p>

      <div>
        <p className="mb-2 text-sm font-semibold text-observa-petroleo">Âncora metodológica (escolha do jurista)</p>
        <AncoraMetodologica ancora={ancora} onEscolher={escolher} />
      </div>

      {ancora === 'alexy' ? <ExplicacaoAlexy resultado={resultado} /> : <ExplicacaoMuller resultado={resultado} />}

      <div>
        <button
          onClick={aplicar}
          disabled={carregando}
          className="rounded-marca bg-observa-petroleo px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-50"
        >
          {carregando ? 'Estruturando o argumento…' : `Estruturar pela âncora ${ancora === 'alexy' ? 'de Alexy' : 'de Müller'}`}
        </button>
      </div>

      {resultado && (
        <>
          <p className="rounded-marca border-l-4 border-observa-menta bg-observa-menta/10 p-3 text-xs leading-relaxed text-observa-petroleo/85">
            O sistema estrutura o raciocínio; ele não decide (a saída traz <code>decide: falso</code>). A
            conclusão sobre a miserabilidade cabe ao jurista, no estudo social.
          </p>
          <OrigemDado origem={resultado._origem} />
        </>
      )}
    </div>
  )
}
