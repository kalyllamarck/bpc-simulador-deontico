/* Fase 1 — Grafo da norma.
 *
 * Canvas (React Flow) que mostra a complexidade do art. 20: cada condição é um nó
 * (vedação §4º, público caput, impedimento §2º+§10, renda §3º, miserabilidade §11)
 * e as arestas sim/não levam às três folhas (os functores). Os dados vêm de
 * GET /grafo, com fallback offline embutido no api.js.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { obterGrafo } from '../api'
import NoCondicao from './NoCondicao'
import NoEstadoTerminal from './NoEstadoTerminal'
import PainelComplexidade from './PainelComplexidade'
import Citacao from '../componentes/Citacao'
import { DISPOSITIVOS } from '../citacoes'

const tiposDeNo = { condicao: NoCondicao, terminal: NoEstadoTerminal }

/* Posições fixas — leitura de cima para baixo, na ordem da lei. */
const POSICOES = {
  p04: { x: 320, y: 0 },
  caput: { x: 320, y: 120 },
  p02: { x: 320, y: 240 },
  p03: { x: 320, y: 360 },
  p11: { x: 320, y: 480 },
  F: { x: 40, y: 300 },
  O: { x: 600, y: 420 },
  IND: { x: 320, y: 600 },
}

export default function GrafoDaNorma() {
  const [grafo, setGrafo] = useState(null)

  useEffect(() => {
    obterGrafo().then(setGrafo)
  }, [])

  const nodes = useMemo(() => {
    if (!grafo) return []
    return grafo.nos.map((n) => ({
      id: n.id,
      type: n.tipo === 'terminal' ? 'terminal' : 'condicao',
      position: POSICOES[n.id] || { x: 0, y: 0 },
      data: { rotulo: n.rotulo, dispositivo: n.dispositivo },
      draggable: true,
    }))
  }, [grafo])

  const edges = useMemo(() => {
    if (!grafo) return []
    return grafo.arestas.map((a, i) => ({
      id: `e${i}`,
      source: a.de,
      target: a.para,
      label: a.condicao,
      labelStyle: { fontSize: 11, fill: '#3d4f4f', fontWeight: 600 },
      labelBgStyle: { fill: '#ffffff' },
      style: { stroke: a.condicao === 'sim' ? '#27ae60' : '#c0392b', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: a.condicao === 'sim' ? '#27ae60' : '#c0392b' },
    }))
  }, [grafo])

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/80">
        A norma do art. 20 da LOAS não é uma regra única: é um encadeamento de condições. Este mapa
        mostra cada decisão e os caminhos até um dos três desfechos. Verde = a condição foi satisfeita;
        vermelho = a condição barrou. A máquina apenas percorre este caminho; quem decide é o jurista.
      </p>

      <Citacao
        rotulo={DISPOSITIVOS.caput.rotulo}
        texto={DISPOSITIVOS.caput.texto}
        fonte={{ titulo: 'Lei nº 8.742/1993 (LOAS)', abnt: 'BRASIL. Lei nº 8.742, de 7 de dezembro de 1993. Dispõe sobre a organização da Assistência Social (LOAS).', print: DISPOSITIVOS.caput.print }}
      />

      <div className="h-[620px] w-full rounded-marca border border-observa-borda bg-observa-fundo shadow-carta">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={tiposDeNo}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
        >
          <Background color="#ccd1d9" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {grafo && (
        <PainelComplexidade complexidade={grafo.complexidade} explicacao={grafo.explicacao} />
      )}

      <p className="text-xs italic text-observa-petroleo/70">
        {grafo?._origem === 'motor'
          ? 'Grafo produzido pelo motor da norma.'
          : 'Grafo de demonstração (o motor não respondeu). A forma espelha a saída real.'}
      </p>
    </div>
  )
}
