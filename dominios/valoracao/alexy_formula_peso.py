"""Fórmula do peso de Alexy — EXPÕE o sopesamento, não decide (ressalva de Atienza).

Robert Alexy ("Teoria dos Direitos Fundamentais") propõe a fórmula do peso para
estruturar a ponderação entre princípios em colisão: o peso concreto de um princípio é
função da intensidade da restrição, do peso abstrato e da segurança das premissas
empíricas. Aqui a fórmula é usada apenas para ORGANIZAR o argumento de sopesamento da
miserabilidade (art. 20, §11, da LOAS, c/c art. 203, V, da Constituição).

DC-12 (registrada agora) — a fórmula do peso de Alexy é meramente EXPOSITIVA. Acolhe-se a
ressalva de Manuel Atienza: a fórmula organiza e torna transparente o argumento, mas NÃO
mede a verdade nem substitui a valoração humana. Por isso `decide=False` sempre: o
peso_total é um auxílio à fundamentação, jamais um veredito (DC-08).

Recebe os escores já convergidos pelo protocolo híbrido (DC-05); pode receber mock nos
testes. As três dimensões e seus pesos são fixados no código (escolha metodológica
declarada, não dedução da lei).
"""

from __future__ import annotations

# Pesos das dimensões da fórmula do peso (somam 1,0). Escolha metodológica declarada.
PESOS = {
    "intensidade_restricao": 0.40,  # quão grave é a restrição ao mínimo existencial
    "peso_abstrato": 0.35,          # peso abstrato do direito à assistência (art. 203, V, CF)
    "seguranca_premissa": 0.25,     # segurança das premissas empíricas (laudo, estudo social)
}

_RESSALVA = (
    "A fórmula do peso de Alexy aqui apenas EXPÕE e organiza o argumento de sopesamento; "
    "acolhida a ressalva de Atienza, ela não mede a verdade nem decide o caso — a "
    "valoração permanece humana e a decisão, determinística (DC-08, DC-12)."
)


def expor(escores: dict) -> dict:
    """Organiza o sopesamento da miserabilidade pela fórmula do peso de Alexy.

    `escores`: dict com as três dimensões em grau 0–1 (ex.: vindo da convergência híbrida).
    Calcula a parcela de cada dimensão (escore × peso) e o peso_total (0–1). Devolve a
    estrutura expositiva — NUNCA um veredito (`decide=False`; DC-12).
    """
    dimensoes = []
    peso_total = 0.0
    for nome, peso in PESOS.items():
        escore = float(escores.get(nome, 0.0))
        parcela = escore * peso
        peso_total += parcela
        dimensoes.append(
            {"nome": nome, "escore": escore, "peso": peso, "parcela": parcela}
        )

    return {
        "ancora": "alexy",
        "dimensoes": dimensoes,
        "peso_total": peso_total,
        "ressalva": _RESSALVA,
        "decide": False,  # DC-08, DC-12 — expõe, não decide.
    }
