"""Conferência da fórmula do peso de Alexy — EXPÕE, não decide (DC-12).

Sem rede: recebe escores fixos (poderiam vir da convergência híbrida). Verifica parcelas,
peso_total (0–1), a ressalva de Atienza e que `decide` é sempre False.
"""

from __future__ import annotations

import pytest

from dominios.valoracao.alexy_formula_peso import PESOS, expor


def test_pesos_somam_um():
    assert pytest.approx(sum(PESOS.values())) == 1.0


def test_expor_calcula_parcelas_e_peso_total():
    escores = {
        "intensidade_restricao": 1.0,
        "peso_abstrato": 1.0,
        "seguranca_premissa": 1.0,
    }
    res = expor(escores)
    assert res["ancora"] == "alexy"
    assert len(res["dimensoes"]) == 3
    for d in res["dimensoes"]:
        assert d["parcela"] == pytest.approx(d["escore"] * d["peso"])
    # Escores máximos → peso_total = soma dos pesos = 1,0.
    assert res["peso_total"] == pytest.approx(1.0)


def test_peso_total_dentro_de_zero_um():
    res = expor({"intensidade_restricao": 0.5, "peso_abstrato": 0.3, "seguranca_premissa": 0.8})
    assert 0.0 <= res["peso_total"] <= 1.0


def test_escore_ausente_vira_zero():
    """Dimensão ausente entra com escore 0 (sem inventar valor)."""
    res = expor({"intensidade_restricao": 0.9})
    nomes = {d["nome"]: d["escore"] for d in res["dimensoes"]}
    assert nomes["peso_abstrato"] == 0.0
    assert nomes["seguranca_premissa"] == 0.0


def test_nunca_decide_e_traz_a_ressalva_de_atienza():
    res = expor({})
    assert res["decide"] is False
    assert "Atienza" in res["ressalva"]
