"""Camada de VALORAÇÃO (Tela 1) — liga os 4 prompts ao protocolo híbrido.

A IA INTERPRETA e devolve `Proposta(escore, justificativa, bit)`; NUNCA decide.
Quem decide é `decidir()` (função pura, sem rede). Reusa `oficina.hibrido` direto —
não cria outro protocolo de convergência.

Fluxo (pesquisa/02 §4):
  1. PROPOSITOR (IA) 5×, temp 0  → `rodar(...)`
  2. CONVERGÊNCIA (determinística) → `avaliar_convergencia` (epsilon, bits)
  3. DEÔNTICO (função pura) → `decidir(escore, limiar)`
Convergiu → luz verde + flag do deôntico. Divergiu → luz amarela → escala humana (flag=None).
"""

from __future__ import annotations

import json
from dataclasses import dataclass

from oficina.hibrido import (
    Proposta,
    Propositor,
    avaliar_convergencia,  # re-exportado p/ quem importar daqui
    decidir,
    rodar,
)

__all__ = [
    "Proposta",
    "Propositor",
    "avaliar_convergencia",
    "decidir",
    "rodar",
    "MockProposer",
    "LLMProposer",
    "valorar_eixo",
]


@dataclass
class MockProposer:
    """Propositor de teste: devolve sempre a MESMA `Proposta` fixa (sem rede).

    Implementa o Protocol `Propositor` de hibrido.py. Serve para o caminho do gate
    (testes reprodutíveis): os escores são fixados, capturados de uma rodada LLM real.
    """

    proposta: Proposta

    def propor(self, prompt: str, texto: str) -> Proposta:  # noqa: ARG002
        return self.proposta


class LLMProposer:
    """Propositor real: chama o cliente LLM e PARSEIA o JSON em `Proposta`.

    Só roda sob a flag `llm_real` (nightly), NUNCA no gate de commit. O cliente é injetado
    (não conhecemos a SDK aqui); espera-se que `cliente.responder(prompt)` devolva o texto
    da resposta do modelo (string com o JSON pedido nos templates de prompts.py).
    """

    def __init__(self, cliente) -> None:
        self.cliente = cliente

    def propor(self, prompt: str, texto: str) -> Proposta:
        corpo = prompt.format(texto=texto) if "{texto}" in prompt else prompt
        # [ENCAIXE] cliente LLM real; só sob -m llm_real. Não chamar rede no gate.
        resposta = self.cliente.responder(corpo)
        return parsear_proposta(resposta)


def parsear_proposta(resposta: str) -> Proposta:
    """Converte o JSON devolvido pelo LLM em `Proposta`.

    Os templates pedem {"escore", "bit", "justificativa"}. Se `escore` vier null
    (sem base no texto), levanta ValueError → o eixo cai em indeterminação/escala humana.
    """
    dados = json.loads(resposta)
    escore = dados.get("escore")
    if escore is None:
        raise ValueError(f"sem base no texto: {dados.get('justificativa', '')}")
    justificativa = dados.get("justificativa", "")
    if not justificativa:
        raise ValueError("proposta sem justificativa (citação literal obrigatória)")
    bit = bool(dados.get("bit", False))
    return Proposta(escore=float(escore), justificativa=justificativa, bit=bit)


def valorar_eixo(
    propositor: Propositor,
    prompt: str,
    texto: str,
    *,
    limiar: float,
    n: int = 5,
) -> dict:
    """Valora um eixo subjetivo (limitação, miserabilidade, etc.) para a Tela 1.

    Roda o propositor n× (`rodar`), avalia convergência e, se convergiu, aplica o
    deôntico `decidir(escore, limiar)`. Devolve um dict simples para a tela mostrar a luz:

      - convergiu=True  → flag=bool (True=satisfeito), luz VERDE.
      - convergiu=False → flag=None (escala humana), luz AMARELA.

    Campos: {convergiu, escore, bit, flag, motivo}.
    """
    # DC-05 — convergência exige desvio <= 0,10 (critério rigoroso do sistema).
    conv = rodar(propositor, prompt, texto, n=n, epsilon=0.10)
    if not conv.convergiu:
        return {
            "convergiu": False,
            "escore": None,
            "bit": conv.bit,
            "flag": None,  # escala humana: o jurista decide na mão
            "motivo": conv.motivo,
        }
    flag = decidir(conv.escore, limiar=limiar)
    return {
        "convergiu": True,
        "escore": conv.escore,
        "bit": conv.bit,
        "flag": flag,
        "motivo": conv.motivo,
    }
