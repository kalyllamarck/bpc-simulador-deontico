/* Canvas React Flow do grafo — isolado para LAZY-LOAD (o @xyflow/react é pesado em
 * mobile). Recebe nós/arestas já montados e o clique de nó (drill-down). Default export
 * para React.lazy. A cor da aresta vem do TIPO do destino (ver dominio/grafo.js).
 */
import { ReactFlow, Background, Controls, MarkerType } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import NoCondicao from './NoCondicao'
import NoEstadoTerminal from './NoEstadoTerminal'
import { tipoDestino, COR_RAMO } from '../dominio/grafo'

const tiposDeNo = { condicao: NoCondicao, terminal: NoEstadoTerminal }

export default function GrafoCanvas({ grafo, onSelecionarNo }) {
  let iDecisao = 0
  let iTerminal = 0
  const nodes = grafo.nos.map((n) => {
    const ehTerminal = n.tipo === 'terminal'
    const position = ehTerminal
      ? { x: 680, y: 80 + iTerminal++ * 180 }
      : { x: 300, y: iDecisao++ * 135 }
    return {
      id: n.id,
      type: ehTerminal ? 'terminal' : 'condicao',
      position,
      data: { rotulo: n.rotulo, dispositivo: n.dispositivo },
      draggable: true,
    }
  })

  const edges = grafo.arestas.map((a, i) => {
    const cor = COR_RAMO[tipoDestino(a.para)]
    return {
      id: `e${i}`,
      source: a.de,
      target: a.para,
      label: a.condicao,
      labelStyle: { fontSize: 11, fill: '#3d4f4f', fontWeight: 600 },
      labelBgStyle: { fill: '#ffffff' },
      style: { stroke: cor, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: cor },
    }
  })

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={tiposDeNo}
      fitView
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      onNodeClick={(_, no) => onSelecionarNo(no.id)}
    >
      <Background color="#ccd1d9" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}
