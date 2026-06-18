/* Seletor da âncora metodológica — explícito: Alexy (ponderação) ou Müller
 * (concretização). A escolha do método é do jurista, não da máquina.
 */
const OPCOES = [
  { id: 'alexy', titulo: 'Alexy', nota: 'Ponderação de princípios (mandado de otimização)' },
  { id: 'muller', titulo: 'Müller', nota: 'Concretização (programa × âmbito da norma)' },
]

export default function AncoraMetodologica({ ancora, onEscolher }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {OPCOES.map((o) => {
        const ativo = ancora === o.id
        return (
          <button
            key={o.id}
            onClick={() => onEscolher(o.id)}
            className={`rounded-marca border p-4 text-left transition ${
              ativo
                ? 'border-observa-petroleo bg-observa-petroleo text-white'
                : 'border-observa-borda bg-white text-observa-petroleo hover:border-observa-menta'
            }`}
          >
            <p className="text-base font-bold">{o.titulo}</p>
            <p className={`mt-0.5 text-xs ${ativo ? 'text-white/85' : 'text-observa-petroleo/70'}`}>
              {o.nota}
            </p>
          </button>
        )
      })}
    </div>
  )
}
