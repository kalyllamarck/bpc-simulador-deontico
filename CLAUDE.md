# CLAUDE.md — bpc-deontico (usa o harness Oficina)

Este projeto vive DENTRO da Oficina (`~/projetos/doutorado-oficina-cientifica/`). Herda o
contrato da raiz (comunicação simples PT-BR; KISS; **a IA nunca decide passa/falha** — quem
decide é o linter determinístico) e o **GATE** (`LINT-ALARME.md`).

## ⚠️ Regras de escrita = o harness Oficina (use, não reinvente)
Toda **prosa PT-BR** (seções de artigo, textos de apoio, descrições) segue as MESMAS regras de
escrita que o harness valida. NÃO crie regra de estilo nova aqui — use as que já existem:

- **Catálogo das regras:** `../RULES-MAP.md` (45 regras + §2.7 registro cauteloso).
- **Como um linter funciona:** `../CONTRATO-LINTERS.md`.
- **Fonte canônica de escrita (bib):** `~/projetos/doutorado-bib-canon/02_escrita/`
  (conjunções, `escrita_proibida/`, `voz_autoral.json`).
- **Thresholds (overlay):** `../regras/*.json`.

### Princípios de escrita que o harness exige (resumo)
- Toda oração abre com **conjunção** do catálogo (`02_escrita/conjuncoes/`).
- **Proibido:** gerúndio de ligação, sintagma nominal nu, estrangeirismo sem itálico.
- **Registro científico cauteloso (§2.7):** sem promessa nem asserção categórica
  ("promete", "sem dúvida", "evidentemente", "comprova que"). Use modalização
  ("sugere", "parece", "ao que tudo indica") e autocrítica.
- Diversidade de citação, transições entre (sub)seções, conclusão no presente, etc.

## Como rodar o harness (validar a escrita)
A partir da raiz da Oficina:

```bash
cd ~/projetos/doutorado-oficina-cientifica
# Prosa solta (.md/.txt) — RÁPIDO, é o que você mais vai usar aqui:
PYTHONPATH=src .venv/bin/python -m oficina.cli lint-texto <arquivo>.md            # termos, conjunções, coocorrência, §2.7
PYTHONPATH=src .venv/bin/python -m oficina.cli lint-texto <arquivo>.md --hibrido  # + registro cauteloso (IA)

# Artigo completo (.docx) — o GATE oficial:
PYTHONPATH=src .venv/bin/python -m oficina.cli lint <caminho>.docx --hibrido
```

`lint-texto` imprime os achados e sai 1 se houver Erro (NÃO mexe no LINT-ALARME.md do artigo).
`lint` grava o `LINT-ALARME.md` na raiz (⛔ BLOQUEADO enquanto houver Erro). **Corrija o
conteúdo até zerar — nunca afrouxe threshold nem contorne o gate.**
