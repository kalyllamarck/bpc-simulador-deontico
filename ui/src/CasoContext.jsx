/* Estado do caso — guardado num único lugar e PRESERVADO entre as quatro fases.
 *
 * Corrige o "trocar de modo sozinho" relatado na auditoria: os dados do requerente
 * ficam aqui, no contexto, e não são reiniciados quando o jurista anda no stepper.
 * A IA não decide nada — isto é só memória dos campos da norma.
 */
import { createContext, useContext, useState } from 'react'

const CasoContext = createContext(null)

/* Caso inicial — espelha os campos do art. 20 (família resumida no requerente). */
const CASO_INICIAL = {
  idade: 67,
  membros: 1,
  rendaReais: '210,00',
  smReais: '1412,00',
  deficiente: false,
  impedimentoMeses: 0,
  acumula: false,
  grauMiserabilidade: '', // vazio = sem convergência das 5 leituras
}

export function CasoProvider({ children }) {
  const [caso, setCaso] = useState(CASO_INICIAL)
  // Conclusões já apuradas por fase (para o stepper mostrar progresso sem refazer).
  const [resultados, setResultados] = useState({})

  function atualizar(campos) {
    setCaso((c) => ({ ...c, ...campos }))
  }
  function registrarResultado(fase, dado) {
    setResultados((r) => ({ ...r, [fase]: dado }))
  }

  return (
    <CasoContext.Provider value={{ caso, atualizar, resultados, registrarResultado }}>
      {children}
    </CasoContext.Provider>
  )
}

export function useCaso() {
  const ctx = useContext(CasoContext)
  if (!ctx) throw new Error('useCaso fora do CasoProvider')
  return ctx
}

/* Converte o caso (forma da tela) para o requerente que o motor espera. */
export function casoParaRequerente(caso) {
  const reaisParaCentavos = (s) =>
    Math.round(parseFloat(String(s).replace(/\./g, '').replace(',', '.') || '0') * 100)
  const rendaCentavos = reaisParaCentavos(caso.rendaReais)
  const escore = caso.grauMiserabilidade === '' ? null : parseFloat(caso.grauMiserabilidade)
  return {
    familia: [
      { renda_centavos: rendaCentavos, papel: 'requerente' },
      ...Array.from({ length: Math.max(0, caso.membros - 1) }, () => ({
        renda_centavos: 0,
        papel: 'filho ou enteado solteiro',
      })),
    ],
    idade: Number(caso.idade),
    deficiente: caso.deficiente,
    impedimento_meses: Number(caso.impedimentoMeses),
    acumula_beneficio: caso.acumula,
    salario_minimo_centavos: reaisParaCentavos(caso.smReais),
    escore_miserabilidade: escore,
  }
}
