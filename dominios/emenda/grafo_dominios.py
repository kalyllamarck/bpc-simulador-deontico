"""Domínios afetados — alcançabilidade a partir da variável que a alteração toca.

Alterar o cálculo da renda per capita não fica contido na regra de renda: o efeito se
propaga pelas regras que dela dependem, pela camada valorativa, pela conclusão e, daí,
pelos domínios que AUTORIZAM o pagamento e pressionam o equilíbrio da seguridade. Este
módulo modela essa cadeia como um grafo de dependência simples e responde, por busca em
largura, quais domínios uma alteração alcança.

O grafo é declarado à mão (mapa conceitual auditável), não inferido — cada aresta diz
"o nó de origem condiciona o nó de destino". Mantém-se KISS: dicionário + BFS.
"""

from __future__ import annotations

from collections import deque

# Cada nó: rótulo jurídico + o domínio do simulador a que corresponde + para onde aponta.
GRAFO: dict[str, dict] = {
    "calculo_renda_per_capita": {
        "rotulo": "cálculo da renda per capita (art. 20, §3º; Decreto 6.214/2007, art. 4º)",
        "dominio": "norma",
        "aponta": ["R3_criterio_economico", "R4_regra_geral", "R5_miserabilidade"],
    },
    "R3_criterio_economico": {
        "rotulo": "R3 — renda dentro do teto de ¼ do salário mínimo (art. 20, §3º)",
        "dominio": "norma",
        "aponta": ["R7_conclusao"],
    },
    "R4_regra_geral": {
        "rotulo": "R4 — regra-geral que barra a renda acima do teto (art. 20, §3º)",
        "dominio": "norma",
        "aponta": ["R7_conclusao", "camada_valorativa"],
    },
    "R5_miserabilidade": {
        "rotulo": "R5 — miserabilidade comprovada derrota a regra-geral (art. 20, §11)",
        "dominio": "norma",
        "aponta": ["camada_valorativa", "R7_conclusao"],
    },
    "camada_valorativa": {
        "rotulo": "camada valorativa — aferição da miserabilidade por estudo social (art. 20, §11)",
        "dominio": "valoracao",
        "aponta": ["R7_conclusao", "demanda_estudo_social"],
    },
    "demanda_estudo_social": {
        "rotulo": "demanda por estudo social (mais casos em indeterminação exigem perícia social)",
        "dominio": "valoracao",
        "aponta": [],
    },
    "R7_conclusao": {
        "rotulo": "R7 — conclusão deôntica: conceder, vedar ou indeterminar (art. 20)",
        "dominio": "norma",
        "aponta": ["autorizacao_pagamento_inss", "contencioso_judicial"],
    },
    "autorizacao_pagamento_inss": {
        "rotulo": "autorização administrativa do pagamento do BPC (INSS)",
        "dominio": "operacional",
        "aponta": ["estoque_beneficiarios", "gasto_orcamentario"],
    },
    "contencioso_judicial": {
        "rotulo": "contencioso judicial (revisão das negativas; o decreto está sub judice)",
        "dominio": "operacional",
        "aponta": [],
    },
    "estoque_beneficiarios": {
        "rotulo": "estoque de beneficiários do BPC",
        "dominio": "impacto",
        "aponta": ["gasto_orcamentario"],
    },
    "gasto_orcamentario": {
        "rotulo": "gasto orçamentário do BPC",
        "dominio": "impacto",
        "aponta": ["pressao_art201"],
    },
    "pressao_art201": {
        "rotulo": "pressão sobre o equilíbrio da seguridade (elo argumentativo com o art. 201)",
        "dominio": "impacto",
        "aponta": ["custeio_art195"],
    },
    "custeio_art195": {
        "rotulo": "contrapartida de custeio da seguridade (art. 195, §5º)",
        "dominio": "impacto",
        "aponta": [],
    },
}

# Variável que o Decreto 12.534/2025 toca (raiz da propagação).
RAIZ_DECRETO_12534 = "calculo_renda_per_capita"


def dominios_afetados(no_inicial: str = RAIZ_DECRETO_12534) -> dict:
    """Busca em largura a partir do nó tocado; devolve os nós alcançados e os domínios.

    Retorno: {"nos": [ids em ordem de descoberta], "dominios": [domínios distintos],
    "rotulos": [rótulos jurídicos dos nós alcançados]}.
    """
    if no_inicial not in GRAFO:
        raise KeyError(f"nó desconhecido: {no_inicial!r}. Use um de {sorted(GRAFO)}.")
    vistos: list[str] = []
    fila: deque[str] = deque([no_inicial])
    marcados = {no_inicial}
    while fila:
        no = fila.popleft()
        vistos.append(no)
        for prox in GRAFO[no]["aponta"]:
            if prox not in marcados:
                marcados.add(prox)
                fila.append(prox)
    dominios: list[str] = []
    for no in vistos:
        d = GRAFO[no]["dominio"]
        if d not in dominios:
            dominios.append(d)
    return {
        "nos": vistos,
        "dominios": dominios,
        "rotulos": [GRAFO[no]["rotulo"] for no in vistos],
    }
