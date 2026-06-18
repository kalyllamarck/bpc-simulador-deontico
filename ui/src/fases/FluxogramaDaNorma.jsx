/* Fase 2 — Fluxograma da norma.
 *
 * Leitura TOP-DOWN do art. 20 na ordem da lei (R6 → R1 → R2 → R3 → §11), antes do grafo
 * navegável. Cada passo mostra o dispositivo e os dois ramos (avança / barra / concede /
 * indeterminado). Marca onde a CAMADA VALORATIVA se acopla (§11). Os dados vêm do mesmo
 * motor (obterGrafo); a forma é linear para ensinar o encadeamento.
 */
import { useEffect, useState } from 'react'
import { obterGrafo } from '../api'
import { tipoDestino } from '../dominio/grafo'
import { Revelar, RevelarSequencia, RevelarItem } from '../animacao/Revelar'

const ESTILO_RAMO = {
  concede: 'border-sinal-verde text-sinal-verde',
  barra: 'border-sinal-vermelho text-sinal-vermelho',
  indetermina: 'border-sinal-amarelo text-sinal-amarelo',
  avanca: 'border-observa-menta text-observa-petroleo/80',
}

export default function FluxogramaDaNorma() {
  const [grafo, setGrafo] = useState(null)
  useEffect(() => {
    obterGrafo().then(setGrafo)
  }, [])

  if (!grafo)
    return <p className="text-sm text-observa-petroleo/70">Carregando o fluxo da norma…</p>

  const decisoes = grafo.nos.filter((n) => n.tipo !== 'terminal')
  const rotuloDe = (id) => grafo.nos.find((n) => n.id === id)?.rotulo || id

  return (
    <div className="flex flex-col gap-6">
      <Revelar>
        <p className="text-sm leading-relaxed text-observa-petroleo/80">
          A norma aplicada vira um <strong>fluxo</strong>: cada dispositivo é um ponto de decisão,
          testado na ordem da lei. Leia de cima para baixo. Onde uma condição barra, o caminho
          termina; onde é satisfeita, avança ao próximo dispositivo. No <strong>§11</strong> a{' '}
          <strong>camada valorativa</strong> se acopla — é o único ponto com resíduo de
          interpretação.
        </p>
      </Revelar>

      <RevelarSequencia className="flex flex-col gap-3" intervalo={0.1}>
        {decisoes.map((no, i) => {
          const ramos = grafo.arestas.filter((a) => a.de === no.id)
          const valorativo = (no.dispositivo || '').includes('§11')
          return (
            <RevelarItem key={no.id}>
              <div
                className={`rounded-marca border bg-white p-4 shadow-carta ${
                  valorativo
                    ? 'border-observa-menta ring-1 ring-observa-menta/40'
                    : 'border-observa-borda'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-observa-petroleo text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-observa-petroleo">{no.rotulo}</p>
                    <p className="text-xs text-observa-petroleo/60">{no.dispositivo}</p>
                    {valorativo && (
                      <p className="mt-1 inline-block rounded bg-observa-menta/20 px-2 py-0.5 text-[0.7rem] font-semibold text-observa-petroleo">
                        ↳ acopla a camada valorativa (resíduo de miserabilidade)
                      </p>
                    )}
                    <div className="mt-2 flex flex-col gap-1.5">
                      {ramos.map((r, j) => {
                        const tipo = tipoDestino(r.para)
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-2 rounded-marca border-l-2 bg-observa-fundo px-2 py-1 text-xs ${ESTILO_RAMO[tipo]}`}
                          >
                            <span className="font-medium">{r.condicao}</span>
                            <span className="text-observa-petroleo/50">→</span>
                            <span className="font-semibold">{rotuloDe(r.para)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </RevelarItem>
          )
        })}
      </RevelarSequencia>

      <Revelar delay={0.1}>
        <p className="text-xs italic text-observa-petroleo/70">
          {grafo._origem === 'motor'
            ? 'Fluxo produzido pelo motor da norma.'
            : 'Fluxo de demonstração (o motor não respondeu). A ordem espelha a saída real.'}{' '}
          A seguir, o mesmo encadeamento como <strong>grafo navegável</strong>, comando a comando.
        </p>
      </Revelar>
    </div>
  )
}
