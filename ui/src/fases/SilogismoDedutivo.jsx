/* Silogismo dedutivo — a justificação de 1ª ordem de MacCormick.
 * Mostra premissa maior, premissa menor e conclusão, e se o silogismo fecha.
 */
export default function SilogismoDedutivo({ silogismo }) {
  if (!silogismo) return null
  const fecha = silogismo.fecha
  const cor = fecha ? 'border-sinal-verde' : 'border-sinal-amarelo'
  return (
    <div className={`rounded-marca border-l-4 ${cor} bg-white p-5 shadow-carta`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
        Justificação de 1ª ordem — silogismo dedutivo
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
        {fecha
          ? 'O silogismo fecha: a conclusão decorre dedutivamente das premissas.'
          : 'O silogismo não fecha: o caso exige a justificação de 2ª ordem (abaixo).'}
      </p>
    </div>
  )
}
