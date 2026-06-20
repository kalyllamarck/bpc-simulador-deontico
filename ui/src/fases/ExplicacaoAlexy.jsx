/* Explica como a âncora de Alexy (ponderação) opera no código deôntico por trás. */
import Citacao from '../componentes/Citacao'
import NotaCitacao from '../componentes/NotaCitacao'
import { AUTORES } from '../citacoes'

export default function ExplicacaoAlexy({ resultado }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        Para Alexy, princípios são <strong>mandados de otimização</strong>
        <NotaCitacao id="DOC002-u01" />: normas que ordenam realizar algo na maior medida possível
        dentro das possibilidades fáticas e jurídicas. Quando dois princípios colidem, o método é a{' '}
        <strong>ponderação</strong> — graduar cada dimensão e estabelecer, no caso, qual precede. No
        código por trás, cada dimensão recebe um grau (0 a 10) e um peso, e a soma das parcelas
        estrutura o argumento. Esse arranjo numérico é heurístico, não algorítmico: a chamada
        &ldquo;fórmula do peso&rdquo; é uso metafórico da linguagem matemática, e o que decide a
        ponderação é a atribuição dos valores, não a fórmula
        <NotaCitacao id="AT01-u01" />. Por isso a ponderação não fecha o gate sozinha: a IA
        interpreta o caso e <strong>propõe</strong> os graus do resíduo valorativo; a linha
        determinística aplica a norma e decide.
      </p>

      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        A redução de princípios a mandados de otimização não é consensual. Ávila distingue regras,
        princípios e <strong>postulados normativos</strong> (metanormas que ordenam a aplicação de
        outras normas), divergindo de Alexy quanto a tratar todo princípio como passível de
        otimização
        <NotaCitacao id="LN10-u01" />. A âncora aqui é, portanto, uma escolha metodológica
        explícita, não uma verdade dada.
      </p>

      <Citacao
        rotulo="Robert Alexy — mandado de otimização"
        texto="Princípios são normas que ordenam que algo seja realizado na maior medida possível dentro das possibilidades jurídicas e fáticas existentes."
        fonte={{ titulo: AUTORES.alexy.obra, abnt: AUTORES.alexy.abnt, print: AUTORES.alexy.print }}
      />

      {resultado && resultado.dimensoes && (
        <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Ponderação estruturada (ilustrativa)
          </p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-observa-petroleo/70">
                <th className="pb-2">Dimensão</th>
                <th className="pb-2 text-right">Grau</th>
                <th className="pb-2 text-right">Peso</th>
                <th className="pb-2 text-right">Parcela</th>
              </tr>
            </thead>
            <tbody className="text-observa-petroleo/90">
              {resultado.dimensoes.map((d) => (
                <tr key={d.nome} className="border-t border-observa-borda">
                  <td className="py-1.5">{d.nome}</td>
                  <td className="py-1.5 text-right">{d.escore}</td>
                  <td className="py-1.5 text-right">{d.peso}</td>
                  <td className="py-1.5 text-right font-semibold">{d.parcela}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-observa-petroleo/90">
            Peso total da ponderação: <strong>{resultado.peso_total}</strong>
          </p>
          {resultado.ressalva && (
            <p className="mt-2 text-xs italic text-observa-petroleo/70">{resultado.ressalva}</p>
          )}
        </div>
      )}
    </div>
  )
}
