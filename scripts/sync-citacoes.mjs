#!/usr/bin/env node
// Sincroniza o manifesto de citações do simulador a partir da infraestrutura `fontes/`
// do repo do ARTIGO (a fonte da verdade das provas ABNT). Card SÓ TEXTO: copia os
// formatos ABNT, o conceito e o link público — NUNCA copia PNG nem caminho de imagem.
//
// Uso (a partir da raiz do simulador):
//     node scripts/sync-citacoes.mjs --fontes /caminho/para/bpc-deontico/fontes/citacoes
// Sem --fontes, tenta o caminho padrão do repo do artigo neste computador.
//
// Saída: ui/src/dados/citacoes.gerado.json (versionado; o front lê deste arquivo).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')

const PADRAO_FONTES = '/home/kalyllamarck/projetos/doutorado-oficina-cientifica/bpc-deontico/fontes/citacoes'

function arg(nome) {
  const i = process.argv.indexOf(nome)
  return i >= 0 ? process.argv[i + 1] : null
}

const dirFontes = resolve(arg('--fontes') || PADRAO_FONTES)
if (!existsSync(dirFontes)) {
  console.error(`✗ pasta de fontes não encontrada: ${dirFontes}`)
  console.error('  Passe --fontes <caminho para fontes/citacoes do repo do artigo>.')
  process.exit(1)
}

// "confirmada" é a única prova que apresentamos como firme; o resto vira [A CONFIRMAR].
function normalizarStatus(s) {
  return String(s || '').trim().toLowerCase().startsWith('confirmada') ? 'confirmada' : 'a_confirmar'
}

const manifesto = {}
let total = 0
let aConfirmar = 0

for (const arquivo of readdirSync(dirFontes).sort()) {
  if (!arquivo.endsWith('.json') || arquivo.startsWith('_')) continue
  const bruto = JSON.parse(readFileSync(join(dirFontes, arquivo), 'utf8'))
  const id = bruto.id_uso
  if (!id) continue
  const status = normalizarStatus(bruto.status_prova)
  if (status !== 'confirmada') aConfirmar++
  manifesto[id] = {
    autor: bruto.autor || '',
    ano: bruto.ano ?? null,
    linha_doutrinaria: bruto.linha_doutrinaria || '',
    conceito: bruto.conceito || '',
    abnt_parentetica: bruto.formato_abnt_citacao_parentetica || '',
    abnt_narrativa: bruto.formato_abnt_citacao_narrativa || '',
    abnt_referencia: bruto.formato_abnt_referencia || '',
    trecho_exato: bruto.trecho_exato || null,
    link_publico: bruto.link_publico || '',
    status, // 'confirmada' | 'a_confirmar'
    status_detalhe: String(bruto.status_prova || '').trim(),
    // Campo de prova PREPARADO, mas sem publicar imagem (decisão card-só-texto):
    // guardamos só se existe prova local, nunca o caminho do PNG.
    tem_prova_local: Boolean(bruto.prova_png),
  }
  total++
}

const saidaDir = join(RAIZ, 'ui', 'src', 'dados')
if (!existsSync(saidaDir)) mkdirSync(saidaDir, { recursive: true })
const saida = join(saidaDir, 'citacoes.gerado.json')

const conteudo = {
  _gerado_por: 'scripts/sync-citacoes.mjs',
  _origem: 'repo do artigo · fontes/citacoes',
  _aviso: 'NÃO editar à mão. Rode o sync. Card só texto (ABNT + link); sem imagem de prova.',
  citacoes: manifesto,
}
writeFileSync(saida, JSON.stringify(conteudo, null, 2) + '\n', 'utf8')
console.log(`✓ ${total} citações sincronizadas → ui/src/dados/citacoes.gerado.json`)
console.log(`  ${aConfirmar} com prova [A CONFIRMAR] (status ≠ confirmada).`)
