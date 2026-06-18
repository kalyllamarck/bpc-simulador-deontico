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
        Aqui a norma é percorrida dispositivo a dispositivo, na ordem da lei. Para cada um, primeiro
        o texto legal; logo abaixo, o que precisa ser coletado do caso. Estas são as regras rígidas:
        subsunção direta, sem juízo de valor. O resíduo valorativo (miserabilidade) fica para a fase
        seguinte.
      </p>

      {/* caput — público */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.caput}
        fundamento="Define o público: pessoa idosa (65 anos ou mais) OU pessoa com deficiência. Sem integrar o público, a norma veda a concessão."
      >
        <div>
          <label className={rotulo}>Idade (anos completos)</label>
          <input type="number" min={0} value={caso.idade} onChange={(e) => set({ idade: e.target.value })} className={`${campo} mt-1`} />
        </div>
        <div className="flex items-center gap-2 sm:pt-7">
          <input id="def" type="checkbox" checked={caso.deficiente} onChange={(e) => set({ deficiente: e.target.checked })} className="h-4 w-4 accent-observa-petroleo" />
          <label htmlFor="def" className="text-sm text-observa-petroleo">Pessoa com deficiência atestada</label>
        </div>
      </DispositivoNorma>

      {/* §1º — família + renda per capita */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p1}
        fundamento="A composição do grupo familiar determina o número de pessoas que dividem a renda — base do cálculo per capita do §3º."
      >
        <div>
          <label className={rotulo}>Pessoas no grupo familiar</label>
          <input type="number" min={1} value={caso.membros} onChange={(e) => set({ membros: Number(e.target.value) })} className={`${campo} mt-1`} />
        </div>
        <div>
          <label className={rotulo}>Renda mensal do grupo (R$)</label>
          <input value={caso.rendaReais} onChange={(e) => set({ rendaReais: e.target.value })} className={`${campo} mt-1`} />
        </div>
      </DispositivoNorma>

      {/* §2º + §10 — impedimento de longo prazo */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p2}
        fundamento="O §10 fixa o impedimento de longo prazo em ao menos 2 anos (24 meses). Aplica-se ao requerente com deficiência."
      >
        <div>
          <label className={rotulo}>Impedimento de longo prazo (meses)</label>
          <input type="number" min={0} value={caso.impedimentoMeses} onChange={(e) => set({ impedimentoMeses: e.target.value })} className={`${campo} mt-1`} />
        </div>
        <p className="text-xs italic text-observa-petroleo/70 sm:pt-7">
          O §10 considera de longo prazo o impedimento com efeitos por no mínimo 24 meses.
        </p>
      </DispositivoNorma>

      {/* §3º — ¼ do salário mínimo */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p3}
        fundamento="Critério econômico: renda per capita inferior a ¼ do salário mínimo presume a incapacidade de prover a manutenção."
      >
        <div>
          <label className={rotulo}>Salário mínimo de referência (R$)</label>
          <input value={caso.smReais} onChange={(e) => set({ smReais: e.target.value })} className={`${campo} mt-1`} />
        </div>
        <p className="text-xs italic text-observa-petroleo/70 sm:pt-7">
          O teto legal é ¼ deste salário mínimo, comparado em centavos (sem arredondamento que altere a fração).
        </p>
      </DispositivoNorma>

      {/* §4º — vedação de acumulação */}
      <DispositivoNorma
        dispositivo={DISPOSITIVOS.p4}
        fundamento="Condição estrita: acumular benefício vedado da seguridade barra a concessão (vedação de conceder), salvo as exceções legais."
      >
        <div className="flex items-center gap-2">
          <input id="acu" type="checkbox" checked={caso.acumula} onChange={(e) => set({ acumula: e.target.checked })} className="h-4 w-4 accent-observa-petroleo" />
          <label htmlFor="acu" className="text-sm text-observa-petroleo">Acumula benefício vedado pelo §4º</label>
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
