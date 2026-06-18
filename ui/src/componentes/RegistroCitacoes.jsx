/* Registro de citações — numera as notas por ORDEM DE 1ª APARIÇÃO (estilo SciELO).
 *
 * Um número é atribuído na primeira vez que um `id` aparece e fica fixo na sessão
 * (sobrevive à troca de fase). A busca lê o manifesto gerado de `fontes/` do artigo
 * (ver scripts/sync-citacoes.mjs). Card só texto: ABNT + conceito + link, sem imagem.
 */
import { createContext, useContext, useRef } from 'react'
import manifesto from '../dados/citacoes.gerado.json'

const Ctx = createContext(null)
const CITACOES = manifesto.citacoes

export function RegistroCitacoesProvider({ children }) {
  // Map id → número. Em ref: persiste entre fases e não dispara re-render.
  const mapa = useRef(new Map())
  const proximo = useRef(1)

  function registrar(id) {
    if (!mapa.current.has(id)) {
      mapa.current.set(id, proximo.current)
      proximo.current += 1
    }
    return mapa.current.get(id)
  }

  function buscar(id) {
    return CITACOES[id] || null
  }

  return <Ctx.Provider value={{ registrar, buscar }}>{children}</Ctx.Provider>
}

export function useRegistroCitacoes() {
  const valor = useContext(Ctx)
  if (!valor) throw new Error('useRegistroCitacoes precisa do <RegistroCitacoesProvider>')
  return valor
}
