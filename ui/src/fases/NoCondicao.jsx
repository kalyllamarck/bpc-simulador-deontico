/* Nó de condição — um dispositivo do art. 20 que faz uma pergunta sim/não.
 * Usado como nó personalizado dentro do canvas do React Flow.
 */
import { Handle, Position } from '@xyflow/react'

export default function NoCondicao({ data }) {
  return (
    <div className="w-56 rounded-marca border border-observa-borda bg-white p-3 shadow-carta">
      <Handle type="target" position={Position.Top} className="!bg-observa-petroleo" />
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-menta">
        {data.dispositivo}
      </p>
      <p className="mt-1 text-sm leading-snug text-observa-petroleo">{data.rotulo}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-observa-petroleo" />
    </div>
  )
}
