"""Conclusão deôntica do BPC — síntese do art. 20 da LOAS (Lei 8.742/93).

Esta é a camada que SELA a lógica. A norma do BPC é uma lógica deôntica FECHADA por duas
camadas: para qualquer caso, o sistema chega a um estado definido, tal como o aplicador da
norma chegaria, sem buraco, sem travar e sem negação silenciosa (DC-09, DC-10).

Estados deônticos fechados (functores):
  - "O_CONCEDER" — Obrigatório conceder (o Estado tem o dever).
  - "F_CONCEDER" — Proibido conceder (vedado por regra estrita ou pela regra-geral do
                   ¼ do salário mínimo não derrotada).
  - "INDETERMINADO_VALORACAO_HUMANA" — renda acima do teto e miserabilidade ainda não
                   resolvida (grau ausente ou cinco leituras sem convergência): exige
                   valoração humana (estudo social), nunca negação automática.

Camada 1 (determinística, estrita): vedação de acumulação, público, impedimento e o
critério econômico objetivo. Resolve sozinha os casos que a lei resolve por subsunção.
Camada 2 (valorativa): só a miserabilidade. O leitor-propositor propõe o grau; a decisão
continua determinística (DC-08). Quando a camada 2 não conclui, o estado é INDETERMINADO.

A ordem dos testes codifica a prioridade das regras e nunca é invertida:
  1. vedação de acumulação (R6, §4º) — vedação absoluta, testada primeiro;
  2. público (R1, caput) — pessoa idosa ou com deficiência;
  3. impedimento de longo prazo (R2, §2º + §10);
  4. critério econômico (§3º + §11): R3 (dentro do teto) → R5 (miserabilidade derrota R4)
     → R4 (regra-geral barra) → INDETERMINADO (miserabilidade por resolver);
  5. conclusão (R7): satisfeitas todas as condições, é obrigatório conceder.
"""

from __future__ import annotations

from dataclasses import dataclass

from .bpc_art20_00caput_publico import integra_publico
from .bpc_art20_p01_familia import (
    ComposicaoFamiliarInvalida,
    MembroFamilia,
    renda_per_capita_centavos,
    validar_composicao,
)
from .bpc_art20_p02_impedimento import impedimento_longo_ok
from .bpc_art20_p03_renda import criterio_economico_objetivo
from .bpc_art20_p04_vedacao import acumula_beneficio_vedado
from .bpc_art20_p11_miserabilidade import (
    ESTADO_MISERAVEL,
    ESTADO_NAO_MISERAVEL,
    LIMIAR_MISERABILIDADE,
    avaliar_miserabilidade,
    miseravel,
)

# Estados deônticos fechados da conclusão.
O_CONCEDER = "O_CONCEDER"
F_CONCEDER = "F_CONCEDER"
INDETERMINADO = "INDETERMINADO_VALORACAO_HUMANA"

# Estado de guarda para entrada malformada (fora dos três functores deônticos): a entrada
# não é a do art. 20 e precisa de correção antes de aplicar a norma.
DADOS_INVALIDOS = "DADOS_INVALIDOS"

# Conjunto fechado de conclusões possíveis da norma (prova de totalidade nos testes).
CONCLUSOES = frozenset({O_CONCEDER, F_CONCEDER, INDETERMINADO, DADOS_INVALIDOS})


@dataclass(frozen=True)
class Requerente:
    """Os fatos do requerente e o grau valorativo de entrada.

    Tudo aqui é número ou predicado (verdadeiro/falso), exceto `escore_miserabilidade`,
    que vem da camada de valoração (o leitor-propositor propõe; None se ainda não
    avaliado ou se as cinco leituras não convergiram). Valores monetários sempre em
    centavos inteiros (DC-04).
    """

    familia: list[MembroFamilia]      # composição do grupo familiar (art. 20, §1º; DC-06)
    idade: int                        # anos completos
    deficiente: bool                  # tem deficiência atestada (art. 20, §2º)
    impedimento_meses: int            # duração do impedimento, em meses (art. 20, §10)
    acumula_beneficio: bool           # já recebe benefício incompatível (art. 20, §4º)
    salario_minimo_centavos: int      # salário mínimo de referência, em centavos

    # Resíduo valorativo: grau 0 a 1 já convergido (art. 20, §11). Não é veredito.
    # None = ainda não avaliado ou sem convergência ⇒ estado INDETERMINADO (DC-09).
    escore_miserabilidade: float | None = None


def renda_per_capita(x: Requerente) -> int:
    """Renda familiar per capita do requerente, em centavos (art. 20, §3º; DC-04)."""
    return renda_per_capita_centavos(x.familia)


def criterio_economico(x: Requerente, *, limiar: float = LIMIAR_MISERABILIDADE) -> bool:
    """Critério econômico afirmativamente satisfeito (R3 ou R5 comprovada).

    Verdadeiro quando a renda per capita fica dentro do teto de ¼ do salário mínimo (R3)
    ou quando a miserabilidade está comprovada e derrota a regra-geral (R5; DC-03). Não
    distingue o grau ausente do grau baixo — para isso, `concluir` consulta o estado da
    miserabilidade e devolve INDETERMINADO quando for o caso.
    """
    if criterio_economico_objetivo(renda_per_capita(x), x.salario_minimo_centavos):  # R3
        return True
    return miseravel(x.escore_miserabilidade, limiar=limiar)                          # R5


def concluir(x: Requerente, *, limiar: float = LIMIAR_MISERABILIDADE) -> str:
    """Conclui o functor deôntico: O_CONCEDER, F_CONCEDER ou INDETERMINADO.

    Total e fechada: pressupõe entrada válida (use `simular` para validar antes). A ordem
    dos testes codifica a prioridade das regras.
    """
    if acumula_beneficio_vedado(x.acumula_beneficio):                 # R6 — vedação
        return F_CONCEDER
    if not integra_publico(x.idade, x.deficiente):                    # R1 — público
        return F_CONCEDER
    if not impedimento_longo_ok(x.idade, x.deficiente, x.impedimento_meses):  # R2
        return F_CONCEDER
    if criterio_economico_objetivo(renda_per_capita(x), x.salario_minimo_centavos):  # R3
        return O_CONCEDER
    estado = avaliar_miserabilidade(x.escore_miserabilidade, limiar=limiar)   # camada 2
    if estado == ESTADO_MISERAVEL:                                    # R5 derrota R4
        return O_CONCEDER
    if estado == ESTADO_NAO_MISERAVEL:                                # R4 barra
        return F_CONCEDER
    return INDETERMINADO                                              # exige valoração humana


def rastro(x: Requerente, *, limiar: float = LIMIAR_MISERABILIDADE) -> list[str]:
    """Trilha de raciocínio determinístico: quais condições atuaram até a conclusão.

    Mesma ordem de `concluir`, cada linha citando a regra e o dispositivo legal.
    """
    trilha: list[str] = []
    if acumula_beneficio_vedado(x.acumula_beneficio):
        trilha.append("R6 (art. 20, §4º): acumula benefício vedado → F_CONCEDER")
        return trilha
    if not integra_publico(x.idade, x.deficiente):
        trilha.append("R1 (art. 20, caput): não é pessoa idosa nem com deficiência → F_CONCEDER")
        return trilha
    if not impedimento_longo_ok(x.idade, x.deficiente, x.impedimento_meses):
        trilha.append(
            "R2 (art. 20, §2º + §10): pessoa com deficiência sem impedimento de longo prazo → F_CONCEDER"
        )
        return trilha
    trilha.append("R1 (art. 20, caput): integra o público (pessoa idosa ou com deficiência)")
    if criterio_economico_objetivo(renda_per_capita(x), x.salario_minimo_centavos):
        trilha.append("R3 (art. 20, §3º): renda per capita dentro do ¼ do salário mínimo → critério econômico satisfeito")
        trilha.append("R7 (art. 20): satisfeitas todas as condições → O_CONCEDER")
        return trilha
    estado = avaliar_miserabilidade(x.escore_miserabilidade, limiar=limiar)
    if estado == ESTADO_MISERAVEL:
        trilha.append("R5 (art. 20, §11): miserabilidade comprovada DERROTA a regra-geral do ¼ do salário mínimo")
        trilha.append("R7 (art. 20): satisfeitas todas as condições → O_CONCEDER")
        return trilha
    if estado == ESTADO_NAO_MISERAVEL:
        trilha.append(
            "R4 (art. 20, §3º): renda per capita acima do ¼ do salário mínimo, miserabilidade afastada → F_CONCEDER"
        )
        return trilha
    trilha.append(
        "Camada valorativa (art. 20, §11): renda acima do ¼ do salário mínimo e miserabilidade "
        "por resolver (grau ausente ou sem convergência) → INDETERMINADO, exige valoração humana"
    )
    return trilha


def simular(x: Requerente, *, limiar: float = LIMIAR_MISERABILIDADE) -> dict:
    """Aplica a norma de ponta a ponta, como o aplicador faria — e NUNCA falha.

    Valida primeiro a entrada (composição do grupo familiar e sanidade dos números). Sendo
    a entrada inválida, devolve um estado de guarda DADOS_INVALIDOS com o motivo, em vez de
    travar. Sendo válida, devolve a conclusão deôntica e a trilha auditável.

    Retorno (sempre um dos estados de `CONCLUSOES`):
      {"conclusao": <estado>, "rastro": [...], "renda_per_capita_centavos": <int|None>,
       "motivo": <str|None>}
    """
    try:
        validar_composicao(x.familia)
        if x.idade < 0 or x.impedimento_meses < 0:
            raise ComposicaoFamiliarInvalida("idade e impedimento não podem ser negativos")
        if x.salario_minimo_centavos <= 0:
            raise ComposicaoFamiliarInvalida("salário mínimo deve ser positivo")
        if x.escore_miserabilidade is not None and not (0.0 <= x.escore_miserabilidade <= 1.0):
            raise ComposicaoFamiliarInvalida("grau de miserabilidade deve ficar entre 0 e 1")
    except ComposicaoFamiliarInvalida as erro:
        return {
            "conclusao": DADOS_INVALIDOS,
            "rastro": [f"Entrada inválida: {erro}"],
            "renda_per_capita_centavos": None,
            "motivo": str(erro),
        }
    return {
        "conclusao": concluir(x, limiar=limiar),
        "rastro": rastro(x, limiar=limiar),
        "renda_per_capita_centavos": renda_per_capita(x),
        "motivo": None,
    }
