/** Configuração do Tailwind — marca ObservaSocial.
 *  Tokens de cor da marca expostos como utilitários: `observa-petroleo`,
 *  `observa-menta` (ver ui/marca/CORES.md). Sinais do semáforo deôntico
 *  ficam em `sinal-*` (verde = concordaram / favorável; amarelo = conferir;
 *  vermelho = barra / pressão alta).
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'observa-petroleo': '#3d4f4f', // primária — verde-petróleo (estrutura da marca)
        'observa-menta': '#43c295',    // acento — verde-menta (ícone do logo)
        'observa-palido': '#d2eae3',   // verde pálido de apoio
        'observa-fundo': '#f4f6f7',
        'observa-borda': '#ccd1d9',
        // Sinais (semáforo deôntico / art. 201) — linguagem da norma, não "status"
        'sinal-verde': '#27ae60',
        'sinal-amarelo': '#f39c12',
        'sinal-vermelho': '#c0392b',
      },
      fontFamily: {
        // [A CONFIRMAR] fonte oficial ObservaSocial não identificada na imagem
        principal: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        marca: '6px',
      },
      boxShadow: {
        carta: '0 1px 4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
