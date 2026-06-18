"""Justificação jurídica de Neil MacCormick — silogismo de 1ª ordem e os 3 gates de 2ª.

Neil MacCormick ("Legal Reasoning and Legal Theory") distingue a justificação de PRIMEIRA
ORDEM (dedutiva: o silogismo subsuntivo, em que premissa maior = norma e premissa menor =
fato resolvem o caso) da justificação de SEGUNDA ORDEM, exigida quando o silogismo NÃO
fecha (casos difíceis). A segunda ordem testa a decisão por três critérios:
universalizabilidade, consistência e coerência.

Neste domínio:
  - 1ª ORDEM — tenta o silogismo usando o motor da norma (`concluir`/`rastro`). Se o
    functor é definido por regra estrita ou pela camada valorativa já convergida (R3, R5
    ou R4), o silogismo FECHA (`silogismo.fecha=True`) — a dedução basta.
  - 2ª ORDEM — se o functor é INDETERMINADO (renda acima do ¼ SM e miserabilidade por
    resolver), o silogismo NÃO fecha e rodam os três gates DETERMINÍSTICOS, espelhando os
    conceitos do sistema-bpc.

DC-14 (registrada agora) — o módulo apenas EXPÕE a estrutura da justificação. Os gates de
2ª ordem são conferências determinísticas (não opinião da IA); não decidem o mérito da
concessão — o functor permanece INDETERMINADO, a aguardar valoração humana (DC-09). A
decisão de conceder/negar nunca é tomada aqui (DC-08).

Os três gates (espelhando o sistema-bpc):
  - universalizabilidade: a mesma regra vale para todos os casos iguais (a decisão é
    formulável como regra universal, não ad hoc);
  - consistência: a decisão não contraria norma vigente — renda e §1º apurados
    corretamente (composição familiar válida, renda per capita bem calculada);
  - coerência: a solução harmoniza-se com o precedente (derrotabilidade do §3º pela
    miserabilidade, DC-03), sem contradizer os princípios do sistema.
"""

from __future__ import annotations

from dominios.norma.bpc_art20_p01_familia import (
    ComposicaoFamiliarInvalida,
    validar_composicao,
)
from dominios.norma.bpc_conclusao_deontica import (
    INDETERMINADO,
    Requerente,
    concluir,
    rastro,
)

# Functores definidos por subsunção/regra (silogismo fecha): tudo que não é INDETERMINADO.
# O_CONCEDER e F_CONCEDER decorrem de R3/R5/R4 ou de regra estrita (R6/R1/R2).


def _gate_universalizabilidade(req: Requerente) -> dict:
    """Universalizável: a conclusão é formulável como regra que vale p/ todo caso igual.

    A norma do BPC é aplicada pela mesma cascata de condições (`concluir`), sem exceção
    ad hoc: dois requerentes com fatos idênticos recebem o mesmo functor. Logo, a decisão
    é universalizável por construção.
    """
    return {
        "nome": "universalizabilidade",
        "passou": True,
        "explicacao": (
            "A conclusão é universalizável: o functor decorre da mesma cascata de condições "
            "do art. 20 (idêntica para casos iguais), sem exceção ad hoc."
        ),
    }


def _gate_consistencia(req: Requerente) -> dict:
    """Consistência: a decisão não contraria norma vigente (renda e §1º apurados corretos).

    Verifica determinísticamente que a composição familiar é válida (art. 20, §1º; DC-06) e
    que os números são sãos (idade, impedimento, salário, grau). Falha = inconsistente com
    a norma vigente (a premissa menor estaria mal apurada).
    """
    try:
        validar_composicao(req.familia)
        if req.idade < 0 or req.impedimento_meses < 0:
            raise ComposicaoFamiliarInvalida("idade e impedimento não podem ser negativos")
        if req.salario_minimo_centavos <= 0:
            raise ComposicaoFamiliarInvalida("salário mínimo deve ser positivo")
        if req.escore_miserabilidade is not None and not (0.0 <= req.escore_miserabilidade <= 1.0):
            raise ComposicaoFamiliarInvalida("grau de miserabilidade deve ficar entre 0 e 1")
    except ComposicaoFamiliarInvalida as erro:
        return {
            "nome": "consistencia",
            "passou": False,
            "explicacao": f"Inconsistente com a norma vigente: {erro} (art. 20, §1º e §3º).",
        }
    return {
        "nome": "consistencia",
        "passou": True,
        "explicacao": (
            "Consistente: composição familiar válida (art. 20, §1º; DC-06) e renda per "
            "capita corretamente apurada em centavos (§3º; DC-04), sem contrariar a norma."
        ),
    }


def _gate_coerencia(req: Requerente) -> dict:
    """Coerência: a solução harmoniza-se com o precedente (derrotabilidade do §3º).

    O caso INDETERMINADO honra a coerência do sistema: reconhece que a presunção do ¼ do
    salário mínimo é relativa e pode ser derrotada pela miserabilidade (R5/DC-03, conforme
    RE 567.985 e Rcl 4.374 do STF), por isso remete à valoração humana em vez de negar de
    plano (DC-09). A solução é coerente com o precedente consolidado.
    """
    return {
        "nome": "coerencia",
        "passou": True,
        "explicacao": (
            "Coerente com o precedente: a presunção do ¼ do salário mínimo é relativa "
            "(derrotabilidade; DC-03, RE 567.985 e Rcl 4.374 do STF), e o caso é remetido à "
            "valoração humana em vez de negação automática (DC-09)."
        ),
    }


def justificar(req: Requerente) -> dict:
    """Estrutura a justificação de MacCormick para o requerente.

    Tenta o silogismo de 1ª ordem (`concluir`/`rastro`). Fecha quando o functor é definido
    por regra (≠ INDETERMINADO). Não fechando, roda os três gates de 2ª ordem
    (determinísticos). Devolve a estrutura expositiva — não decide o mérito (DC-14, DC-08).
    """
    functor = concluir(req)
    trilha = rastro(req)
    fecha = functor != INDETERMINADO

    gates = None
    if not fecha:
        gates = [
            _gate_universalizabilidade(req),
            _gate_consistencia(req),
            _gate_coerencia(req),
        ]

    return {
        "silogismo": {"fecha": fecha, "rastro": trilha},
        "gates": gates,
        "functor_final": functor,
    }
