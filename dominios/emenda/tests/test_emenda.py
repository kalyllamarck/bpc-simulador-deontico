"""Testes determinísticos do domínio EMENDA (2ª camada ex-ante).

Cobre: montagem da renda computável por versão (exclusões parametrizadas), as transições
de estado da grade sob o Decreto 12.534/2025, o resumo, a tradução jurídica (sem jargão),
a estimativa orçamentária (com guardrail de calibração) e a alcançabilidade do grafo de
domínios. Sem rede, sem IA — números fechados, conferíveis na mão.
"""

from __future__ import annotations

from dominios.emenda.diff_impacto import (
    diff_grade,
    estimar_impacto_orcamentario,
    resumo,
    sensibilidade_por_ponto_percentual,
    transicao_caso,
)
from dominios.emenda.exclusoes_renda import (
    TRANSFERENCIA_RENDA,
    MembroPerfil,
    PerfilFamiliar,
    RendaCategorizada,
    montar_requerente,
)
from dominios.emenda.grade_casos_tipo import GRADE, SM_2026_CENTAVOS
from dominios.emenda.grafo_dominios import dominios_afetados
from dominios.norma.bpc_conclusao_deontica import F_CONCEDER, INDETERMINADO, O_CONCEDER

CASOS = {p.id: p for p in GRADE}


def _perfil_bf(escore=None) -> PerfilFamiliar:
    return PerfilFamiliar(
        id="t",
        descricao="teste",
        membros=(MembroPerfil("requerente", (RendaCategorizada(TRANSFERENCIA_RENDA, 60_000),)),),
        idade=68,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=escore,
    )


# --- Exclusões parametrizadas ------------------------------------------------------


def test_montar_requerente_v1_exclui_transferencia():
    req = montar_requerente(_perfil_bf(), "v1")
    assert req.familia[0].renda_centavos == 0  # Bolsa Família NÃO computada na v1


def test_montar_requerente_v2_computa_transferencia():
    req = montar_requerente(_perfil_bf(), "v2")
    assert req.familia[0].renda_centavos == 60_000  # Bolsa Família computada na v2


# --- Transições da grade -----------------------------------------------------------


def test_caso_A_idoso_so_bf_perde_para_indeterminado():
    t = transicao_caso(CASOS["A_idoso_so_bf"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == INDETERMINADO
    assert t["perde_concessao"] is True


def test_caso_B_casal_perde_para_indeterminado():
    t = transicao_caso(CASOS["B_idoso_conjuge_salario_bf"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == INDETERMINADO


def test_caso_C_familia_grande_nao_transita():
    t = transicao_caso(CASOS["C_idoso_familia4_bf_baixa"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == O_CONCEDER
    assert t["perde_concessao"] is False


def test_caso_G_miserabilidade_afastada_vira_vedacao():
    t = transicao_caso(CASOS["G_idoso_bf_miserabilidade_afastada"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == F_CONCEDER
    assert t["perde_concessao"] is True


def test_caso_H_miserabilidade_comprovada_migra_de_camada():
    t = transicao_caso(CASOS["H_idoso_bf_miserabilidade_comprovada"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == O_CONCEDER  # mantém a concessão...
    assert t["muda_de_camada"] is True  # ...mas por R5 (valorativa), não mais por R3


def test_caso_I_previdenciario_minimo_sem_efeito():
    t = transicao_caso(CASOS["I_idoso_previdenciario_minimo"])
    assert t["v1"]["conclusao"] == O_CONCEDER
    assert t["v2"]["conclusao"] == O_CONCEDER
    assert t["perde_concessao"] is False
    assert t["muda_de_camada"] is False  # inciso IX permanece excluído → nada muda


def test_caso_E_impedimento_curto_vedado_em_ambas():
    t = transicao_caso(CASOS["E_pcd_sem_impedimento_longo"])
    assert t["v1"]["conclusao"] == F_CONCEDER
    assert t["v2"]["conclusao"] == F_CONCEDER


# --- Resumo ------------------------------------------------------------------------


def test_resumo_conta_atingidos():
    r = resumo(diff_grade(GRADE))
    assert r["total_casos"] == len(GRADE)
    assert r["perdem_concessao"] >= 3  # A, B, D, G ao menos
    assert 0.0 < r["fracao_atingida_na_grade"] <= 1.0
    assert "A_idoso_so_bf" in r["ids_perdem"]
    assert "H_idoso_bf_miserabilidade_comprovada" in r["ids_migram"]


# --- Tradução jurídica (sem jargão de programação) ---------------------------------


def test_traducao_e_juridica_sem_jargao():
    for t in diff_grade(GRADE):
        texto = t["efeito_juridico"].lower()
        for proibido in ("diff", "commit", "branch", "merge", "v1", "v2", "dict"):
            assert proibido not in texto, f"jargão {proibido!r} em {t['id']}"
        assert "art. 20" in t["efeito_juridico"]


# --- Estimativa orçamentária (guardrail) -------------------------------------------


def test_impacto_orcamentario_negativo_e_rotulado():
    r = resumo(diff_grade(GRADE))
    imp = estimar_impacto_orcamentario(r["fracao_atingida_na_grade"])
    assert imp["delta_beneficiarios"] < 0  # retrocesso reduz cobertura
    assert imp["delta_reais"] < 0
    assert "não calibrada" in imp["calibracao"]
    assert imp["semaforo"]["cor"] in {"verde", "amarelo", "vermelho"}


def test_sensibilidade_por_ponto_percentual():
    s = sensibilidade_por_ponto_percentual()
    # 1% de ~7,6 mi de benefícios ~ 76 mil pessoas.
    assert 70_000 < s["beneficiarios_por_ponto_percentual"] < 80_000
    # ~76 mil × 1 SM × 12 meses ~ R$ 1,5 bi/ano por ponto percentual.
    assert 1.0e9 < s["reais_ano_por_ponto_percentual"] < 2.0e9


# --- Grafo de domínios afetados ----------------------------------------------------


def test_grafo_alcanca_pagamento_e_art201():
    r = dominios_afetados()
    assert "autorizacao_pagamento_inss" in r["nos"]
    assert "pressao_art201" in r["nos"]
    for dom in ("norma", "valoracao", "impacto", "operacional"):
        assert dom in r["dominios"]
