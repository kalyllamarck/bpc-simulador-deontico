/* Fase 2 — Regras rígidas (subsunção).
 *
 * Percorre CADA dispositivo do art. 20 na ordem da lei, com o DispositivoNorma:
 * caput (público), §1º (família + renda per capita), §2º+§10 (impedimento),
 * §3º (¼ SM) e §4º (vedação). Ao fim, aplica a norma via POST /simular.
 * O estado vem do CasoContext e não reinicia entre fases.
 */
import { useState } from 'react'
import { useCaso, casoParaRequerente } from '../CasoContext'
import { simularValoracao } from '../api'
import DispositivoNorma from './DispositivoNorma'
import Resultado from '../componentes/Resultado'
import NotaCitacao from '../componentes/NotaCitacao'
import { DISPOSITIVOS } from '../citacoes'

const campo =
  'w-full rounded-marca border border-observa-borda bg-white px-3 py-2 text-sm text-observa-petroleo focus:border-observa-menta focus:outline-none'
const rotulo = 'block text-sm font-semibold text-observa-petroleo'

export default function RegrasRigidas() {
  const { caso, atualizar, registrarResultado } = useCaso()
  const [resposta, setResposta] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function aplicar() {
    setCarregando(true)
    const r = await simularValoracao(casoParaRequerente(caso))
    setResposta(r)
    registrarResultado('regras', r)
    setCarregando(false)
  }

  const set = (campos) => atualizar(campos)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-observa-petroleo/80">
        Aqui o dispositivo é percorrido na ordem da lei. Para cada um, primeiro o texto legal; logo
        abaixo, o antecedente de fato a coletar do caso. Estas são as regras rígidas: o sistema
        realiza a subsunção determinística do fato ao antecedente normativo, sem margem de escolha —
        no núcleo de certeza, o caso claro resolve-se pela própria letra da norma.
        <NotaCitacao id="DOC005-u01" /> Trata-se do subconjunto computável do direito, em que o
        dispositivo se exprime como regra executável.
        <NotaCitacao id="A002-u01" /> O resíduo valorativo (a miserabilidade do §3º) não se subsume
        por esta via e fica reservado à fase seguinte.
      </p>

      {/* caput — público */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.caput}
        fundamento={
          <>
            Antecedente subjetivo: pessoa idosa (65 anos ou mais) ou pessoa com deficiência. A
            disjunção é condição de aplicabilidade — sem integrar o público, a subsunção falha e a
            norma não autoriza a concessão.
          </>
        }
      >
        <div>
          <label className={rotulo}>Idade (anos completos)</label>
          <input
            type="number"
            min={0}
            value={caso.idade}
            onChange={(e) => set({ idade: e.target.value })}
            className={`${campo} mt-1`}
          />
        </div>
        <div className="flex items-center gap-2 sm:pt-7">
          <input
            id="def"
            type="checkbox"
            checked={caso.deficiente}
            onChange={(e) => set({ deficiente: e.target.checked })}
            className="h-4 w-4 accent-observa-petroleo"
          />
          <label htmlFor="def" className="text-sm text-observa-petroleo">
            Pessoa com deficiência atestada
          </label>
        </div>
      </DispositivoNorma>

      {/* §1º — família + renda per capita */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p1}
        fundamento={
          <>
            A composição do grupo familiar fixa o divisor da renda mensal do grupo — base do cálculo
            da renda mensal per capita exigido pelo §3º.
          </>
        }
      >
        <div>
          <label className={rotulo}>Pessoas no grupo familiar</label>
          <input
            type="number"
            min={1}
            value={caso.membros}
            onChange={(e) => set({ membros: Number(e.target.value) })}
            className={`${campo} mt-1`}
          />
        </div>
        <div>
          <label className={rotulo}>Renda mensal do grupo (R$)</label>
          <input
            value={caso.rendaReais}
            onChange={(e) => set({ rendaReais: e.target.value })}
            className={`${campo} mt-1`}
          />
        </div>
      </DispositivoNorma>

      {/* §2º + §10 — impedimento de longo prazo */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p2}
        fundamento={
          <>
            O §10 define o impedimento de longo prazo como aquele com efeitos por no mínimo 24
            meses, aplicável ao requerente com deficiência. O limiar é numérico e a comparação,
            exata: o antecedente subsume-se sem juízo de valor.
            <NotaCitacao id="A002-u01" />
          </>
        }
      >
        <div>
          <label className={rotulo}>Impedimento de longo prazo (meses)</label>
          <input
            type="number"
            min={0}
            value={caso.impedimentoMeses}
            onChange={(e) => set({ impedimentoMeses: e.target.value })}
            className={`${campo} mt-1`}
          />
        </div>
        <p className="text-xs italic text-observa-petroleo/70 sm:pt-7">
          O §10 considera de longo prazo o impedimento com efeitos por no mínimo 24 meses.
        </p>
      </DispositivoNorma>

      {/* §3º — ¼ do salário mínimo */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p3}
        fundamento={
          <>
            Critério econômico: renda mensal per capita inferior a ¼ do salário-mínimo presume a
            incapacidade de prover a própria manutenção. O cálculo é determinístico, mas a fronteira
            do limiar (a miserabilidade no caso-limite) é justamente onde a complexidade inerente
            persiste e escapa à regra executável
            <NotaCitacao id="O005-u01" /> — uma interpretação plenamente matizada da ambiguidade não
            se reduz ao tratamento automatizado e cabe ao estudo social, externamente, na fase do
            indeterminado.
            <NotaCitacao id="A003-u01" />
          </>
        }
      >
        <div>
          <label className={rotulo}>Salário mínimo de referência (R$)</label>
          <input
            value={caso.smReais}
            onChange={(e) => set({ smReais: e.target.value })}
            className={`${campo} mt-1`}
          />
        </div>
        <p className="text-xs italic text-observa-petroleo/70 sm:pt-7">
          O teto legal é ¼ deste salário-mínimo, comparado em centavos (sem arredondamento que
          altere a fração).
        </p>
      </DispositivoNorma>

      {/* §4º — vedação de acumulação */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p4}
        fundamento={
          <>
            Functor deôntico de vedação: acumular benefício vedado da seguridade obsta a concessão,
            salvo as exceções legais. A condição é estrita e seu antecedente, booleano — subsume-se
            sem ponderação.
          </>
        }
      >
        <div className="flex items-center gap-2">
          <input
            id="acu"
            type="checkbox"
            checked={caso.acumula}
            onChange={(e) => set({ acumula: e.target.checked })}
            className="h-4 w-4 accent-observa-petroleo"
          />
          <label htmlFor="acu" className="text-sm text-observa-petroleo">
            Acumula benefício vedado pelo §4º
          </label>
        </div>
      </DispositivoNorma>

      <div>
        <button
          onClick={aplicar}
          disabled={carregando}
          className="rounded-marca bg-observa-petroleo px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-observa-petroleo/90 disabled:opacity-50"
        >
          {carregando ? 'Aplicando a norma…' : 'Aplicar a norma (subsunção)'}
        </button>
      </div>

      <Resultado resposta={resposta} />
    </div>
  )
}
