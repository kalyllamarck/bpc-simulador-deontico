import { useState } from 'react'
import { CasoProvider } from './CasoContext'
import CabecalhoMarca from './componentes/CabecalhoMarca'
import GrafoDaNorma from './fases/GrafoDaNorma'
import RegrasRigidas from './fases/RegrasRigidas'
import FaseValorativa from './fases/FaseValorativa'
import DecisaoMacCormick from './fases/DecisaoMacCormick'
import TelaImpacto from './fases/TelaImpacto'

/* ════════════════════════════════════════════════════════════════════════════
 *  Simulador deôntico do BPC — ObservaSocial · extensão didática do artigo
 *
 *  Quatro fases pedagógicas, na ordem do raciocínio jurídico:
 *   1. Grafo da norma — a estrutura do art. 20 (complexidade conforme a Lei)
 *   2. Regras rígidas — subsunção dispositivo a dispositivo
 *   3. Fase valorativa — resíduo do §11 (âncora Alexy ou Müller)
 *   4. Decisão (MacCormick) — silogismo + três portões
 *
 *  O caso vive no CasoContext e NÃO reinicia ao trocar de fase. A IA jamais decide.
 * ════════════════════════════════════════════════════════════════════════════ */

const FASES = [
  { id: 'grafo', numero: 1, titulo: 'Grafo da norma', Componente: GrafoDaNorma },
  { id: 'regras', numero: 2, titulo: 'Regras rígidas', Componente: RegrasRigidas },
  { id: 'valorativa', numero: 3, titulo: 'Fase valorativa', Componente: FaseValorativa },
  { id: 'decisao', numero: 4, titulo: 'Decisão (MacCormick)', Componente: DecisaoMacCormick },
]

function Stepper({ atual, onIr }) {
  return (
    <nav className="border-b-2 border-observa-borda bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-stretch gap-1 px-4 py-2">
        {FASES.map((f) => {
          const ativo = atual === f.id
          return (
            <button
              key={f.id}
              onClick={() => onIr(f.id)}
              className={`flex items-center gap-2 rounded-marca px-3 py-2 text-left text-sm transition ${
                ativo
                  ? 'bg-observa-petroleo text-white'
                  : 'text-observa-petroleo/80 hover:bg-observa-palido/40'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  ativo ? 'bg-white text-observa-petroleo' : 'bg-observa-palido text-observa-petroleo'
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
  const [fase, setFase] = useState('grafo')
  const [complementar, setComplementar] = useState(false)

  const indice = FASES.findIndex((f) => f.id === fase)
  const FaseAtual = FASES[indice]?.Componente

  return (
    <CasoProvider>
      <div className="flex min-h-screen flex-col font-principal text-observa-petroleo">
        <CabecalhoMarca />

        {/* Faixa de protótipo — mantida */}
        <div className="bg-observa-menta/15 text-center text-xs font-semibold text-observa-petroleo/85">
          <div className="mx-auto max-w-5xl px-4 py-1.5">
            PROTÓTIPO / ILUSTRATIVO — sem execução empírica real. A IA apenas interpreta e propõe; jamais decide.
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
              {complementar ? '← Voltar às 4 fases' : 'Impacto e art. 201'}
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
          ObservaSocial · Pesquisa em Políticas Sociais · publicação futura em aluno.lamarck.adv.br/profeduardo
        </footer>
      </div>
    </CasoProvider>
  )
}
