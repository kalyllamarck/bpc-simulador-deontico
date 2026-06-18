/* Apoio ao grafo/fluxograma — classifica o ramo pelo DESTINO (não pela condicao).
 * Os ids dos terminais são estáveis no motor (O_CONCEDER, F_CONCEDER, INDETERMINADO…),
 * então a cor é robusta a qualquer id de decisão. Reusado pelo fluxograma e pelo grafo.
 */
export function tipoDestino(idDestino) {
  if (idDestino === 'O_CONCEDER' || idDestino === 'O') return 'concede'
  if (idDestino === 'F_CONCEDER' || idDestino === 'F') return 'barra'
  if (String(idDestino).startsWith('INDETERMINADO') || idDestino === 'IND') return 'indetermina'
  return 'avanca'
}

// Cores da identidade (verde satisfez/concede, vermelho barrou, amarelo indeterminado).
export const COR_RAMO = {
  concede: '#1f8b4c',
  barra: '#c0392b',
  indetermina: '#caa53d',
  avanca: '#3aa6a6',
}
