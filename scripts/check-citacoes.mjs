#!/usr/bin/env node
// Gate LEVE de citações (espelha o espírito determinístico do gate.py da oficina):
// nenhum número de nota no front pode apontar para um id que não exista no manifesto,
// e todo registro citado precisa de ABNT mínima (autor + referência + ano).
// Não decide conteúdo: só barra inconsistência mecânica. Roda no `prebuild`.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')
const DIR_SRC = join(RAIZ, 'ui', 'src')
const MANIFESTO = join(DIR_SRC, 'dados', 'citacoes.gerado.json')

if (!existsSync(MANIFESTO)) {
  console.error('✗ manifesto ausente. Rode: node scripts/sync-citacoes.mjs')
  process.exit(1)
}
const citacoes = JSON.parse(readFileSync(MANIFESTO, 'utf8')).citacoes

// Varre recursivamente ui/src por <NotaCitacao id="..."> (aspas simples ou duplas).
function listarFontes(dir) {
  const out = []
  for (const nome of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, nome.name)
    if (nome.isDirectory()) {
      if (nome.name === 'node_modules' || nome.name === 'dist') continue
      out.push(...listarFontes(caminho))
    } else if (/\.(jsx?|tsx?)$/.test(nome.name)) {
      out.push(caminho)
    }
  }
  return out
}

const RE_NOTA = /<NotaCitacao\s[^>]*\bid=(?:"([^"]+)"|'([^']+)'|\{['"]([^'"]+)['"]\})/g
const usados = new Map() // id → [arquivos]
for (const arq of listarFontes(DIR_SRC)) {
  const txt = readFileSync(arq, 'utf8')
  let m
  while ((m = RE_NOTA.exec(txt)) !== null) {
    const id = m[1] || m[2] || m[3]
    if (!usados.has(id)) usados.set(id, [])
    usados.get(id).push(arq.replace(RAIZ + '/', ''))
  }
}

const erros = []
const avisos = []

// 1) Toda nota usada precisa existir no manifesto…
for (const [id, arquivos] of usados) {
  const reg = citacoes[id]
  if (!reg) {
    erros.push(`id "${id}" usado em ${arquivos.join(', ')} não existe no manifesto`)
    continue
  }
  // 2) …e ter ABNT mínima (autor + referência + ano).
  if (!reg.autor) erros.push(`id "${id}" sem autor no manifesto`)
  if (!reg.abnt_referencia) erros.push(`id "${id}" sem referência ABNT no manifesto`)
  if (reg.ano == null) erros.push(`id "${id}" sem ano no manifesto`)
}

// 3) Registro nunca citado = aviso (não barra; o acervo pode anteceder o uso).
for (const id of Object.keys(citacoes)) {
  if (!usados.has(id)) avisos.push(id)
}

for (const e of erros) console.error(`✗ ${e}`)
if (avisos.length) {
  console.warn(`• ${avisos.length} citação(ões) no manifesto ainda sem nota no front (ok).`)
}
if (erros.length) {
  console.error(`✗ check-citacoes: ${erros.length} erro(s).`)
  process.exit(1)
}
console.log(`✓ check-citacoes: ${usados.size} nota(s) consistente(s) com o manifesto.`)
