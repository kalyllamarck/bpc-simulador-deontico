/* Fase 4 — Decisão (MacCormick).
 *
 * Mostra as camadas da justificação: primeiro o silogismo dedutivo (1ª ordem); se
 * não fecha, os três portões (universalizabilidade, consistência, coerência) da 2ª
 * ordem. Chama POST /decidir-maccormick. O functor final passa pelo léxico.
 */
import { useState } from 'react'
import { useCaso, casoParaRequerente } from '../CasoContext'
import { decidirMacCormick } from '../api'
import SilogismoDedutivo from './SilogismoDedutivo'
import TresGates from './TresGates'
import { OrigemDado } from '../componentes/Resultado'
import { functor } from '../lexico'
import Citacao from '../componentes/Citacao'
import NotaCitacao from '../componentes/NotaCitacao'
import { AUTORES } from '../citacoes'

const CLASSE = {
  verde: 'text-sinal-verde border-sinal-verde',
  amarelo: 'text-sinal-amarelo border-sinal-amarelo',
  vermelho: 'text-sinal-vermelho border-sinal-vermelho',
}

export default function DecisaoMacCormick() {
  const { caso, registrarResultado } = useCaso()
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function decidir() {
    setCarregando(true)
    const r = await decidirMacCormick(casoParaRequerente(caso))
    setResultado(r)
    registrarResultado('decisao', r)
    setCarregando(false)
  }

  const f = resultado ? functor(resultado.functor_final) : null

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/80">
        MacCormick distingue duas camadas de justificação
        <NotaCitacao id="MC01-u01" />. A primeira é dedutiva: se o caso cabe no silogismo, a
        conclusão decorre direto. Quando o silogismo não fecha, sobe-se à segunda ordem, que
        pergunta se a decisão é universalizável, consistente com o sistema e coerente com seus
        princípios. Quando o silogismo fecha, o sistema aplica a norma e a conclusão decorre da
        subsunção; quando não fecha, estrutura a justificação de 2ª ordem e, persistindo a
        indeterminação, o caso escala para o estudo social.
      </p>

      <Citacao
        rotulo="Neil MacCormick — justificação de 2ª ordem"
        texto="Quando a dedução não basta, a decisão deve ser universalizável, consistente com as normas válidas e coerente com os princípios do sistema jurídico."
        fonte={{
          titulo: AUTORES.maccormick.obra,
          abnt: AUTORES.maccormick.abnt,
          print: AUTORES.maccormick.print,
        }}
      />

      <div>
        <button
          onClick={decidir}
          disabled={carregando}
          className="rounded-marca bg-observa-petroleo px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-50"
        >
          {carregando ? 'Percorrendo as camadas…' : 'Decidir pelas camadas de MacCormick'}
        </button>
      </div>

      {resultado && (
        <>
          <SilogismoDedutivo silogismo={resultado.silogismo} />
          {!resultado.silogismo?.fecha && <TresGates gates={resultado.gates} />}

          <div className={`rounded-marca border-l-4 bg-white p-5 shadow-carta ${CLASSE[f.sinal]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
              Functor final da norma
            </p>
            <p className={`mt-1 text-xl font-bold ${CLASSE[f.sinal]}`}>{f.rotulo}</p>
            <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/85">{f.nota}</p>
          </div>

          <OrigemDado origem={resultado._origem} />
        </>
      )}
    </div>
  )
}
