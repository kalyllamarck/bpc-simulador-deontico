/* Fonte — janela (modal) com a referência ABNT e o estado do print.
 *
 * Onde o print real ainda não chegou (da infra `fontes/`), mostra [A CONFIRMAR]
 * com sobriedade — nunca apresenta como conferido aquilo que não foi.
 */
import { useEffect } from 'react'

export default function Fonte({ titulo, abnt, print, onFechar }) {
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const printConfirmado = print && print !== '[A CONFIRMAR]'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-observa-petroleo/60 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-lg rounded-marca bg-white p-6 shadow-carta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-observa-petroleo/70">
            {titulo}
          </p>
          <button
            onClick={onFechar}
            className="rounded-marca px-2 text-lg leading-none text-observa-petroleo/70 hover:text-observa-petroleo"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-observa-petroleo/90">{abnt}</p>

        <div className="mt-4 border-t border-observa-borda pt-3">
          {printConfirmado ? (
            <p className="text-xs text-observa-petroleo/70">
              Comprovação documental: <span className="font-medium">{print}</span>
            </p>
          ) : (
            <p className="text-xs italic text-observa-petroleo/70">
              Comprovação documental (print da fonte):{' '}
              <span className="font-semibold not-italic text-sinal-amarelo">[A CONFIRMAR]</span> — o
              print real entra depois, da infraestrutura de fontes.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
