"""Miserabilidade — resíduo valorativo — art. 20, §11, da LOAS (Lei 8.742/93).

O §11 permite a comprovação da miserabilidade por outros elementos, além da renda per
capita do §3º. Aqui reside o único resíduo valorativo da norma: a miserabilidade não se
calcula, interpreta-se. É o ponto em que o §11 afasta a presunção do ¼ do salário mínimo.

Esta condição NÃO interpreta texto. Ela recebe um grau de miserabilidade JÁ convergido
(número entre 0 e 1, produzido pela camada de valoração a partir das cinco leituras do
leitor-propositor) e apenas DECIDE com a função pura `decidir(escore, limiar)`. O
leitor-propositor jamais decide (DC-08): quem decide é esta linha determinística.

É esta condição que constitui R5 — a miserabilidade comprovada DERROTA a regra-geral do
¼ do salário mínimo (R4).

Decisões conceituais:
  - DC-01 — o limiar do grau de miserabilidade fica em 0,50 (escolha política, não
            jurídica; declarada e a calibrar).
  - DC-03 — a miserabilidade comprovada derrota a regra-geral do ¼ do salário mínimo
            (derrotabilidade).
  - DC-07 — somente a miserabilidade e o grau de limitação são resíduo valorativo.
  - DC-08 — o leitor-propositor apenas propõe o grau; a decisão é determinística.
  - DC-09 — grau ausente ou sem convergência não nega: devolve INDETERMINADO, que exige
            valoração humana (estudo social), tal como faria o aplicador da norma.

A camada da miserabilidade resolve em três estados fechados, sem buraco e sem negação
silenciosa: MISERÁVEL, NÃO MISERÁVEL ou INDETERMINADO (grau ausente/sem convergência).
"""

from __future__ import annotations

# Reusa a camada deôntica do harness Oficina: o leitor-propositor interpreta e propõe o
# grau; esta função pura DECIDE (sem rede, reprodutível).
from oficina.hibrido import decidir

# Limiar do grau de miserabilidade (DC-01). Escolha política disfarçada de número: onde se
# corta muda quem ingressa. Fica declarado, não escondido — a calibrar com sentenças reais.
LIMIAR_MISERABILIDADE = 0.50


# Estados fechados da camada da miserabilidade (camada valorativa).
ESTADO_MISERAVEL = "MISERAVEL"            # comprovada — derrota a regra-geral (R5)
ESTADO_NAO_MISERAVEL = "NAO_MISERAVEL"    # afastada — a regra-geral barra (R4)
ESTADO_INDETERMINADO = "INDETERMINADO"    # grau ausente/sem convergência — valoração humana


def miseravel(
    escore_miserabilidade: float | None,
    *,
    limiar: float = LIMIAR_MISERABILIDADE,
) -> bool:
    """A miserabilidade está afirmativamente comprovada (art. 20, §11)?

    Recebe o grau já convergido (0 a 1) e decide com `decidir(escore, limiar=0,50)`.
    Verdadeiro apenas quando há grau e ele alcança o limiar. Para distinguir o grau
    ausente (que exige valoração humana) do grau baixo (que afasta), use
    `avaliar_miserabilidade`.
    """
    if escore_miserabilidade is None:
        return False
    return decidir(escore_miserabilidade, limiar=limiar)


def avaliar_miserabilidade(
    escore_miserabilidade: float | None,
    *,
    limiar: float = LIMIAR_MISERABILIDADE,
) -> str:
    """Estado fechado da miserabilidade (camada valorativa) — nunca falha, nunca nega no escuro.

    - Grau presente que alcança o limiar  → ESTADO_MISERAVEL (R5 derrota R4).
    - Grau presente abaixo do limiar       → ESTADO_NAO_MISERAVEL (R4 barra).
    - Grau ausente (None) — não avaliado ou cinco leituras sem convergência →
      ESTADO_INDETERMINADO: exige valoração humana (estudo social), como faria o
      aplicador da norma. Jamais uma negação silenciosa (DC-09).
    """
    if escore_miserabilidade is None:
        return ESTADO_INDETERMINADO
    return ESTADO_MISERAVEL if decidir(escore_miserabilidade, limiar=limiar) else ESTADO_NAO_MISERAVEL
