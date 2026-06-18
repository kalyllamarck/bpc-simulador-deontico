/* Citação — bloco com o texto citado (legal ou doutrinário) e um botão que abre
 * a Fonte (referência ABNT + print). Sóbrio, identidade ObservaSocial.
 */
import { useState } from 'react'
import Fonte from './Fonte'

export default function Citacao({ rotulo, texto, fonte }) {
  const [aberto, setAberto] = useState(false)
  return (
    <blockquote className="rounded-marca border-l-4 border-observa-menta bg-observa-palido/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
          {rotulo}
        </p>
        {fonte && (
          <button
            onClick={() => setAberto(true)}
            className="shrink-0 text-xs font-semibold text-observa-menta underline-offset-2 hover:underline"
          >
            ver fonte
          </button>
        )}
      </div>
      <p className="mt-2 text-sm italic leading-relaxed text-observa-petroleo/90">“{texto}”</p>
      {aberto && fonte && (
        <Fonte
          titulo={fonte.titulo || rotulo}
          abnt={fonte.abnt}
          print={fonte.print}
          onFechar={() => setAberto(false)}
        />
      )}
    </blockquote>
  )
}
