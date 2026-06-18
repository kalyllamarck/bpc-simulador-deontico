"""Conferência da justificação de MacCormick — silogismo de 1ª ordem e 3 gates de 2ª.

Sem rede. Functor definido por regra (R3/R5/R4 ou estrita) → silogismo fecha, sem gates.
INDETERMINADO → não fecha, rodam os três gates determinísticos (DC-14, DC-09).
"""

from __future__ import annotations

from dominios.decisao.maccormick_justificacao import justificar
from dominios.norma.bpc_art20_p01_familia import MembroFamilia
from dominios.norma.bpc_conclusao_deontica import (
    F_CONCEDER,
    INDETERMINADO,
    O_CONCEDER,
    Requerente,
)

SM = 141200


def _req(**kw) -> Requerente:
    base = dict(
        familia=[MembroFamilia(renda_centavos=0, papel="requerente")],
        idade=70,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM,
        escore_miserabilidade=None,
    )
    base.update(kw)
    return Requerente(**base)


# ---------------------------------------------------------------- 1ª ordem: silogismo fecha


def test_silogismo_fecha_quando_functor_definido_por_regra_R3():
    """Renda dentro do teto (R3) → O_CONCEDER por subsunção; silogismo fecha, sem gates."""
    res = justificar(_req(idade=70))
    assert res["functor_final"] == O_CONCEDER
    assert res["silogismo"]["fecha"] is True
    assert res["gates"] is None
    assert res["silogismo"]["rastro"]  # trilha não vazia


def test_silogismo_fecha_no_F_CONCEDER_por_regra_estrita():
    """Fora do público (R1) → F_CONCEDER por regra estrita; fecha sem gates."""
    res = justificar(_req(idade=40, deficiente=False))
    assert res["functor_final"] == F_CONCEDER
    assert res["silogismo"]["fecha"] is True
    assert res["gates"] is None


def test_silogismo_fecha_no_R5_miserabilidade_derrota():
    """Renda acima do teto mas miserabilidade comprovada (R5) → O_CONCEDER; fecha."""
    req = _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=0.9,
    )
    res = justificar(req)
    assert res["functor_final"] == O_CONCEDER
    assert res["silogismo"]["fecha"] is True
    assert res["gates"] is None


# ---------------------------------------------------------------- 2ª ordem: 3 gates


def test_indeterminado_nao_fecha_e_roda_os_tres_gates():
    """Renda acima do teto e miserabilidade por resolver → INDETERMINADO; 3 gates rodam."""
    req = _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=None,
    )
    res = justificar(req)
    assert res["functor_final"] == INDETERMINADO
    assert res["silogismo"]["fecha"] is False
    assert res["gates"] is not None
    nomes = [g["nome"] for g in res["gates"]]
    assert nomes == ["universalizabilidade", "consistencia", "coerencia"]
    for g in res["gates"]:
        assert isinstance(g["passou"], bool)
        assert g["explicacao"]


def test_gates_de_caso_valido_passam():
    """Caso INDETERMINADO bem formado → os três gates passam (consistência inclusa)."""
    req = _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=None,
    )
    res = justificar(req)
    assert all(g["passou"] for g in res["gates"])
