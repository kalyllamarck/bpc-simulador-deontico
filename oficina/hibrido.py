"""Camada híbrida — IA INTERPRETA, lógica DEÔNTICA DECIDE.

Fundamento (tese do Kalyl, artigo "Conversão de norma sustentável em linguística computacional";
padrão do sistema BPC): regra qualitativa vira determinística acoplando duas camadas:

    (1) PROPOSITOR (IA)  — interpreta o sentido e devolve um sinal ESTRUTURADO
                           (escore + justificativa). NUNCA decide. Roda N vezes a temperatura 0.
    (2) CONVERGÊNCIA     — aceita o sinal só se as N execuções concordam (desvio < epsilon e os
                           bits de gate coincidem ≥ limiar). Senão: indeterminação → escala humana.
    (3) DEÔNTICO         — função PURA: recebe o escore convergido + o limiar e devolve a flag.
                           É o ÚNICO que decide passa/falha.

Por isso o gate é reprodutível apesar da IA: o `decidir()` é JSON→bool, sem rede. Nos testes o
propositor é mockado; o LLM real só roda sob a flag `llm_real` (nightly).
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Proposta:
    """Sinal estruturado devolvido pelo propositor numa execução."""

    escore: float  # 0.0–1.0: grau em que a propriedade qualitativa se verifica
    justificativa: str  # obrigatória; registrada ANTES de qualquer cálculo
    bit: bool  # leitura booleana do propositor (ex.: "é poético?"), usada na convergência


class Propositor(Protocol):
    """Quem interpreta o sentido. LLMProposer (real) e MockProposer (testes) implementam isto."""

    def propor(self, prompt: str, texto: str) -> Proposta: ...


@dataclass(frozen=True)
class Convergencia:
    convergiu: bool
    escore: float  # mediana dos escores quando convergiu (NaN se não)
    bit: bool  # bit majoritário
    motivo: str  # explicação (p/ a mensagem do Finding)


def avaliar_convergencia(
    propostas: list[Proposta],
    *,
    epsilon: float = 0.15,
    limiar_bits: float = 0.80,
) -> Convergencia:
    """Determinístico: dado o conjunto de execuções, decide se houve convergência.

    Critérios (do artigo): desvio (max-min) dos escores < epsilon E concordância dos bits ≥ limiar.
    Convergiu → mediana dos escores e bit majoritário. Senão → indeterminação.
    """
    if not propostas:
        return Convergencia(False, float("nan"), False, "sem execuções do propositor")

    escores = [p.escore for p in propostas]
    desvio = max(escores) - min(escores)
    n_true = sum(1 for p in propostas if p.bit)
    frac_majoritaria = max(n_true, len(propostas) - n_true) / len(propostas)
    bit_majoritario = n_true * 2 >= len(propostas)

    if desvio >= epsilon:
        return Convergencia(
            False,
            float("nan"),
            bit_majoritario,
            f"escores divergem (amplitude {desvio:.2f} ≥ epsilon {epsilon})",
        )
    if frac_majoritaria < limiar_bits:
        return Convergencia(
            False,
            float("nan"),
            bit_majoritario,
            f"bits divergem (concordância {frac_majoritaria:.0%} < {limiar_bits:.0%})",
        )
    return Convergencia(True, statistics.median(escores), bit_majoritario, "convergiu")


def rodar(
    propositor: Propositor,
    prompt: str,
    texto: str,
    *,
    n: int = 5,
    epsilon: float = 0.15,
    limiar_bits: float = 0.80,
) -> Convergencia:
    """Executa o propositor n vezes (temp 0) e avalia convergência. Sem rede no caminho do gate
    quando `propositor` é o MockProposer."""
    propostas = [propositor.propor(prompt, texto) for _ in range(n)]
    return avaliar_convergencia(propostas, epsilon=epsilon, limiar_bits=limiar_bits)


def decidir(escore: float, *, limiar: float) -> bool:
    """Camada DEÔNTICA — função pura. True = propriedade satisfeita (passa); False = barra.

    É o ÚNICO ponto que decide passa/falha numa regra qualitativa. Recebe só números; não conhece
    IA, não tem rede. `corte fixo simples` (decisão v1; fórmula de peso à la Alexy fica p/ v2)."""
    return escore >= limiar
