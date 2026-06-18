/* Caput anotado — o texto literal do dispositivo com os trechos que viram operadores
 * lógicos realçados e marcados com o símbolo (∨ ∧ ¬ <). Pedagógico: mostra que a
 * gramática de superfície ("e") nem sempre é o operador deôntico (aqui, ∨).
 *
 * Props: texto (string literal), realces [{ trecho, simbolo, titulo }].
 * Casa exata por substring; trecho não encontrado é simplesmente ignorado (sem quebrar).
 */
export default function CaputAnotado({ texto, realces = [] }) {
  // Quebra o texto em segmentos, marcando os trechos realçados na ordem em que aparecem.
  const segmentos = []
  let chave = 0
  // Ordena os realces pela posição de ocorrência no texto.
  const ordenados = realces
    .map((r) => ({ ...r, pos: texto.indexOf(r.trecho) }))
    .filter((r) => r.pos >= 0)
    .sort((a, b) => a.pos - b.pos)

  let cursor = 0
  for (const r of ordenados) {
    const i = texto.indexOf(r.trecho, cursor)
    if (i < 0) continue
    if (i > cursor) segmentos.push(<span key={chave++}>{texto.slice(cursor, i)}</span>)
    segmentos.push(
      <mark
        key={chave++}
        title={r.titulo}
        className="rounded bg-observa-menta/25 px-0.5 font-medium text-observa-petroleo"
      >
        {r.trecho}
        <sup className="ml-0.5 font-mono text-[0.7em] font-bold text-observa-menta">
          {r.simbolo}
        </sup>
      </mark>
    )
    cursor = i + r.trecho.length
  }
  if (cursor < texto.length) segmentos.push(<span key={chave++}>{texto.slice(cursor)}</span>)

  return <p className="text-sm italic leading-relaxed text-observa-petroleo/90">“{segmentos}”</p>
}
