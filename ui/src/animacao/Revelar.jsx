/* Revelação gradual — micro-animação sóbria (sobriedade institucional ObservaSocial).
 *
 * Padrão ÚNICO: fade + translate-y de ~10px, 0.4s, ease-out, dispara ao entrar na tela
 * (uma vez). Respeita prefers-reduced-motion: quem pediu menos movimento recebe o
 * conteúdo estático, sem transição. Não anima navegação, count-up nem parallax.
 */
import { motion, useReducedMotion } from 'framer-motion'

const TRANSICAO = { duration: 0.4, ease: 'easeOut' }

export function Revelar({ children, delay = 0, className }) {
  const reduzir = useReducedMotion()
  if (reduzir) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...TRANSICAO, delay }}
    >
      {children}
    </motion.div>
  )
}

/* Lista com entrada sequencial (stagger) dos filhos — para os termos do caput e os
 * passos do fluxograma. Cada filho deve ser um <RevelarItem>. */
export function RevelarSequencia({ children, className, intervalo = 0.08 }) {
  const reduzir = useReducedMotion()
  if (reduzir) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ visivel: { transition: { staggerChildren: intervalo } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevelarItem({ children, className }) {
  const reduzir = useReducedMotion()
  if (reduzir) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        oculto: { opacity: 0, y: 8 },
        visivel: { opacity: 1, y: 0, transition: TRANSICAO },
      }}
    >
      {children}
    </motion.div>
  )
}
