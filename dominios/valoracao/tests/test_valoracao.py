"""Testes da camada de valoração (Tela 1) — com MockProposer, sem rede.

Cobre o protocolo herdado de oficina/hibrido.py:
  - 5 leituras IGUAIS → convergiu → `decidir()` resolve → luz VERDE.
  - escores espalhados (amplitude ≥ epsilon) → divergiu → escala humana → luz AMARELA (flag=None).
Também checa o esboço LLMProposer (parse de JSON em Proposta) sem chamar rede.
"""

from __future__ import annotations

import pytest

from dominios.valoracao.prompts import (
    PROMPT_LIMITACAO,
    PROMPT_MISERABILIDADE,
    PROMPT_PRECARIEDADE,
    PROMPT_VULNERABILIDADE,
)
from dominios.valoracao.valoracao import (
    LLMProposer,
    MockProposer,
    Proposta,
    parsear_proposta,
    valorar_eixo,
)

# Escore alto, grave (bit True): laudo de limitação severa.
PROP_GRAVE = Proposta(escore=0.9, justificativa="incapaz para o trabalho habitual", bit=True)
# Escore baixo, leve (bit False).
PROP_LEVE = Proposta(escore=0.2, justificativa="trabalha com adaptação", bit=False)


# ---------------------------------------------------------------- convergência → VERDE


def test_convergiu_acima_do_limiar_luz_verde_satisfeito():
    """5 leituras iguais e graves → convergiu, escore ≥ limiar → flag True (verde)."""
    res = valorar_eixo(MockProposer(PROP_GRAVE), PROMPT_LIMITACAO, "qualquer texto", limiar=0.7)
    assert res["convergiu"] is True
    assert res["flag"] is True
    assert res["bit"] is True
    assert res["escore"] == pytest.approx(0.9)
    assert res["motivo"] == "convergiu"


def test_convergiu_abaixo_do_limiar_luz_verde_nao_satisfeito():
    """5 leituras iguais e leves → convergiu, mas escore < limiar → flag False (decide barrar)."""
    res = valorar_eixo(MockProposer(PROP_LEVE), PROMPT_MISERABILIDADE, "texto", limiar=0.7)
    assert res["convergiu"] is True
    assert res["flag"] is False  # decidir() barrou; ainda é VERDE (concordaram)
    assert res["escore"] == pytest.approx(0.2)


# ------------------------------------------------------------ divergência → AMARELA


class _PropositorEspalhado:
    """Devolve escores espalhados a cada chamada (amplitude ≥ epsilon=0,15)."""

    def __init__(self) -> None:
        self._escores = iter([0.1, 0.4, 0.6, 0.9, 0.3])

    def propor(self, prompt: str, texto: str) -> Proposta:  # noqa: ARG002
        e = next(self._escores)
        return Proposta(escore=e, justificativa="frase qualquer", bit=e >= 0.7)


def test_divergiu_escala_humana_luz_amarela():
    """Escores espalhados (amplitude 0,8 ≥ epsilon) → não convergiu → flag=None (humano)."""
    res = valorar_eixo(_PropositorEspalhado(), PROMPT_VULNERABILIDADE, "texto", limiar=0.7, n=5)
    assert res["convergiu"] is False
    assert res["flag"] is None  # escala humana: o jurista decide na mão
    assert res["escore"] is None
    assert "divergem" in res["motivo"]


def test_bits_divergem_tambem_cai_em_humano():
    """Escores próximos mas bits divididos 3x2 (< 80%) → não convergiu → escala humana."""

    class _BitsDivididos:
        def __init__(self) -> None:
            # escores apertados (amplitude 0,02 < epsilon) mas bits alternam
            self._it = iter([(0.70, True), (0.69, False), (0.71, True), (0.68, False), (0.70, True)])

        def propor(self, prompt: str, texto: str) -> Proposta:  # noqa: ARG002
            e, b = next(self._it)
            return Proposta(escore=e, justificativa="x", bit=b)

    res = valorar_eixo(_BitsDivididos(), PROMPT_PRECARIEDADE, "texto", limiar=0.6, n=5)
    assert res["convergiu"] is False
    assert res["flag"] is None
    assert "bits" in res["motivo"]


# ---------------------------------------------------------------- LLMProposer (parse, sem rede)


def test_parsear_proposta_json_valido():
    bruto = '{"escore": 0.8, "bit": true, "justificativa": "impede trabalho habitual"}'
    p = parsear_proposta(bruto)
    assert p == Proposta(escore=0.8, justificativa="impede trabalho habitual", bit=True)


def test_parsear_proposta_escore_null_vira_erro():
    """escore null = sem base no texto → ValueError (eixo cai em escala humana)."""
    with pytest.raises(ValueError, match="sem base"):
        parsear_proposta('{"escore": null, "justificativa": "sem base no texto"}')


def test_parsear_proposta_sem_justificativa_vira_erro():
    with pytest.raises(ValueError, match="justificativa"):
        parsear_proposta('{"escore": 0.8, "bit": true, "justificativa": ""}')


def test_llmproposer_usa_cliente_injetado_sem_rede():
    """LLMProposer parseia a resposta do cliente injetado — sem tocar rede."""

    class _ClienteFake:
        def responder(self, corpo: str) -> str:  # noqa: ARG002
            return '{"escore": 0.9, "bit": true, "justificativa": "incapaz total"}'

    p = LLMProposer(_ClienteFake()).propor(PROMPT_LIMITACAO, "texto do laudo")
    assert p.escore == pytest.approx(0.9)
    assert p.bit is True
