/* Fase 0 — Tradução do caput.
 *
 * O ponto de partida pedagógico: o texto LITERAL do art. 20, caput (com "ver fonte"),
 * e, abaixo, a TRADUÇÃO DEÔNTICA — quais termos viram operadores lógicos (∨ ∧ ¬) e qual
 * o functor (O/P/F). Só depois disto o usuário vê o fluxograma e o grafo. O conteúdo é
 * derivado do motor (deontica.js, espírito DC-11): nada inventado.
 */
import Citacao from '../componentes/Citacao'
import CaputAnotado from '../componentes/CaputAnotado'
import TermoDeontico from '../componentes/TermoDeontico'
import NotaCitacao from '../componentes/NotaCitacao'
import { DISPOSITIVOS } from '../citacoes'
import { DEONTICA, OPERADORES, FUNCTORES } from '../dominio/deontica'
import { Revelar, RevelarSequencia, RevelarItem } from '../animacao/Revelar'

const CAPUT = DISPOSITIVOS.caput
const D = DEONTICA.caput

// Trechos exatos do caput que viram operadores (ver CaputAnotado).
const REALCES = [
  {
    trecho: 'pessoa com deficiência',
    simbolo: '∨',
    titulo: 'público (disjunção): idoso ∨ deficiente',
  },
  {
    trecho: 'idoso com 65 (sessenta e cinco) anos ou mais',
    simbolo: '∨',
    titulo: 'público (disjunção): idoso ∨ deficiente',
  },
  {
    trecho: 'não possuir meios de prover a própria manutenção',
    simbolo: '¬',
    titulo: 'negação (antecedente): ¬ meios próprios',
  },
  {
    trecho: 'nem de tê-la provida por sua família',
    simbolo: '¬',
    titulo: 'negação (antecedente): ¬ meios da família',
  },
]

export default function TraducaoDoCaput() {
  const functor = FUNCTORES[D.functor]
  return (
    <div className="flex flex-col gap-6">
      <Revelar>
        <p className="text-sm leading-relaxed text-observa-petroleo/80">
          Antes do grafo, a tradução. A norma jurídica é uma proposição prescritiva
          <NotaCitacao id="BB01-u01" />; o sistema a aplica por <strong>subsunção</strong>. Comece
          pelo <strong>art. 20, caput</strong>: leia o dispositivo, veja a fonte e então a sua
          leitura deôntica — quais termos viram <strong>operadores deônticos</strong> e qual o{' '}
          <strong>functor deôntico</strong> (O, P ou F).
        </p>
      </Revelar>

      {/* Texto literal do caput, anotado, com botão "ver fonte" */}
      <Revelar delay={0.05}>
        <div className="rounded-marca border-l-4 border-observa-menta bg-observa-palido/30 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
              {CAPUT.rotulo}
            </p>
          </div>
          <CaputAnotado texto={CAPUT.texto} realces={REALCES} />
          <div className="mt-3">
            <Citacao
              rotulo="Fonte do dispositivo"
              texto="Lei nº 8.742/1993 (LOAS), art. 20, caput."
              fonte={{
                titulo: 'Lei nº 8.742/1993 (LOAS)',
                abnt: 'BRASIL. Lei nº 8.742, de 7 de dezembro de 1993. Dispõe sobre a organização da Assistência Social (LOAS). Brasília, DF: Presidência da República, 1993.',
                print: CAPUT.print,
              }}
            />
          </div>
        </div>
      </Revelar>

      {/* Tradução deôntica: operadores classificados */}
      <Revelar delay={0.1}>
        <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Tradução deôntica — operadores
          </p>
          <p className="mt-2 text-xs leading-relaxed text-observa-petroleo/70">
            Atenção ao termo exato da norma: o caput usa “e” entre idoso e pessoa com deficiência,
            mas a aplicação é <strong>disjuntiva</strong> — cada qual, por si, é titular do direito
            e integra o público (idoso ∨ pessoa com deficiência).
            <NotaCitacao id="C004-u01" />
          </p>
          <RevelarSequencia className="mt-3 flex flex-col gap-2">
            {D.termos.map((t, i) => {
              const op = OPERADORES[t.op]
              return (
                <RevelarItem key={i}>
                  <div className="flex flex-col gap-1 rounded-marca bg-observa-fundo p-3">
                    <div className="flex items-center gap-2">
                      <TermoDeontico simbolo={op.simbolo} nome={op.nome} />
                      <span className="text-sm font-medium text-observa-petroleo/90">
                        {t.texto}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-observa-petroleo/70">{t.glosa}</p>
                  </div>
                </RevelarItem>
              )
            })}
          </RevelarSequencia>
        </div>
      </Revelar>

      {/* Functor e fórmula */}
      <Revelar delay={0.15}>
        <div className="rounded-marca border border-observa-borda bg-observa-petroleo/5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
              Functor do dispositivo
            </span>
            {functor && (
              <TermoDeontico simbolo={functor.simbolo} nome={functor.nome} variante="functor" />
            )}
            <span className="text-xs text-observa-petroleo/70">{functor?.glosa}</span>
          </div>
          <p className="mt-3 rounded-marca bg-white p-3 font-mono text-xs text-observa-petroleo/90">
            {D.formula}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-observa-petroleo/70">{D.glosa}</p>
          <p className="mt-2 text-xs leading-relaxed text-observa-petroleo/60">
            A norma tem estrutura lógica D(p→q): o functor dever-ser
            <NotaCitacao id="DOC008-u01" /> liga um <strong>antecedente</strong> (a hipótese:
            público e condições) a um <strong>consequente</strong> (a relação prescritiva).
            Subsumido o caso ao antecedente, o consequente se impõe.
            <NotaCitacao id="LN08-u01" />
          </p>
        </div>
      </Revelar>

      <Revelar delay={0.2}>
        <p className="text-xs italic text-observa-petroleo/70">
          A seguir, o <strong>fluxograma</strong> liga os dispositivos na ordem da lei; depois, o{' '}
          <strong>grafo</strong> permite navegar comando a comando.
        </p>
      </Revelar>
    </div>
  )
}
