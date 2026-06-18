/* Explica como a âncora de Müller (estrutura da norma) opera no código por trás. */
import Citacao from '../componentes/Citacao'
import NotaCitacao from '../componentes/NotaCitacao'
import { AUTORES } from '../citacoes'

export default function ExplicacaoMuller({ resultado }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-observa-petroleo/85">
        Para Müller, a norma não está pronta no texto: ela se <strong>concretiza</strong>
        <NotaCitacao id="DOC003-u01" /> no caso. A norma tem duas faces — o{' '}
        <strong>programa da norma</strong> (o que o texto e seu sentido delimitam) e o
        <strong> âmbito da norma</strong> (o recorte da realidade que ela governa). Decidir é
        tensionar os dois. No código por trás, o sistema separa programa e âmbito e expõe a tensão —
        sem fechar o gate sozinho: persistindo o resíduo valorativo indeterminado, o caso escala
        para o estudo social.
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
