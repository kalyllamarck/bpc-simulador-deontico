/* Nó terminal — uma folha do grafo: um dos três functores deônticos.
 * O rótulo do functor passa SEMPRE pelo léxico (nunca o token cru na tela).
 */
import { Handle, Position } from '@xyflow/react'
import { functor } from '../lexico'

const COR = {
  verde: 'border-sinal-verde bg-sinal-verde/10 text-sinal-verde',
  amarelo: 'border-sinal-amarelo bg-sinal-amarelo/10 text-sinal-amarelo',
  vermelho: 'border-sinal-vermelho bg-sinal-vermelho/10 text-sinal-vermelho',
}

export default function NoEstadoTerminal({ data }) {
  const f = functor(data.rotulo) // data.rotulo traz o token; aqui vira texto jurídico
  return (
    <div className={`w-48 rounded-marca border-2 p-3 text-center shadow-carta ${COR[f.sinal]}`}>
      <Handle type="target" position={Position.Top} className="!bg-observa-petroleo" />
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Desfecho da norma</p>
      <p className="mt-1 text-sm font-bold leading-snug">{f.rotulo}</p>
    </div>
  )
}
