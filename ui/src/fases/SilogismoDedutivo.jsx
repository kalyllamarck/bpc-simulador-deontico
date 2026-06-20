/* Silogismo dedutivo — a justificação de 1ª ordem de MacCormick.
 * Mostra premissa maior, premissa menor e conclusão, e se o silogismo fecha.
 */
import NotaCitacao from '../componentes/NotaCitacao'

export default function SilogismoDedutivo({ silogismo }) {
  if (!silogismo) return null
  const fecha = silogismo.fecha
  const cor = fecha ? 'border-sinal-verde' : 'border-sinal-amarelo'
  return (
    <div className={`rounded-marca border-l-4 ${cor} bg-white p-5 shadow-carta`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
        Justificação de 1ª ordem — silogismo dedutivo
      </p>
      <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/80">
        Subsunção da premissa menor (o fato) à premissa maior (a norma): satisfeito o suporte
        fático, o functor deôntico da conclusão decorre dedutivamente, sem espaço para juízo
        valorativo.
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {(silogismo.rastro || []).map((linha, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-observa-petroleo/90">
            <span className="font-mono text-observa-menta">{i + 1}.</span>
            <span>{linha}</span>
          </li>
        ))}
      </ol>
      <p
        className={`mt-3 text-sm font-semibold ${fecha ? 'text-sinal-verde' : 'text-sinal-amarelo'}`}
      >
        {fecha ? (
          'O silogismo fecha: a conclusão decorre dedutivamente das premissas e o sistema aplica a norma por subsunção.'
        ) : (
          <>
            O silogismo não fecha: a premissa maior é derrotável
            <NotaCitacao id="A001-u01" />, e o caso exige a justificação de 2ª ordem (abaixo).
          </>
        )}
      </p>
    </div>
  )
}
