import { useState } from 'react'
import { CasoProvider } from './CasoContext'
import { RegistroCitacoesProvider } from './componentes/RegistroCitacoes'
import CabecalhoMarca from './componentes/CabecalhoMarca'
import TraducaoDoCaput from './fases/TraducaoDoCaput'
import RegrasRigidas from './fases/RegrasRigidas'
import FluxogramaDaNorma from './fases/FluxogramaDaNorma'
import GrafoDaNorma from './fases/GrafoDaNorma'
import FaseValorativa from './fases/FaseValorativa'
import DecisaoMacCormick from './fases/DecisaoMacCormick'
import TelaImpacto from './fases/TelaImpacto'

/* ════════════════════════════════════════════════════════════════════════════
 *  Simulador de aplicabilidade da norma do BPC — ObservaSocial · extensão do artigo
 *
 *  Seis passos pedagógicos, na ordem do raciocínio jurídico (revelação gradual):
 *   0. Tradução do caput — texto literal → operadores lógicos e functor (O/P/F)
 *   1. Subsunção dispositivo a dispositivo — a norma acima, o formulário abaixo
 *   2. Fluxograma da norma — o encadeamento R6→R1→R2→R3→§11, top-down
 *   3. Grafo interativo — o mesmo fluxo, navegável, com drill-down por comando
 *   4. Camada valorativa — o resíduo do §11 (âncora Alexy ou Müller)
 *   5. Decisão (MacCormick) — silogismo + três portões
 *
 *  O caso vive no CasoContext e NÃO reinicia ao trocar de fase. A IA jamais decide.
 * ════════════════════════════════════════════════════════════════════════════ */

const FASES = [
  { id: 'caput', numero: 1, titulo: 'Tradução do caput', Componente: TraducaoDoCaput },
  { id: 'regras', numero: 2, titulo: 'Subsunção', Componente: RegrasRigidas },
  { id: 'fluxograma', numero: 3, titulo: 'Fluxograma', Componente: FluxogramaDaNorma },
  { id: 'grafo', numero: 4, titulo: 'Grafo navegável', Componente: GrafoDaNorma },
  { id: 'valorativa', numero: 5, titulo: 'Camada valorativa', Componente: FaseValorativa },
  { id: 'decisao', numero: 6, titulo: 'Decisão (MacCormick)', Componente: DecisaoMacCormick },
]

function Stepper({ atual, onIr }) {
  return (
    <nav className="border-b-2 border-observa-borda bg-white">
      <div className="mx-auto flex max-w-5xl items-stretch gap-1 overflow-x-auto px-4 py-2">
        {FASES.map((f) => {
          const ativo = atual === f.id
          return (
            <button
              key={f.id}
              onClick={() => onIr(f.id)}
              className={`flex shrink-0 items-center gap-2 rounded-marca px-3 py-2 text-left text-sm transition ${
                ativo
                  ? 'bg-observa-petroleo text-white'
                  : 'text-observa-petroleo/80 hover:bg-observa-palido/40'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  ativo
                    ? 'bg-white text-observa-petroleo'
                    : 'bg-observa-palido text-observa-petroleo'
                }`}
              >
                {f.numero}
              </span>
              <span className={ativo ? 'font-bold' : 'font-medium'}>{f.titulo}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function App() {
  const [fase, setFase] = useState('caput')
  const [complementar, setComplementar] = useState(false)

  const indice = FASES.findIndex((f) => f.id === fase)
  const FaseAtual = FASES[indice]?.Componente

  return (
    <CasoProvider>
      <RegistroCitacoesProvider>
        <div className="flex min-h-screen flex-col font-principal text-observa-petroleo">
          <CabecalhoMarca />

          {/* Faixa de protótipo — mantida */}
          <div className="bg-observa-menta/15 text-center text-xs font-semibold text-observa-petroleo/85">
            <div className="mx-auto max-w-5xl px-4 py-1.5">
              PROTÓTIPO / ILUSTRATIVO — sem execução empírica real. A IA apenas interpreta e propõe;
              jamais decide.
            </div>
          </div>

          {!complementar && <Stepper atual={fase} onIr={setFase} />}

          {/* Acesso à fase complementar (impacto) */}
          <div className="border-b border-observa-borda bg-observa-fundo">
            <div className="mx-auto flex max-w-5xl items-center justify-end gap-2 px-4 py-1.5 text-xs">
              <span className="text-observa-petroleo/70">Fase complementar:</span>
              <button
                onClick={() => setComplementar((v) => !v)}
                className={`rounded-marca px-3 py-1 font-semibold transition ${
                  complementar
                    ? 'bg-observa-petroleo text-white'
                    : 'border border-observa-borda bg-white text-observa-petroleo/80'
                }`}
              >
                {complementar ? '← Voltar aos 6 passos' : 'Impacto e art. 201'}
              </button>
            </div>
          </div>

          <main className="flex-1 bg-observa-fundo py-8">
            <div className="mx-auto max-w-5xl px-4">
              {complementar ? (
                <TelaImpacto />
              ) : (
                <>
                  {FaseAtual && <FaseAtual />}
                  {/* Navegação entre fases */}
                  <div className="mt-8 flex items-center justify-between border-t border-observa-borda pt-4">
                    <button
                      onClick={() => indice > 0 && setFase(FASES[indice - 1].id)}
                      disabled={indice === 0}
                      className="rounded-marca border border-observa-borda bg-white px-4 py-2 text-sm font-semibold text-observa-petroleo/85 transition hover:border-observa-menta disabled:opacity-40"
                    >
                      ← Fase anterior
                    </button>
                    <span className="text-xs text-observa-petroleo/70">
                      Fase {indice + 1} de {FASES.length}
                    </span>
                    <button
                      onClick={() => indice < FASES.length - 1 && setFase(FASES[indice + 1].id)}
                      disabled={indice === FASES.length - 1}
                      className="rounded-marca bg-observa-petroleo px-4 py-2 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-40"
                    >
                      Próxima fase →
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>

          <footer className="border-t border-observa-borda bg-white py-3 text-center text-xs text-observa-petroleo/70">
            ObservaSocial · Pesquisa em Políticas Sociais · publicação futura em
            aluno.lamarck.adv.br/profeduardo
          </footer>
        </div>
      </RegistroCitacoesProvider>
    </CasoProvider>
  )
}
