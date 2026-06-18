/* Painel da complexidade — explica a complexidade "conforme a Lei", não como
 * métrica de software. A complexidade reproduz a estrutura do art. 20.
 */
export default function PainelComplexidade({ complexidade, explicacao }) {
  if (!complexidade) return null
  const itens = [
    { rotulo: 'Decisões da norma', valor: complexidade.decisoes, nota: 'um juízo por dispositivo do art. 20' },
    { rotulo: 'Caminhos possíveis', valor: complexidade.caminhos, nota: 'combinações até um dos desfechos' },
    { rotulo: 'Medida da estrutura', valor: complexidade.ciclomatica, nota: 'decisões + 1 (retrato da lei)' },
  ]
  return (
    <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
      <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
        Complexidade da norma — conforme a Lei
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {itens.map((it) => (
          <div key={it.rotulo} className="rounded-marca bg-observa-palido/30 p-3">
            <p className="text-2xl font-bold text-observa-petroleo">{it.valor}</p>
            <p className="text-sm font-semibold text-observa-petroleo">{it.rotulo}</p>
            <p className="mt-0.5 text-xs text-observa-petroleo/70">{it.nota}</p>
          </div>
        ))}
      </div>
      {explicacao && (
        <p className="mt-3 text-sm leading-relaxed text-observa-petroleo/80">{explicacao}</p>
      )}
    </div>
  )
}
