"""Impedimento de longo prazo — art. 20, §2º e §10, da LOAS (Lei 8.742/93).

Para a pessoa com deficiência, o benefício exige impedimento de natureza física, mental,
intelectual ou sensorial cujos efeitos se prolonguem por longo prazo. O §10 fixa o longo
prazo em ao menos dois anos (vinte e quatro meses).

A pessoa idosa não se submete a este requisito: ela ingressa pelo só fato da idade
(art. 20, caput). Daí a forma positiva da regra:

    impedimento de longo prazo satisfeito  ⇔  é pessoa idosa
                                              OU (é pessoa com deficiência E o impedimento
                                                  alcança vinte e quatro meses)

Regra estrita — decorre por subsunção direta dos dispositivos (R2).

Decisão conceitual:
  - DC-02 — o impedimento de longo prazo conta a partir de vinte e quatro meses
            (art. 20, §10).
"""

from __future__ import annotations

from .bpc_art20_00caput_publico import idoso

# Duração mínima do impedimento de longo prazo, em meses (art. 20, §10; DC-02).
IMPEDIMENTO_LONGO_MESES = 24


def impedimento_longo(impedimento_meses: int) -> bool:
    """O impedimento alcança o longo prazo: vinte e quatro meses ou mais (art. 20, §10)."""
    return impedimento_meses >= IMPEDIMENTO_LONGO_MESES


def impedimento_longo_ok(idade: int, deficiente: bool, impedimento_meses: int) -> bool:
    """R2 (forma positiva) — requisito do impedimento satisfeito.

    Verdadeiro para a pessoa idosa (dispensada do requisito) ou para a pessoa com
    deficiência cujo impedimento alcance o longo prazo. Não satisfeito, a concessão é
    vedada (art. 20, §2º).
    """
    return idoso(idade) or (deficiente and impedimento_longo(impedimento_meses))
