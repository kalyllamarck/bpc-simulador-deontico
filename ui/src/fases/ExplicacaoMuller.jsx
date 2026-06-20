/* Explica como a âncora de Müller (estrutura da norma) opera no código por trás. */
import Citacao from '../componentes/Citacao'
import NotaCitacao from '../componentes/NotaCitacao'
import { AUTORES } from '../citacoes'

export default function ExplicacaoMuller({ resultado }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        Para Müller, a norma não está pronta no texto: ela se <strong>concretiza</strong>
        <NotaCitacao id="DOC003-u01" /> no processo real de decisão. A concretização opera entre
        dois polos — o <strong>programa da norma</strong> (a ideia normativa orientadora, o que o
        texto e seu sentido delimitam) e o <strong>âmbito da norma</strong> (a estrutura material, o
        recorte da realidade que ela governa). Concretizar é tensionar os dois. No código por trás,
        o sistema separa programa e âmbito e <strong>expõe</strong> a tensão, sem fechar o gate
        sozinho.
      </p>

      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        O que sobra dessa tensão é o <strong>resíduo valorativo</strong>: a orla de imprecisão que
        toda regra carrega entre o núcleo de certeza e a zona de penumbra
        <NotaCitacao id="DOC005-u01" />. Persistindo essa <strong>indeterminação valorativa</strong>
        , a conclusão é derrotável — cede a novos elementos
        <NotaCitacao id="A001-u01" /> — e o caso escala para o estudo social. A IA interpreta e{' '}
        <strong>propõe</strong> o grau do resíduo; a linha determinística aplica a norma e decide o
        gate.
      </p>

      <Citacao
        rotulo="Friedrich Müller — concretização"
        texto="A norma jurídica não está pronta antes do caso; ela resulta da concretização, na tensão entre o programa da norma e o seu âmbito normativo."
        fonte={{
          titulo: AUTORES.muller.obra,
          abnt: AUTORES.muller.abnt,
          print: AUTORES.muller.print,
        }}
      />

      {resultado && resultado.programa && (
        <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
          <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
            Concretização estruturada (ilustrativa)
          </p>
          <dl className="mt-3 flex flex-col gap-3 text-sm text-observa-petroleo/90">
            <div>
              <dt className="font-semibold text-observa-petroleo">Programa da norma</dt>
              <dd className="leading-relaxed">{resultado.programa}</dd>
            </div>
            <div>
              <dt className="font-semibold text-observa-petroleo">Âmbito da norma</dt>
              <dd className="leading-relaxed">{resultado.ambito}</dd>
            </div>
            <div>
              <dt className="font-semibold text-observa-petroleo">Tensão (concretização)</dt>
              <dd className="leading-relaxed">{resultado.tensao}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
