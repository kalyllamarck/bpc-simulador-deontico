/* DispositivoNorma — bloco reutilizável de um dispositivo do art. 20.
 *
 * Estrutura fixa (de cima para baixo): TEXTO DA NORMA citado → FORMULÁRIO de coleta
 * → fundamento. Reusa os campos da norma. Cada fase 2 monta vários destes, na ordem
 * da lei.
 */
import Citacao from '../componentes/Citacao'

export default function DispositivoNorma({ dispositivo, fundamento, children }) {
  return (
    <section className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
      <Citacao
        rotulo={dispositivo.rotulo}
        texto={dispositivo.texto}
        fonte={{
          titulo: 'Lei nº 8.742/1993 (LOAS)',
          abnt: 'BRASIL. Lei nº 8.742, de 7 de dezembro de 1993. Dispõe sobre a organização da Assistência Social (LOAS).',
          print: dispositivo.print,
        }}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      {fundamento && (
        <p className="mt-4 border-t border-observa-borda pt-3 text-xs leading-relaxed text-observa-petroleo/70">
          {fundamento}
        </p>
      )}
    </section>
  )
}
