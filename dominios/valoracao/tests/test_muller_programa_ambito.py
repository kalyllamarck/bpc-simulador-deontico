"""Conferência do enquadramento de Müller — programa × âmbito × tensão (DC-13).

Declarativo: separa o texto da norma (programa) da realidade do caso (âmbito) e nomeia a
tensão. Nunca decide (`decide=False`).
"""

from __future__ import annotations

from dominios.valoracao.muller_programa_ambito import enquadrar


def test_enquadra_programa_ambito_tensao():
    caso = {
        "familia": [{"renda_centavos": 0, "papel": "requerente"}],
        "idade": 70,
        "deficiente": True,
        "renda_per_capita_centavos": 50000,
    }
    res = enquadrar(caso)
    assert res["ancora"] == "muller"
    assert "Programa da norma" in res["programa"]
    assert "art. 20" in res["programa"]
    assert "Âmbito da norma" in res["ambito"]
    assert "Tensão" in res["tensao"]


def test_ambito_reflete_os_fatos_do_caso():
    caso = {
        "familia": [{}, {}, {}],
        "idade": 67,
        "deficiente": True,
        "renda_per_capita_centavos": 70600,
    }
    res = enquadrar(caso)
    assert "3 integrante" in res["ambito"]
    assert "67 ano" in res["ambito"]
    assert "deficiência" in res["ambito"]
    assert "706,00" in res["ambito"]  # 70600 centavos = R$ 706,00


def test_nunca_decide():
    assert enquadrar({}).get("decide") is False
