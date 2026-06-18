/* Termo deôntico — etiqueta sóbria de um operador lógico (∨ ∧ ¬ <) ou functor (O P F).
 * Mostra o símbolo num selo e o nome ao lado. Usada na tradução do caput e no drill-down.
 */
export default function TermoDeontico({ simbolo, nome, variante = 'operador' }) {
  const cor =
    variante === 'functor'
      ? 'bg-observa-petroleo text-white'
      : 'bg-observa-menta/20 text-observa-petroleo'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-marca border border-observa-borda bg-white px-2 py-0.5 text-xs">
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-sm font-bold ${cor}`}
      >
        {simbolo}
      </span>
      <span className="font-medium text-observa-petroleo/85">{nome}</span>
    </span>
  )
}
