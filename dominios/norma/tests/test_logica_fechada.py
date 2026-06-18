"""Prova de que a norma do BPC é uma lógica DEÔNTICA FECHADA por duas camadas.

Exigência conceitual (Kalyl, 2026-06-18): para QUALQUER caso, o sistema chega a um estado
definido — como o aplicador da norma chegaria —, sem buraco, sem travar e sem negação
silenciosa. Estes testes simulam a aplicabilidade automática da norma e provam:

  1. TOTALIDADE: toda combinação dos fatos resolve a um dos estados fechados (O_CONCEDER,
     F_CONCEDER, INDETERMINADO_VALORACAO_HUMANA), nunca uma exceção (DC-10).
  2. O terceiro estado: renda acima do ¼ do salário mínimo com miserabilidade por resolver
     devolve INDETERMINADO (valoração humana), não negação automática (DC-09).
  3. ENTRADA VÁLIDA: composição de família fora do art. 20, §1º é recusada com clareza, e
     `simular` jamais falha — devolve um estado de guarda DADOS_INVALIDOS.
"""

from __future__ import annotations

from itertools import product

import pytest

from dominios.norma.bpc_art20_p01_familia import (
    ComposicaoFamiliarInvalida,
    MembroFamilia,
    validar_composicao,
)
from dominios.norma.bpc_conclusao_deontica import (
    CONCLUSOES,
    DADOS_INVALIDOS,
    INDETERMINADO,
    O_CONCEDER,
    Requerente,
    concluir,
    simular,
)

SM_CENTAVOS = 141_200  # R$ 1.412 (2024); ¼ = 35 300 centavos (R$ 353,00)
ESTADOS_DEONTICOS = {O_CONCEDER, "F_CONCEDER", INDETERMINADO}


def _requerente(idade, deficiente, impedimento, acumula, renda_pc, escore) -> Requerente:
    return Requerente(
        familia=[MembroFamilia(renda_centavos=renda_pc, papel="requerente")],
        idade=idade,
        deficiente=deficiente,
        impedimento_meses=impedimento,
        acumula_beneficio=acumula,
        salario_minimo_centavos=SM_CENTAVOS,
        escore_miserabilidade=escore,
    )


# ---- 1. Totalidade: nenhuma combinação fica sem estado, nenhuma trava -------------

def test_logica_fechada_cobre_todas_as_combinacoes():
    idades = (60, 70)                 # não idoso / idoso
    deficiencias = (False, True)
    impedimentos = (0, 30)            # curto / longo
    acumulacoes = (False, True)
    rendas_pc = (10_000, 40_000)      # abaixo / acima do ¼ SM (35 300)
    escores = (None, 0.2, 0.85)       # ausente / baixo / alto

    combinacoes = list(product(idades, deficiencias, impedimentos, acumulacoes, rendas_pc, escores))
    assert len(combinacoes) == 96

    for idade, deficiente, impedimento, acumula, renda_pc, escore in combinacoes:
        x = _requerente(idade, deficiente, impedimento, acumula, renda_pc, escore)
        # concluir nunca lança e sempre devolve um functor deôntico definido.
        estado = concluir(x)
        assert estado in ESTADOS_DEONTICOS
        # simular também é total e devolve um estado do conjunto fechado de conclusões.
        resultado = simular(x)
        assert resultado["conclusao"] in CONCLUSOES
        assert resultado["conclusao"] in ESTADOS_DEONTICOS  # entrada aqui é sempre válida


# ---- 2. O terceiro estado: renda acima do teto sem grau → valoração humana --------

def test_indeterminado_so_quando_acima_do_teto_e_sem_grau():
    # público ok, impedimento ok, sem acúmulo, renda acima do teto, grau ausente.
    x = _requerente(70, False, 0, False, renda_pc=40_000, escore=None)
    assert concluir(x) == INDETERMINADO


def test_abaixo_do_teto_nunca_e_indeterminado_mesmo_sem_grau():
    # renda dentro do teto satisfaz o econômico (R3): conclui sem precisar de valoração.
    x = _requerente(70, False, 0, False, renda_pc=10_000, escore=None)
    assert concluir(x) == O_CONCEDER


def test_regra_estrita_nega_sem_passar_pela_valoracao():
    # acúmulo de benefício barra de imediato, ainda que a renda fosse alta e o grau ausente.
    x = _requerente(70, False, 0, True, renda_pc=40_000, escore=None)
    assert concluir(x) == "F_CONCEDER"


# ---- 3. Entrada válida: composição do art. 20, §1º; simular nunca falha -----------

def test_validar_composicao_recusa_papel_fora_da_lei():
    with pytest.raises(ComposicaoFamiliarInvalida):
        validar_composicao([MembroFamilia(renda_centavos=0, papel="vizinho")])


def test_validar_composicao_recusa_grupo_sem_requerente():
    with pytest.raises(ComposicaoFamiliarInvalida):
        validar_composicao([MembroFamilia(renda_centavos=0, papel="cônjuge ou companheiro")])


def test_validar_composicao_aceita_grupo_legal():
    validar_composicao([
        MembroFamilia(renda_centavos=50_000, papel="requerente"),
        MembroFamilia(renda_centavos=0, papel="cônjuge ou companheiro"),
        MembroFamilia(renda_centavos=0, papel="filho ou enteado solteiro"),
    ])  # não lança


def test_simular_nao_falha_com_composicao_invalida():
    x = Requerente(
        familia=[MembroFamilia(renda_centavos=0, papel="vizinho")],
        idade=70, deficiente=False, impedimento_meses=0, acumula_beneficio=False,
        salario_minimo_centavos=SM_CENTAVOS, escore_miserabilidade=None,
    )
    resultado = simular(x)               # não lança
    assert resultado["conclusao"] == DADOS_INVALIDOS
    assert "art. 20, §1º" in resultado["motivo"]


def test_simular_recusa_grau_fora_de_0_a_1():
    x = _requerente(70, False, 0, False, renda_pc=40_000, escore=1.4)
    assert simular(x)["conclusao"] == DADOS_INVALIDOS


def test_simular_entrega_rastro_auditavel():
    x = _requerente(70, False, 0, False, renda_pc=10_000, escore=None)
    resultado = simular(x)
    assert resultado["conclusao"] == O_CONCEDER
    assert any("art. 20" in linha for linha in resultado["rastro"])
