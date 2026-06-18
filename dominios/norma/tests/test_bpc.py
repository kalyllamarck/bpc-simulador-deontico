"""Testes da norma do BPC em código deôntico (nova taxonomia, art. 20 da LOAS).

Cobre cada condição (R1..R7), a prioridade derrotável R5 > R4 (o teste-chave que prova a
tese) e o grupo familiar / renda per capita em centavos (art. 20, §1º + §3º; DC-04, DC-06).

Salário mínimo de referência: R$ 1.412 (2024) → em centavos 141 200; ¼ do salário mínimo
= 35 300 centavos (R$ 353,00).
"""

from __future__ import annotations

from dataclasses import replace

import pytest

from dominios.norma.bpc_art20_00caput_publico import idoso, integra_publico
from dominios.norma.bpc_art20_p01_familia import (
    MembroFamilia,
    renda_familiar_total_centavos,
    renda_per_capita_centavos,
)
from dominios.norma.bpc_art20_p02_impedimento import (
    impedimento_longo,
    impedimento_longo_ok,
)
from dominios.norma.bpc_art20_p03_renda import (
    criterio_economico_objetivo,
    limite_renda_centavos,
)
from dominios.norma.bpc_art20_p04_vedacao import acumula_beneficio_vedado
from dominios.norma.bpc_art20_p11_miserabilidade import miseravel
from dominios.norma.bpc_conclusao_deontica import (
    INDETERMINADO,
    Requerente,
    concluir,
    criterio_economico,
    rastro,
    renda_per_capita,
)

SM_CENTAVOS = 141_200  # salário mínimo de referência (R$ 1.412 em 2024), em centavos


def req(**kw) -> Requerente:
    """Fábrica com defaults sensatos; sobrescreva só o que o caso exige.

    Default: requerente único, renda zero, não idoso, não deficiente, sem acúmulo.
    """
    base = dict(
        familia=[MembroFamilia(renda_centavos=0, papel="requerente")],
        idade=40,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_CENTAVOS,
        escore_miserabilidade=None,
    )
    base.update(kw)
    return Requerente(**base)


# ---- art. 20, §3º — limite e renda per capita em centavos ------------------------

def test_limite_renda_eh_um_quarto_do_sm_em_centavos():
    assert limite_renda_centavos(SM_CENTAVOS) == 35_300  # R$ 353,00


def test_renda_per_capita_divide_pela_familia_em_centavos():
    familia = [
        MembroFamilia(renda_centavos=120_000, papel="requerente"),
        MembroFamilia(renda_centavos=0),
        MembroFamilia(renda_centavos=0),
        MembroFamilia(renda_centavos=0),
    ]
    assert renda_familiar_total_centavos(familia) == 120_000
    assert renda_per_capita_centavos(familia) == 30_000  # R$ 1.200 / 4 = R$ 300,00


def test_renda_per_capita_grupo_vazio_e_erro():
    with pytest.raises(ValueError):
        renda_per_capita_centavos([])


# ---- art. 20, caput — público (idoso OU deficiente) ------------------------------

def test_idoso_com_65_ou_mais():
    assert idoso(65)
    assert not idoso(64)


def test_r1_nao_idoso_e_nao_deficiente_proibido():
    x = req(idade=40, deficiente=False)
    assert not integra_publico(x.idade, x.deficiente)
    assert concluir(x) == "F_CONCEDER"


# ---- art. 20, §2º + §10 — impedimento de longo prazo -----------------------------

def test_impedimento_longo_a_partir_de_24_meses():
    assert impedimento_longo(24)
    assert not impedimento_longo(23)


def test_r2_deficiente_sem_impedimento_longo_proibido():
    x = req(idade=40, deficiente=True, impedimento_meses=12)
    assert not impedimento_longo_ok(x.idade, x.deficiente, x.impedimento_meses)
    assert concluir(x) == "F_CONCEDER"


def test_r2_deficiente_com_impedimento_longo_passa_a_etapa():
    x = req(idade=40, deficiente=True, impedimento_meses=24)
    assert impedimento_longo_ok(x.idade, x.deficiente, x.impedimento_meses)
    assert concluir(x) == "O_CONCEDER"


def test_r2_idoso_dispensa_impedimento():
    # Pessoa idosa não se submete ao requisito do impedimento.
    assert impedimento_longo_ok(70, deficiente=False, impedimento_meses=0)


# ---- caso feliz: idoso pobre sem acúmulo → obrigatório conceder ------------------

def test_idoso_pobre_sem_acumulo_obrigatorio_conceder():
    x = req(idade=70)
    assert concluir(x) == "O_CONCEDER"


# ---- art. 20, §3º — R3: renda dentro do teto satisfaz econômico ------------------

def test_r3_renda_dentro_do_teto_obrigatorio():
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=30_000)])  # R$ 300 <= R$ 353
    assert criterio_economico_objetivo(renda_per_capita(x), x.salario_minimo_centavos)
    assert concluir(x) == "O_CONCEDER"


def test_r3_renda_exatamente_no_limite_satisfaz():
    # Comparação exata em centavos (DC-04): igual ao teto satisfaz.
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=35_300)])
    assert concluir(x) == "O_CONCEDER"


# ---- renda acima do ¼ SM: grau ausente → INDETERMINADO; grau baixo → R4 (proibido) -

def test_renda_acima_do_teto_sem_grau_indeterminado_valoracao_humana():
    # renda per capita R$ 500 > R$ 353; sem grau → não nega no escuro: exige estudo social.
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)],
            escore_miserabilidade=None)
    assert not criterio_economico(x)                 # não satisfeito afirmativamente
    assert concluir(x) == INDETERMINADO              # valoração humana, não negação


def test_r4_renda_acima_do_teto_escore_baixo_proibido():
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)],
            escore_miserabilidade=0.2)
    assert not miseravel(x.escore_miserabilidade)
    assert concluir(x) == "F_CONCEDER"


# ---- R5 DERROTA R4: o teste-chave da tese ----------------------------------------

def test_r5_derrota_r4_renda_acima_do_teto_mas_miseravel_obrigatorio_conceder():
    # MESMA renda do teste anterior (R$ 500 > R$ 353), mas grau alto → miserável.
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)],
            escore_miserabilidade=0.9)
    assert miseravel(x.escore_miserabilidade)
    assert criterio_economico(x)             # R5 derrota R4
    assert concluir(x) == "O_CONCEDER"       # a exceção vence a regra-geral


def test_r5_escore_none_nao_derrota():
    # Não avaliado ⇒ não derrota R4 (regra de ouro: None → False).
    assert not miseravel(None)


def test_r5_respeita_limiar_customizado():
    assert miseravel(0.6, limiar=0.5)
    assert not miseravel(0.6, limiar=0.7)


# ---- art. 20, §4º — R6: vedação de acumulação (testada primeiro) -----------------

def test_r6_predicado_da_vedacao():
    assert acumula_beneficio_vedado(True)
    assert not acumula_beneficio_vedado(False)


def test_r6_acumulo_proibido_mesmo_sendo_idoso_pobre():
    x = req(idade=70, acumula_beneficio=True)
    assert concluir(x) == "F_CONCEDER"


def test_r6_tem_prioridade_sobre_tudo():
    # idoso, pobre, miserável — mas acumula → ainda proibido.
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)],
            acumula_beneficio=True, escore_miserabilidade=0.9)
    assert concluir(x) == "F_CONCEDER"


# ---- grupo familiar muda a elegibilidade -----------------------------------------

def test_inclusao_de_membro_muda_per_capita_e_elegibilidade():
    """Incluir um membro sem renda baixa o per capita e vira a conclusão.

    Renda total R$ 500,00 (50 000 centavos). Sozinho, per capita = R$ 500 > R$ 353 → R4
    barra. Incluindo o cônjuge sem renda, per capita = R$ 250 <= R$ 353 → R3 satisfaz.
    """
    sozinho = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)])
    assert renda_per_capita(sozinho) == 50_000
    assert concluir(sozinho) == INDETERMINADO  # acima do teto, sem grau → valoração humana

    com_conjuge = replace(
        sozinho,
        familia=[
            MembroFamilia(renda_centavos=50_000, papel="requerente"),
            MembroFamilia(renda_centavos=0, papel="cônjuge ou companheiro"),
        ],
    )
    assert renda_per_capita(com_conjuge) == 25_000  # R$ 250,00
    assert concluir(com_conjuge) == "O_CONCEDER"  # R3: dentro do teto


# ---- trilha de raciocínio determinístico (auditável) -----------------------------

def test_rastro_marca_r5_quando_derrota():
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=50_000)],
            escore_miserabilidade=0.9)
    trilha = rastro(x)
    assert any("R5" in linha for linha in trilha)
    assert trilha[-1].endswith("O_CONCEDER")


def test_rastro_r6_para_cedo():
    x = req(idade=70, acumula_beneficio=True)
    trilha = rastro(x)
    assert len(trilha) == 1
    assert trilha[0].startswith("R6")
    assert trilha[0].endswith("F_CONCEDER")


def test_rastro_cita_dispositivos_legais():
    x = req(idade=70, familia=[MembroFamilia(renda_centavos=30_000)])
    trilha = rastro(x)
    assert any("art. 20" in linha for linha in trilha)
