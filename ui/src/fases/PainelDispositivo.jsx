/* Drill-down do grafo — ao clicar num nó, abre o(s) dispositivo(s) daquele comando com
 * o texto citado (Citacao) e a tradução deôntica (operadores + functor, de deontica.js).
 * Resolve o alias id-do-motor → dispositivos por NO_PARA_DISPOSITIVOS.
 */
import { useEffect, useRef } from 'react'
import Citacao from '../componentes/Citacao'
import TermoDeontico from '../componentes/TermoDeontico'
import NotaCitacao from '../componentes/NotaCitacao'
import { DISPOSITIVOS } from '../citacoes'
import {
  DEONTICA,
  OPERADORES,
  FUNCTORES,
  NO_PARA_DISPOSITIVOS,
  TERMINAL_FUNCTOR,
} from '../dominio/deontica'

const FONTE_LEI = {
  titulo: 'Lei nº 8.742/1993 (LOAS)',
  abnt: 'BRASIL. Lei nº 8.742, de 7 de dezembro de 1993. Dispõe sobre a organização da Assistência Social (LOAS). Brasília, DF: Presidência da República, 1993.',
}

function BlocoDispositivo({ chave }) {
  const disp = DISPOSITIVOS[chave]
  const d = DEONTICA[chave]
  if (!disp) return null
  const functor = d?.functor ? FUNCTORES[d.functor] : null
  return (
    <div className="flex flex-col gap-3">
      <Citacao
        rotulo={disp.rotulo}
        texto={disp.texto}
        fonte={{ ...FONTE_LEI, print: disp.print }}
      />
      {d && (
        <div className="rounded-marca bg-observa-fundo p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Tradução deôntica
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {d.termos.map((t, i) => {
              const op = OPERADORES[t.op]
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <TermoDeontico simbolo={op.simbolo} nome={op.nome} />
                    <span className="text-xs font-medium text-observa-petroleo/90">{t.texto}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-observa-petroleo/70">{t.glosa}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {functor && (
              <TermoDeontico simbolo={functor.simbolo} nome={functor.nome} variante="functor" />
            )}
            <code className="rounded bg-white px-2 py-0.5 font-mono text-[0.7rem] text-observa-petroleo/85">
              {d.formula}
            </code>
          </div>
          {d.notas?.length > 0 && (
            <p className="mt-2 text-xs text-observa-petroleo/70">
              Fundamentos doutrinários:
              {d.notas.map((id) => (
                <NotaCitacao key={id} id={id} />
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function PainelDispositivo({ noId, rotulo, dispositivo, onFechar }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const chaves = NO_PARA_DISPOSITIVOS[noId] || []
  const ehTerminal = noId in TERMINAL_FUNCTOR
  const functorTerminal = ehTerminal ? FUNCTORES[TERMINAL_FUNCTOR[noId]] : null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="rounded-marca border border-observa-menta bg-white p-5 shadow-carta focus:outline-none focus:ring-2 focus:ring-observa-menta"
      role="region"
      aria-label={`Detalhe do dispositivo: ${rotulo}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-observa-petroleo">{rotulo}</p>
          <p className="text-xs text-observa-petroleo/60">{dispositivo}</p>
        </div>
        <button
          onClick={onFechar}
          className="rounded-marca px-2 text-lg leading-none text-observa-petroleo/70 hover:text-observa-petroleo"
          aria-label="Fechar detalhe"
        >
          ×
        </button>
      </div>

      {ehTerminal ? (
        <div className="rounded-marca bg-observa-fundo p-3">
          <p className="text-xs leading-relaxed text-observa-petroleo/80">
            Nó terminal da norma: aqui a subsunção encerra-se num <strong>functor deôntico</strong>.{' '}
            {functorTerminal ? (
              <>
                <TermoDeontico
                  simbolo={functorTerminal.simbolo}
                  nome={functorTerminal.nome}
                  variante="functor"
                />{' '}
                — {functorTerminal.glosa}.
              </>
            ) : (
              <>
                Estado indeterminado: não há functor, e sim a abertura — derrotável por nova
                informação — para a camada valorativa no estudo social (DC-09).
                <NotaCitacao id="A001-u01" />
              </>
            )}
          </p>
        </div>
      ) : chaves.length > 0 ? (
        <div className="flex flex-col gap-4">
          {chaves.map((c) => (
            <BlocoDispositivo key={c} chave={c} />
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-observa-petroleo/70">
          Sem dispositivo associado a este nó.
        </p>
      )}
    </div>
  )
}
