"""Programa da norma × âmbito da norma (Friedrich Müller) — enquadramento expositivo.

Friedrich Müller (metódica estruturante do Direito) distingue, na concretização da norma,
o PROGRAMA DA NORMA (o sentido extraído do texto e dos elementos de interpretação) do
ÂMBITO DA NORMA (o recorte da realidade social que o texto regula). A norma jurídica não
está pronta no texto: resulta da tensão entre programa e âmbito diante do caso concreto.

Aqui o domínio apenas EXPÕE esse enquadramento para a miserabilidade do BPC: separa o
programa (texto e intenção do art. 20 da LOAS c/c art. 203, V, da Constituição) do âmbito
(a realidade social do caso) e descreve a tensão entre eles. É declarativo: `decide=False`
(DC-08) — não resolve a tensão, apenas a torna visível para a valoração humana.

DC-13 (registrada agora) — o par programa/âmbito de Müller é EXPOSITIVO. O módulo
estrutura o argumento de concretização (texto × realidade), sem decidir o caso. A solução
da tensão cabe ao aplicador humano; o motor determinístico decide apenas o que a lei
resolve por subsunção (DC-07).
"""

from __future__ import annotations

# Programa da norma — fixado no código a partir dos dispositivos (não é dedução do caso).
_PROGRAMA = (
    "Programa da norma (art. 20 da LOAS c/c art. 203, V, da CF): garantir 1 salário mínimo "
    "mensal à pessoa idosa ou com deficiência que comprove não possuir meios de prover a "
    "própria manutenção nem de tê-la provida por sua família. O §3º fixa a presunção do ¼ "
    "do salário mínimo e o §11 admite outros elementos para aferir a miserabilidade."
)


def enquadrar(caso: dict) -> dict:
    """Enquadra o caso pela metódica de Müller: separa programa, âmbito e a tensão.

    `caso`: dict com os fatos sociais do requerente (renda, composição familiar, despesas,
    condição de saúde, etc.). O módulo descreve o ÂMBITO (realidade) à luz do PROGRAMA
    (texto) e nomeia a tensão — sem decidir (DC-13, DC-08).
    """
    renda_pc = caso.get("renda_per_capita_centavos")
    composicao = caso.get("familia", [])
    deficiente = caso.get("deficiente", False)
    idade = caso.get("idade")

    ambito = (
        "Âmbito da norma (realidade social do caso): grupo familiar com "
        f"{len(composicao)} integrante(s)"
        + (
            f", renda per capita de R$ {renda_pc / 100:.2f}".replace(".", ",")
            if isinstance(renda_pc, int)
            else ""
        )
        + (f", requerente com {idade} ano(s)" if isinstance(idade, int) else "")
        + (", pessoa com deficiência" if deficiente else "")
        + ". Compõem o âmbito as condições concretas de subsistência que o texto pretende alcançar."
    )

    tensao = (
        "Tensão programa × âmbito: o texto presume a miserabilidade pela renda de ¼ do "
        "salário mínimo (§3º), mas a realidade do caso pode revelar privação não captada "
        "por esse limiar (§11). Resolver a tensão é tarefa da valoração humana; o módulo "
        "apenas a expõe (DC-13)."
    )

    return {
        "ancora": "muller",
        "programa": _PROGRAMA,
        "ambito": ambito,
        "tensao": tensao,
        "decide": False,  # DC-08, DC-13 — enquadra, não decide.
    }
