/* Cabeçalho da marca ObservaSocial.
 *
 * Correção da auditoria: logo maior, nome "ObservaSocial" por extenso ao lado,
 * com contraste garantido (texto branco sobre o verde-petróleo escuro).
 */
export default function CabecalhoMarca() {
  return (
    <header className="bg-observa-petroleo text-white shadow">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
        <img
          src={`${import.meta.env.BASE_URL}marca/logo-fundo-verde.jpg`}
          alt="ObservaSocial"
          className="h-16 w-16 shrink-0 rounded-marca object-cover ring-2 ring-white/30"
        />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold leading-tight tracking-tight text-white">
              ObservaSocial
            </span>
            <span className="hidden text-sm font-medium text-observa-menta sm:inline">
              Políticas Sociais
            </span>
          </div>
          <div className="text-sm font-medium leading-tight text-white">
            Simulador de aplicabilidade da norma do BPC — extensão didática do artigo
          </div>
          <div className="text-xs leading-tight text-white/80">
            Benefício de Prestação Continuada · o sistema aplica a norma por subsunção; o jurista
            entra externamente, no estudo social, quando o estado fica indeterminado
          </div>
        </div>
      </div>
    </header>
  )
}
