/* Seletor da âncora metodológica — explícito: Alexy (ponderação) ou Müller
 * (concretização). A âncora metodológica é doutrinária e explícita; a IA opera
 * dentro dela, no resíduo valorativo.
 */
import NotaCitacao from '../componentes/NotaCitacao'

const OPCOES = [
  { id: 'alexy', titulo: 'Alexy', nota: 'Ponderação de princípios (mandado de otimização)' },
  { id: 'muller', titulo: 'Müller', nota: 'Concretização (programa × âmbito da norma)' },
]

export default function AncoraMetodologica({ ancora, onEscolher }) {
  return (
    <div className="flex flex-col gap-3">
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
              <p
                className={`mt-0.5 text-xs ${ativo ? 'text-white/85' : 'text-observa-petroleo/70'}`}
              >
                {o.nota}
              </p>
            </button>
          )
        })}
      </div>
      <p className="text-xs leading-relaxed text-observa-petroleo/65">
        Duas âncoras concorrentes para concretizar o conceito indeterminado de miserabilidade: a
        ponderação de Alexy, que trata o princípio como mandado de otimização
        <NotaCitacao id="DOC002-u01" />, e a teoria estruturante de Müller, que decide na tensão
        entre programa e âmbito da norma
        <NotaCitacao id="DOC003-u01" />. A escolha é metodológica e explícita; a IA opera dentro
        dela, no resíduo valorativo, sem decidir o gate.
      </p>
    </div>
  )
}
