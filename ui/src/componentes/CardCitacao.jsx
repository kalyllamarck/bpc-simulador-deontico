/* Card de citação (estilo SciELO) — abre ao clicar no número da nota.
 *
 * Mostra SÓ TEXTO: referência ABNT, conceito, citação parentética e link público.
 * Onde a prova não está confirmada (status `a_confirmar`), exibe [A CONFIRMAR] com
 * sobriedade — nunca apresenta como firme aquilo que ainda não foi conferido.
 */
import { useEffect } from 'react'

export default function CardCitacao({ numero, dados, onFechar }) {
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const confirmada = dados.status === 'confirmada'
  const temLink = dados.link_publico && dados.link_publico.startsWith('http')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-observa-petroleo/60 p-4"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={`Referência ${numero}`}
    >
      <div
        className="w-full max-w-lg rounded-marca bg-white p-6 shadow-carta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Referência {numero}
          </p>
          <button
            onClick={onFechar}
            className="rounded-marca px-2 text-lg leading-none text-observa-petroleo/70 hover:text-observa-petroleo"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Referência ABNT completa */}
        <p className="mt-3 text-sm leading-relaxed text-observa-petroleo/90">
          {dados.abnt_referencia}
        </p>

        {/* Conceito que a citação fundamenta */}
        {dados.conceito && (
          <p className="mt-3 text-xs leading-relaxed text-observa-petroleo/75">{dados.conceito}</p>
        )}

        <div className="mt-4 space-y-1 border-t border-observa-borda pt-3 text-xs text-observa-petroleo/70">
          {dados.abnt_parentetica && (
            <p>
              Citação: <span className="font-medium">{dados.abnt_parentetica}</span>
            </p>
          )}
          {temLink ? (
            <p>
              Fonte:{' '}
              <a
                href={dados.link_publico}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-observa-menta underline underline-offset-2"
              >
                acesso público
              </a>
            </p>
          ) : (
            <p className="italic">Sem link público aberto; consulta pela referência impressa.</p>
          )}
        </div>

        {/* Estado da prova — honestidade sóbria */}
        <div className="mt-3 border-t border-observa-borda pt-3">
          {confirmada ? (
            <p className="text-xs text-observa-petroleo/70">Fonte conferida no acervo de provas.</p>
          ) : (
            <p className="text-xs italic text-observa-petroleo/70">
              Prova documental:{' '}
              <span className="font-semibold not-italic text-sinal-amarelo">[A CONFIRMAR]</span> —{' '}
              {dados.status_detalhe || 'aguarda conferência no acervo de fontes.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
