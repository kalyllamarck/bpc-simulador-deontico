/* Nota de citação (estilo SciELO) — um número sobrescrito clicável que abre o card
 * com a referência ABNT. Numeração por 1ª aparição (ver RegistroCitacoes).
 *
 * Uso:  texto da afirmação<NotaCitacao id="DOC005-u01" />
 */
import { useState } from 'react'
import { useRegistroCitacoes } from './RegistroCitacoes'
import CardCitacao from './CardCitacao'

export default function NotaCitacao({ id }) {
  const { registrar, buscar } = useRegistroCitacoes()
  const numero = registrar(id)
  const dados = buscar(id)
  const [aberto, setAberto] = useState(false)

  // id sem registro no manifesto: não quebra a tela; o check-citacoes barra no build.
  if (!dados) {
    return (
      <sup className="font-bold text-sinal-vermelho" title={`Citação sem registro: ${id}`}>
        [?]
      </sup>
    )
  }

  return (
    <>
      <sup className="leading-none">
        <button
          onClick={() => setAberto(true)}
          aria-label={`Referência ${numero}: ${dados.abnt_narrativa || dados.autor}`}
          className="ml-0.5 rounded-sm px-0.5 align-super text-[0.7em] font-bold text-observa-menta hover:underline focus:outline-none focus:ring-1 focus:ring-observa-menta"
        >
          {numero}
        </button>
      </sup>
      {aberto && <CardCitacao numero={numero} dados={dados} onFechar={() => setAberto(false)} />}
    </>
  )
}
