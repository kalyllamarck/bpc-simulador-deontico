/* Três portões deônticos — a justificação de 2ª ordem de MacCormick:
 * universalizabilidade, consistência e coerência. Quando o silogismo não fecha,
 * a decisão sobe a estes portões. O sistema percorre; quem decide é o jurista.
 */
export default function TresGates({ gates }) {
  if (!gates) return null
  return (
    <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
        Justificação de 2ª ordem — três portões deônticos
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {gates.map((g) => {
          const cor = g.passou ? 'text-sinal-verde' : 'text-sinal-amarelo'
          const ponto = g.passou ? 'bg-sinal-verde' : 'bg-sinal-amarelo'
          return (
            <li key={g.nome} className="flex items-start gap-3">
              <span className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ${ponto}`} />
              <div>
                <p className={`text-sm font-semibold ${cor}`}>
                  {g.nome} — {g.passou ? 'satisfeito' : 'em aberto (juízo do jurista)'}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-observa-petroleo/85">{g.explicacao}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
