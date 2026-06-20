/* Fase 3 — Grafo interativo dos §§.
 *
 * Canvas (React Flow) NAVEGÁVEL que mostra a complexidade do art. 20: cada condição é um
 * nó (vedação §4º, público caput, impedimento §2º+§10, renda §3º, miserabilidade §11) e
 * as arestas levam aos três functores. Clicar num nó abre o DRILL-DOWN (PainelDispositivo)
 * com o dispositivo e sua tradução deôntica. Dados de GET /grafo (fallback offline igual).
 * O canvas é lazy-loaded (bundle leve em mobile).
 */
import { Suspense, lazy, useEffect, useState } from 'react'
import { obterGrafo } from '../api'
import PainelComplexidade from './PainelComplexidade'
import PainelDispositivo from './PainelDispositivo'
import Citacao from '../componentes/Citacao'
import NotaCitacao from '../componentes/NotaCitacao'
import { DISPOSITIVOS } from '../citacoes'
import { Revelar } from '../animacao/Revelar'

const GrafoCanvas = lazy(() => import('./GrafoCanvas'))

export default function GrafoDaNorma() {
  const [grafo, setGrafo] = useState(null)
  const [noSel, setNoSel] = useState(null)

  useEffect(() => {
    obterGrafo().then(setGrafo)
  }, [])

  const noSelecionado = grafo?.nos.find((n) => n.id === noSel) || null

  return (
    <div className="flex flex-col gap-6">
      <Revelar>
        <p className="text-sm leading-relaxed text-observa-petroleo/80">
          O art. 20 da LOAS não é uma regra única, mas um encadeamento de condições — estrutura cujo
          número de caminhos independentes é medido pela <strong>complexidade ciclomática</strong>.
          Este mapa é <strong>navegável</strong>: arraste para mover, aplique <strong>zoom</strong>{' '}
          e <strong>clique num nó</strong> para estudar o dispositivo correspondente. Verde =
          condição satisfeita; vermelho = condição que barra; amarelo = estado indeterminado. O
          sistema <strong>aplica</strong> a norma percorrendo o grafo por <strong>subsunção</strong>{' '}
          do caso a cada condição; o jurista intervém de modo externo, no estudo social, apenas
          quando o estado se torna indeterminado — formalizar essa estrutura como sistema lógico é o
          estado da arte do direito computável.
          <NotaCitacao id="LN03-u01" />
        </p>
      </Revelar>

      <Citacao
        rotulo={DISPOSITIVOS.caput.rotulo}
        texto={DISPOSITIVOS.caput.texto}
        fonte={{
          titulo: 'Lei nº 8.742/1993 (LOAS)',
          abnt: 'BRASIL. Lei nº 8.742, de 7 de dezembro de 1993. Dispõe sobre a organização da Assistência Social (LOAS).',
          print: DISPOSITIVOS.caput.print,
        }}
      />

      <div className="h-[620px] w-full rounded-marca border border-observa-borda bg-observa-fundo shadow-carta">
        {grafo ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-observa-petroleo/60">
                Carregando o grafo…
              </div>
            }
          >
            <GrafoCanvas grafo={grafo} onSelecionarNo={setNoSel} />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-observa-petroleo/60">
            Carregando o grafo…
          </div>
        )}
      </div>

      {/* Drill-down do nó clicado */}
      {noSelecionado && (
        <PainelDispositivo
          noId={noSelecionado.id}
          rotulo={noSelecionado.rotulo}
          dispositivo={noSelecionado.dispositivo}
          onFechar={() => setNoSel(null)}
        />
      )}

      {grafo && (
        <PainelComplexidade complexidade={grafo.complexidade} explicacao={grafo.explicacao} />
      )}

      <p className="text-xs italic text-observa-petroleo/70">
        {grafo?._origem === 'motor'
          ? 'Grafo produzido pelo motor da norma; cada nó terminal corresponde a um functor deôntico ou à abertura valorativa.'
          : 'Grafo de demonstração (o motor não respondeu). A forma espelha a saída real.'}
      </p>
    </div>
  )
}
