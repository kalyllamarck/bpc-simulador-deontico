"""Grafo de fluxo de controle do art. 20 da LOAS — complexidade ciclomática da norma.

Este domínio apenas EXPÕE a estrutura de decisão da norma: deriva o grafo da própria
ordem de `concluir()` (motor da norma) e mede a complexidade ciclomática (McCabe). Não
decide nada — quem decide o caso continua sendo o motor determinístico (DC-08).

A leitura jurídica da complexidade ciclomática: cada nó de decisão é um ponto em que a
norma bifurca (uma condição do art. 20 a ser testada). A complexidade ciclomática conta
quantos caminhos lógicos independentes a norma admite — uma medida da densidade
condicional do dispositivo, útil para auditar a fidelidade da formalização à lei.

DC-11 (registrada agora) — a topologia do grafo ESPELHA a cascata de `concluir()` e seus
nós terminais coincidem com os functores do motor (`O_CONCEDER`, `F_CONCEDER`,
`INDETERMINADO_VALORACAO_HUMANA`). O grafo não reimplementa a lógica: a consistência
grafo×motor é provada por conferência determinística, alimentando o motor com entradas
representativas e verificando que o nó terminal alcançado bate com a conclusão do motor.

Ordem espelhada (idêntica a `concluir`):
  R6 (§4º) vedação → R1 (caput) público → R2 (§2º+§10) impedimento →
  R3 (§3º) ¼ SM → camada valorativa (§11): R5 derrota R4 / R4 barra / INDETERMINADO.
"""

from __future__ import annotations

from dominios.norma.bpc_conclusao_deontica import (
    F_CONCEDER,
    INDETERMINADO,
    O_CONCEDER,
)


def grafo() -> dict:
    """Devolve o grafo de fluxo de controle da norma e sua complexidade ciclomática.

    Estrutura espelha a ordem de `concluir()` (DC-11). Os nós de decisão são as condições
    do art. 20; os nós terminais são os functores deônticos do motor.
    """
    nos = [
        # Nós de decisão — uma condição do art. 20 a cada bifurcação (ordem de `concluir`).
        {
            "id": "R6",
            "rotulo": "Acumula benefício vedado?",
            "dispositivo": "art. 20, §4º",
            "tipo": "decisao",
        },
        {
            "id": "R1",
            "rotulo": "Integra o público (idoso 65+ ou deficiente)?",
            "dispositivo": "art. 20, caput",
            "tipo": "decisao",
        },
        {
            "id": "R2",
            "rotulo": "Impedimento de longo prazo (≥ 2 anos)?",
            "dispositivo": "art. 20, §2º + §10",
            "tipo": "decisao",
        },
        {
            "id": "R3",
            "rotulo": "Renda per capita dentro do ¼ do salário mínimo?",
            "dispositivo": "art. 20, §3º",
            "tipo": "decisao",
        },
        {
            "id": "R5R4",
            "rotulo": "Camada valorativa: miserabilidade comprovada (§11)?",
            "dispositivo": "art. 20, §11",
            "tipo": "decisao",
        },
        # Nós terminais — coincidem com os functores do motor (DC-10, DC-11).
        {
            "id": O_CONCEDER,
            "rotulo": "Obrigatório conceder",
            "dispositivo": "art. 20 (R7)",
            "tipo": "terminal",
        },
        {
            "id": F_CONCEDER,
            "rotulo": "Proibido conceder",
            "dispositivo": "art. 20",
            "tipo": "terminal",
        },
        {
            "id": INDETERMINADO,
            "rotulo": "Indeterminado — exige valoração humana",
            "dispositivo": "art. 20, §11",
            "tipo": "terminal",
        },
    ]

    arestas = [
        # R6 — vedação de acumulação (testada primeiro; vedação absoluta).
        {"de": "R6", "para": F_CONCEDER, "condicao": "acumula benefício vedado"},
        {"de": "R6", "para": "R1", "condicao": "não acumula"},
        # R1 — público (idoso ou deficiente).
        {"de": "R1", "para": F_CONCEDER, "condicao": "não integra o público"},
        {"de": "R1", "para": "R2", "condicao": "integra o público"},
        # R2 — impedimento de longo prazo (para deficiente).
        {"de": "R2", "para": F_CONCEDER, "condicao": "deficiente sem impedimento de longo prazo"},
        {"de": "R2", "para": "R3", "condicao": "impedimento de longo prazo satisfeito"},
        # R3 — critério econômico objetivo (¼ SM).
        {"de": "R3", "para": O_CONCEDER, "condicao": "renda dentro do ¼ do salário mínimo"},
        {"de": "R3", "para": "R5R4", "condicao": "renda acima do ¼ do salário mínimo"},
        # Camada valorativa (§11): R5 derrota R4, R4 barra, ou INDETERMINADO.
        {
            "de": "R5R4",
            "para": O_CONCEDER,
            "condicao": "R5: miserabilidade comprovada derrota a regra-geral",
        },
        {
            "de": "R5R4",
            "para": F_CONCEDER,
            "condicao": "R4: miserabilidade afastada barra a concessão",
        },
        {
            "de": "R5R4",
            "para": INDETERMINADO,
            "condicao": "miserabilidade por resolver (grau ausente ou sem convergência)",
        },
    ]

    decisoes = sum(1 for n in nos if n["tipo"] == "decisao")
    # Complexidade ciclomática (McCabe): E − N + 2 para um grafo conexo. Equivale, num
    # grafo de decisão, ao número de pontos de decisão + 1 (caminhos independentes).
    n_nos = len(nos)
    n_arestas = len(arestas)
    ciclomatica = n_arestas - n_nos + 2
    # Caminhos da entrada (R6) a um terminal: cada saída de decisão que leva a terminal é
    # um caminho; aqui cada decisão tem exatamente um ramo terminal e um ramo de avanço,
    # logo o número de caminhos completos coincide com o de ramos terminais.
    caminhos = sum(1 for a in arestas if a["para"] in {O_CONCEDER, F_CONCEDER, INDETERMINADO})

    return {
        "nos": nos,
        "arestas": arestas,
        "complexidade": {
            "decisoes": decisoes,
            "caminhos": caminhos,
            "ciclomatica": ciclomatica,
        },
        "explicacao": (
            f"A formalização do art. 20 da LOAS tem {decisoes} pontos de decisão "
            f"(as condições do caput, §2º/§10, §3º, §4º e §11) e complexidade ciclomática "
            f"{ciclomatica} (McCabe: arestas − nós + 2), com {caminhos} caminhos lógicos "
            "independentes da entrada a um functor deôntico. A medida apenas expõe a "
            "densidade condicional do dispositivo; não mede o acerto da decisão, que "
            "permanece com o motor determinístico (DC-08, DC-11)."
        ),
    }
