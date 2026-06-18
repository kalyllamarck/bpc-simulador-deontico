"""Público do benefício — art. 20, caput, da LOAS (Lei 8.742/93).

Define quem está, em tese, sob o amparo da norma: a pessoa idosa (sessenta e cinco anos
ou mais) ou a pessoa com deficiência. É a porta de entrada (R1): não sendo idoso nem
pessoa com deficiência, sequer se cogita o benefício.

A regra é estrita — decorre por subsunção direta do dispositivo, sem resíduo valorativo.

Ver `DECISOES-CONCEITUAIS.md`: DC-07 (somente miserabilidade e grau de limitação são
resíduo valorativo; o restante é subsunção determinística).
"""

from __future__ import annotations

from dataclasses import dataclass

# Idade mínima da pessoa idosa para fins do benefício (art. 20, caput, LOAS).
IDADE_IDOSO = 65


@dataclass(frozen=True)
class _TemPublico:
    """Vista mínima do requerente que esta condição precisa conhecer."""

    idade: int
    deficiente: bool


def idoso(idade: int) -> bool:
    """Pessoa idosa: sessenta e cinco anos completos ou mais (art. 20, caput, LOAS)."""
    return idade >= IDADE_IDOSO


def integra_publico(idade: int, deficiente: bool) -> bool:
    """R1 — porta de entrada: é pessoa idosa OU pessoa com deficiência.

    Regra estrita do art. 20, caput. Não integrando o público, a concessão é vedada
    (a conclusão deôntica devolve "F_CONCEDER").
    """
    return idoso(idade) or deficiente
