"""Testes deterministicos da calculadora de impacto (Tela 2).

Cobre: formula base exata (§2.1), o GUARDRAIL de elasticidade (null -> NAO_CALIBRADO;
hipotese do jurista -> numero ROTULADO), o semaforo do art. 201 nos 3 cortes
verde/amarelo/vermelho (§3.2), e as ancoras CONFIRMADAS do ancoras.json real.

Nada de rede, nada de IA. Numeros fechados, conferiveis na mao.
"""

from __future__ import annotations

import math

from dominios.impacto.impacto import (
    carregar_ancoras,
    estimar_delta,
    impacto_anual_reais,
    semaforo_art201,
    simular,
)


# Ancoras fixas para teste, independentes do arquivo. Gasto base = R$ 100 bi
# (em bilhoes), estoque 5.000.000, SM R$ 1.000, sem elasticidade calibrada (null).
def _ancoras_teste(elast_renda=None) -> dict:
    return {
        "gasto_bpc_2024_bilhoes": {"valor": 100.0, "fonte": "fonte-teste-gasto"},
        "estoque_total_beneficios_emitidos_2025": {"valor": 5_000_000,
                                                    "fonte": "fonte-teste-estoque"},
        "beneficio_unitario_sm": {"2024": 1_000.0, "fonte": "fonte-teste-sm"},
        "meses": {"valor": 12},
        "semaforo": {"limiar_amarelo_pct": 20, "limiar_vermelho_pct": 50},
        "elasticidades": {
            "elasticidade_limiar_renda_1_4_para_1_2_SM": {"valor": elast_renda,
                                                          "_baseline": 0.25},
            "elasticidade_criterio_etario": {"valor": None, "_baseline": 65},
            "elasticidade_criterio_deficiencia": {"valor": None, "_baseline": 24},
        },
    }


# ---- §2.1 formula base ------------------------------------------------------------

def test_impacto_anual_reais_produto_exato():
    # 1.000 benef x R$ 1.412 x 12 = R$ 16.944.000
    assert impacto_anual_reais(1_000, 1_412.0, 12) == 16_944_000.0


def test_impacto_anual_negativo_quando_perde_beneficiarios():
    assert impacto_anual_reais(-500, 1_000.0, 12) == -6_000_000.0


def test_impacto_anual_meses_default_12():
    assert impacto_anual_reais(1, 1_000.0) == 12_000.0


# ---- GUARDRAIL de elasticidade ----------------------------------------------------

def test_estimar_delta_null_sem_hipotese_devolve_none():
    a = _ancoras_teste()  # renda null
    delta, rotulo = estimar_delta("renda", 0.50, ancoras=a)
    assert delta is None
    assert rotulo is None


def test_estimar_delta_com_hipotese_do_jurista_calcula_e_rotula():
    a = _ancoras_teste()  # renda null, mas o jurista informa hipotese 0,40
    # baseline 0,25; novo 0,50 -> Dparam = 0,25
    # D = estoque 5.000.000 x elast 0,40 x 0,25 = 500.000
    delta, rotulo = estimar_delta("renda", 0.50, ancoras=a, elasticidade_hipotese=0.40)
    assert delta == 500_000.0
    assert "nao calibrada em PNADc" in rotulo


def test_estimar_delta_ancora_calibrada_usa_valor_e_ignora_hipotese():
    a = _ancoras_teste(elast_renda=0.40)  # calibrada
    delta, rotulo = estimar_delta("renda", 0.50, ancoras=a, elasticidade_hipotese=9.99)
    assert delta == 500_000.0  # usou a ancora 0,40, nao a hipotese
    assert rotulo == "calibrada em PNADc"


def test_estimar_delta_parametro_desconhecido_levanta():
    a = _ancoras_teste()
    try:
        estimar_delta("composicao_familiar", 3, ancoras=a)
    except KeyError:
        return
    raise AssertionError("esperava KeyError para parametro desconhecido")


def test_simular_null_sem_hipotese_retorna_nao_calibrado():
    a = _ancoras_teste()  # renda null
    r = simular("renda", 0.50, ancoras=a)
    assert r["estado"] == "NAO_CALIBRADO"
    assert r["delta_beneficiarios"] is None
    assert r["gasto_novo"] is None
    assert r["semaforo"] is None
    assert "calcular sobre PNADc" in r["mensagem"]
    assert "fonte_ancoras" in r  # toda saida carrega a proveniencia


def test_simular_com_hipotese_calcula_e_rotula_nao_calibrada():
    a = _ancoras_teste()  # renda null, hipotese do jurista
    # D benef = 500.000; D R$ = 500.000 x 1.000 x 12 = 6 bi; gasto novo 106 bi (+6%)
    r = simular("renda", 0.50, ancoras=a, elasticidade_hipotese=0.40)
    assert r["estado"] == "CALCULADO"
    assert r["delta_beneficiarios"] == 500_000.0
    assert r["delta_reais"] == 6_000_000_000.0
    assert r["gasto_novo"] == 106_000_000_000.0
    assert r["semaforo"]["cor"] == "verde"
    assert "nao calibrada em PNADc" in r["calibracao"]
    assert "fonte_ancoras" in r


def test_simular_idade_sinal_negativo_com_hipotese():
    a = _ancoras_teste()
    # baixar idade 65 -> 60: Dparam = -5; hipotese -0,06 -> D positivo (mais gente)
    # 5.000.000 x (-0,06) x (-5) = 1.500.000
    r = simular("idade", 60, ancoras=a, elasticidade_hipotese=-0.06)
    assert r["delta_beneficiarios"] == 1_500_000.0


# ---- §3.2 semaforo nos 3 cortes ---------------------------------------------------

def test_semaforo_verde_abaixo_do_amarelo():
    a = _ancoras_teste()  # gasto atual 100 bi
    s = semaforo_art201(110_000_000_000, ancoras=a)  # +10%
    assert s["cor"] == "verde"
    assert math.isclose(s["peso_pct"], 10.0)


def test_semaforo_amarelo_no_corte_20pct():
    a = _ancoras_teste()
    s = semaforo_art201(120_000_000_000, ancoras=a)  # +20% exato
    assert s["cor"] == "amarelo"
    assert math.isclose(s["peso_pct"], 20.0)


def test_semaforo_vermelho_no_corte_50pct():
    a = _ancoras_teste()
    s = semaforo_art201(150_000_000_000, ancoras=a)  # +50% exato
    assert s["cor"] == "vermelho"
    assert math.isclose(s["peso_pct"], 50.0)


def test_semaforo_mensagem_honesta_expoe_nao_decide():
    a = _ancoras_teste()
    s = semaforo_art201(160_000_000_000, ancoras=a)
    msg = s["mensagem_honesta"].lower()
    assert "nao e declaracao de inconstitucionalidade" in msg
    assert "art. 203, v" in msg
    assert "art. 201" in msg


def test_semaforo_verde_quando_gasto_cai():
    a = _ancoras_teste()
    s = semaforo_art201(80_000_000_000, ancoras=a)  # -20%
    assert s["cor"] == "verde"
    assert s["peso_pct"] < 0


# ---- o ancoras.json real carrega e tem as ancoras CONFIRMADAS ---------------------

def test_ancoras_json_real_carrega_e_tem_valores_confirmados():
    a = carregar_ancoras()
    assert a["gasto_bpc_2024_bilhoes"]["valor"] == 113.421
    assert a["gasto_bpc_2024_bilhoes"]["status"] == "CONFIRMADO"
    assert a["estoque_total_beneficios_emitidos_2025"]["valor"] == 7_645_372
    assert a["concessoes_assistenciais_2023"]["valor"] == 804_138
    assert a["beneficio_unitario_sm"]["2024"] == 1_412.00
    assert a["beneficio_unitario_sm"]["2025"] == 1_518.00
    assert a["beneficio_unitario_sm"]["2026"] == 1_622.00
    assert a["especies"]["87"].startswith("BPC-PcD")
    assert a["especies"]["88"].startswith("BPC-Idoso")
    assert a["semaforo"]["limiar_amarelo_pct"] == 20
    assert a["semaforo"]["limiar_vermelho_pct"] == 50


def test_ancoras_json_real_elasticidades_e_takeup_sao_null():
    # GUARDRAIL: nunca preenchidas por estimativa da IA.
    a = carregar_ancoras()
    assert a["taxa_adesao_take_up_bpc_idoso"]["valor"] is None
    assert a["taxa_adesao_take_up_bpc_pcd"]["valor"] is None
    for chave in ("elasticidade_limiar_renda_1_4_para_1_2_SM",
                  "elasticidade_criterio_etario",
                  "elasticidade_criterio_deficiencia"):
        assert a["elasticidades"][chave]["valor"] is None
        assert a["elasticidades"][chave]["status"] == "A_CONFIRMAR"


def test_ancoras_json_real_simular_devolve_nao_calibrado():
    # Com o ancoras.json real (elasticidades null), simular nao inventa numero.
    a = carregar_ancoras()
    r = simular("renda", 0.50, ancoras=a)
    assert r["estado"] == "NAO_CALIBRADO"
