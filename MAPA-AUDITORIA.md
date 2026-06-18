# Mapa de auditoria — do art. 20 da LOAS ao código

Esta tabela permite a um **jurista** auditar a formalização sem ler programação: cada
dispositivo do art. 20 aponta para o módulo que o aplica, o teste que o prova e a decisão
conceitual (DC) que sustenta as escolhas não dedutíveis da letra da lei.

> Regra de ouro: o código **aplica** a norma; quem decide passa/falha do *código* é o teste
> determinístico, não a IA. As DCs estão em [`DECISOES-CONCEITUAIS.md`](DECISOES-CONCEITUAIS.md).

## Norma (camada determinística) — `dominios/norma/`

| Dispositivo | O que faz | Módulo Python | Teste | DC |
|---|---|---|---|---|
| **caput** (público) | integra o público: idoso ≥65 **∨** deficiente (R1) | `bpc_art20_00caput_publico.py` | `tests/test_bpc.py` | — |
| **§1º** (família) | enumeração fechada do grupo familiar; base do per capita | `bpc_art20_p01_familia.py` | `tests/test_bpc.py` | DC-06 |
| **§2º** (deficiência) | conceito de pessoa com deficiência (impedimento) | `bpc_art20_p02_impedimento.py` | `tests/test_bpc.py` | — |
| **§3º** (renda) | critério econômico objetivo: per capita **<** ¼ SM (R3) | `bpc_art20_p03_renda.py` | `tests/test_bpc.py` | DC-03, DC-04 |
| **§4º** (vedação) | proibição de acumulação — functor **F** (R6) | `bpc_art20_p04_vedacao.py` | `tests/test_bpc.py` | — |
| **§10** (prazo) | impedimento de longo prazo ≥ 24 meses | `bpc_art20_p02_impedimento.py` | `tests/test_bpc.py` | DC-02 |
| **§11** (miserabilidade) | cláusula de abertura que **derrota** a presunção do §3º (R5/R4) | `bpc_art20_p11_miserabilidade.py` | `tests/test_bpc.py` | DC-01, DC-03, DC-09 |
| **síntese** (R7) | conclui o functor: O / F / INDETERMINADO; lógica fechada e total | `bpc_conclusao_deontica.py` | `tests/test_logica_fechada.py` | DC-08, DC-09, DC-10 |

## Vista da estrutura — `dominios/grafo/`

| O que faz | Módulo Python | Teste | DC |
|---|---|---|---|
| Grafo de fluxo + complexidade ciclomática, **derivado** de `concluir()` | `bpc_grafo_ciclomatico.py` | `tests/test_grafo_ciclomatico.py` | DC-11 |

## Camada valorativa (resíduo do §11) — `dominios/valoracao/`

| O que faz | Módulo Python | Teste | DC |
|---|---|---|---|
| Convergência das 5 leituras; a IA propõe, `decidir()` decide | `valoracao.py` | `tests/test_valoracao.py`, `tests/test_5_de_5.py` | DC-07, DC-08 |
| Fórmula do peso de Alexy (expõe a ponderação, não decide) | `alexy_formula_peso.py` | `tests/test_alexy_formula_peso.py` | DC-12 |
| Metódica de Müller (programa × âmbito) | `muller_programa_ambito.py` | `tests/test_muller_programa_ambito.py` | DC-13 |

## Justificação (MacCormick) — `dominios/decisao/`

| O que faz | Módulo Python | Teste | DC |
|---|---|---|---|
| Silogismo de 1ª ordem + 3 portões (universalizabilidade, consistência, coerência) | `maccormick_justificacao.py` | `tests/test_maccormick_justificacao.py` | DC-14 |

## Impacto (art. 201) — `dominios/impacto/`

| O que faz | Módulo Python | Teste | DC |
|---|---|---|---|
| Estimativa de impacto + semáforo (indicador argumentativo, não veredito) | `impacto.py` | `tests/test_impacto.py` | — |

## Front (extensão didática) — `ui/`
A tela traduz o motor em 6 passos (tradução do caput → subsunção → fluxograma → grafo navegável →
camada valorativa → MacCormick). A tradução deôntica comando a comando vive em
`ui/src/dominio/deontica.js`, **derivada do motor** (DC-11). As citações são geradas de
`fontes/` do repo do artigo (ver `scripts/sync-citacoes.mjs`).
