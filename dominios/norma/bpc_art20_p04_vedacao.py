"""Vedação de acumulação — art. 20, §4º, da LOAS (Lei 8.742/93).

O benefício não pode ser acumulado com outro benefício no âmbito da seguridade social ou
de outro regime, salvo as exceções legais (entre elas a assistência médica e a pensão
especial de natureza indenizável). Recebendo benefício incompatível, a concessão é
vedada.

Regra estrita — subsunção direta do dispositivo (R6). É a primeira condição avaliada na
conclusão deôntica, por ser vedação absoluta: nem se examinam público, impedimento ou
renda quando há acumulação proibida.
"""

from __future__ import annotations


def acumula_beneficio_vedado(acumula_beneficio: bool) -> bool:
    """R6 — há acumulação de benefício incompatível (art. 20, §4º).

    Verdadeiro quando o requerente já recebe benefício que a lei não admite somar; nesse
    caso a concessão é vedada ("F_CONCEDER"), independentemente das demais condições.
    """
    return acumula_beneficio
