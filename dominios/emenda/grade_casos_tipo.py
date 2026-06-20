"""Grade KISS de perfis familiares — o "banco de provas" da alteração da norma.

Uma dúzia de casos-tipo paramétricos (sem microdados sensíveis) que cobrem idoso e
pessoa com deficiência, faixas de renda e fontes (salário, transferência de renda,
benefício previdenciário mínimo), com e sem grau de miserabilidade. A grade serve para
percorrer as duas versões da norma e expor as transições de estado.

A grade NÃO é amostra populacional: ela demonstra o MECANISMO e a DIREÇÃO do efeito
(quem deixa de ter elegibilidade presumida quando a transferência de renda passa a
compor a renda), não a magnitude real na população — esta exige a PNADc (ver o guardrail
de `diff_impacto.estimar_impacto_orcamentario`). Salário mínimo de referência: 2026.
"""

from __future__ import annotations

from dominios.emenda.exclusoes_renda import (
    PREVIDENCIARIO_MINIMO,
    SALARIO,
    TRANSFERENCIA_RENDA,
    MembroPerfil,
    PerfilFamiliar,
    RendaCategorizada,
)

SM_2026_CENTAVOS = 162_200  # R$ 1.622,00 (Portaria Interministerial MPS/MF). ¼ SM = R$ 405,50.


# Construímos os membros nomeando a categoria pela própria constante (legibilidade).
def _membro(papel: str, *parcelas: RendaCategorizada) -> MembroPerfil:
    return MembroPerfil(papel=papel, rendas=parcelas)


def _r(categoria: str, centavos: int) -> RendaCategorizada:
    return RendaCategorizada(categoria=categoria, centavos=centavos)


CONJUGE = "cônjuge ou companheiro"
FILHO = "filho ou enteado solteiro"

GRADE: tuple[PerfilFamiliar, ...] = (
    PerfilFamiliar(
        id="A_idoso_so_bf",
        descricao="Pessoa idosa sozinha, sustentada por transferência de renda (R$ 600).",
        membros=(_membro("requerente", _r(TRANSFERENCIA_RENDA, 60_000)),),
        idade=68,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="B_idoso_conjuge_salario_bf",
        descricao="Casal idoso: salário R$ 400 do requerente e transferência R$ 600 do cônjuge.",
        membros=(
            _membro("requerente", _r(SALARIO, 40_000)),
            _membro(CONJUGE, _r(TRANSFERENCIA_RENDA, 60_000)),
        ),
        idade=70,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="C_idoso_familia4_bf_baixa",
        descricao="Pessoa idosa em família de quatro, transferência de renda diluída (R$ 400).",
        membros=(
            _membro("requerente", _r(TRANSFERENCIA_RENDA, 40_000)),
            _membro(CONJUGE),
            _membro(FILHO),
            _membro(FILHO),
        ),
        idade=67,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="D_pcd_impedimento_bf",
        descricao="Pessoa com deficiência com impedimento de longo prazo, transferência de R$ 500.",
        membros=(_membro("requerente", _r(TRANSFERENCIA_RENDA, 50_000)),),
        idade=40,
        deficiente=True,
        impedimento_meses=30,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="E_pcd_sem_impedimento_longo",
        descricao="Pessoa com deficiência sem impedimento de longo prazo (impedimento de 6 meses).",
        membros=(_membro("requerente", _r(TRANSFERENCIA_RENDA, 50_000)),),
        idade=40,
        deficiente=True,
        impedimento_meses=6,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="F_idoso_salario_alto",
        descricao="Pessoa idosa com salário de R$ 1.000, miserabilidade afastada.",
        membros=(_membro("requerente", _r(SALARIO, 100_000)),),
        idade=68,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=0.2,
    ),
    PerfilFamiliar(
        id="G_idoso_bf_miserabilidade_afastada",
        descricao="Pessoa idosa só com transferência (R$ 600), grau de miserabilidade baixo.",
        membros=(_membro("requerente", _r(TRANSFERENCIA_RENDA, 60_000)),),
        idade=68,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=0.3,
    ),
    PerfilFamiliar(
        id="H_idoso_bf_miserabilidade_comprovada",
        descricao="Pessoa idosa só com transferência (R$ 600), miserabilidade comprovada.",
        membros=(_membro("requerente", _r(TRANSFERENCIA_RENDA, 60_000)),),
        idade=68,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=0.8,
    ),
    PerfilFamiliar(
        id="I_idoso_previdenciario_minimo",
        descricao="Pessoa idosa cujo cônjuge recebe benefício previdenciário de um salário mínimo.",
        membros=(
            _membro("requerente"),
            _membro(CONJUGE, _r(PREVIDENCIARIO_MINIMO, 162_200)),
        ),
        idade=69,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
    PerfilFamiliar(
        id="J_idoso_familia3_salario_bf",
        descricao="Pessoa idosa em família de três: salário (R$ 500) e transferência (R$ 600).",
        membros=(
            _membro("requerente", _r(SALARIO, 50_000)),
            _membro(CONJUGE, _r(TRANSFERENCIA_RENDA, 60_000)),
            _membro(FILHO),
        ),
        idade=66,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM_2026_CENTAVOS,
        escore_miserabilidade=None,
    ),
)
