/* Resultado — conclusão deôntica + trilha do raciocínio.
 *
 * Correção da auditoria: tudo passa pelo léxico. A conclusão usa functor(); cada
 * linha da trilha é traduzida() — nenhum token cru (O_CONCEDER, baseline…) na tela.
 */
import { functor, traduzir } from '../lexico'

const CLASSE_SINAL = {
  verde: { ponto: 'bg-sinal-verde', texto: 'text-sinal-verde', borda: 'border-sinal-verde' },
  amarelo: {
    ponto: 'bg-sinal-amarelo',
    texto: 'text-sinal-amarelo',
    borda: 'border-sinal-amarelo',
  },
  vermelho: {
    ponto: 'bg-sinal-vermelho',
    texto: 'text-sinal-vermelho',
    borda: 'border-sinal-vermelho',
  },
}

function reaisDeCentavos(centavos) {
  if (centavos == null) return '—'
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function OrigemDado({ origem }) {
  return (
    <p className="text-xs italic text-observa-petroleo/70">
      {origem === 'motor'
        ? 'Resultado produzido pelo motor da norma.'
        : 'Demonstração com dado de exemplo (o motor não respondeu). Os valores espelham a forma real da saída.'}
    </p>
  )
}

export default function Resultado({ resposta }) {
  if (!resposta) return null
  const f = functor(resposta.conclusao)
  const c = CLASSE_SINAL[f.sinal]

  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-marca border-l-4 ${c.borda} bg-white p-5 shadow-carta`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
          Conclusão da norma (art. 20 da LOAS)
        </p>
        <p className={`mt-1 text-xl font-bold ${c.texto}`}>{f.rotulo}</p>
        <p className="mt-2 text-sm leading-relaxed text-observa-petroleo/85">{f.nota}</p>
        {resposta.renda_per_capita_centavos != null && (
          <p className="mt-3 text-sm text-observa-petroleo/80">
            Renda familiar per capita apurada:{' '}
            <strong>{reaisDeCentavos(resposta.renda_per_capita_centavos)}</strong>/mês.
          </p>
        )}
        {resposta.motivo && (
          <p className="mt-2 text-sm italic text-sinal-vermelho">{traduzir(resposta.motivo)}</p>
        )}
      </div>

      <div className="rounded-marca border border-observa-borda bg-white p-5 shadow-carta">
        <p className="text-xs font-semibold uppercase tracking-wide text-observa-petroleo/70">
          Trilha do raciocínio — dispositivos aplicados
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {(resposta.rastro || []).map((linha, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-observa-petroleo/90">
              <span className="font-mono text-observa-menta">{i + 1}.</span>
              <span>{traduzir(linha)}</span>
            </li>
          ))}
        </ol>
      </div>

      <OrigemDado origem={resposta._origem} />
    </div>
  )
}
