/* Explica como a âncora de Alexy (ponderação) opera no código deôntico por trás. */
import Citacao from '../componentes/Citacao'
import { AUTORES } from '../citacoes'

export default function ExplicacaoAlexy({ resultado }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        Para Alexy, princípios são <strong>mandados de otimização</strong>: devem ser realizados na maior
        medida possível, dadas as condições do caso. Quando dois princípios colidem, o método é a
        <strong> ponderação</strong> — atribuir peso a cada dimensão e ver qual prevalece. No código por trás,
        cada dimensão recebe um grau (0 a 10) e um peso; a soma das parcelas estrutura o argumento. O sistema
        não decide: ele só organiza a ponderação para o jurista.
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
