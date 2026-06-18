"""Critério econômico — art. 20, §3º, da LOAS (Lei 8.742/93).

Considera-se incapaz de prover a própria manutenção a família cuja renda mensal per
capita seja igual ou inferior a um quarto do salário mínimo. Este é o critério econômico
objetivo (R3).

Como regra-geral, a renda per capita acima desse teto, em princípio, barra a concessão
(R4) — mas R4 é uma regra DERROTÁVEL: cede diante da miserabilidade comprovada (R5),
tratada em `bpc_art20_p11_miserabilidade.py`. A presunção do ¼ do salário mínimo é
relativa, não teto absoluto.

Decisões conceituais:
  - DC-04 — todo valor é em centavos inteiros, comparação exata. O limite é
            `salario_minimo_centavos // 4` (divisão inteira, sem arredondamento que
            altere a fração).
  - DC-03 — a miserabilidade comprovada derrota a regra-geral do ¼ do salário mínimo
            (derrotabilidade); ver R5 no módulo da miserabilidade.
"""

from __future__ import annotations


def limite_renda_centavos(salario_minimo_centavos: int) -> int:
    """Teto do critério econômico: um quarto do salário mínimo, em centavos (art. 20, §3º).

    Divisão inteira (DC-04): trabalha em centavos para preservar a fração exata de ¼.
    """
    return salario_minimo_centavos // 4


def criterio_economico_objetivo(
    renda_per_capita_centavos: int, salario_minimo_centavos: int
) -> bool:
    """R3 — a renda per capita está dentro do teto de ¼ do salário mínimo (art. 20, §3º).

    Comparação exata em centavos (DC-04): satisfaz quem fica igual ou abaixo do limite.
    """
    return renda_per_capita_centavos <= limite_renda_centavos(salario_minimo_centavos)
