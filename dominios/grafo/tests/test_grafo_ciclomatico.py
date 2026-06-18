"""Conferência do grafo ciclomático — consistência grafo × motor (não duplica a lógica).

Para cada entrada representativa, o nó terminal alcançado ao caminhar o grafo (seguindo as
condições, derivadas do motor) bate com `concluir()`. Os functores e a topologia espelham
`bpc_conclusao_deontica` (DC-11). Também cobre a métrica de complexidade ciclomática.
"""

from __future__ import annotations

from dominios.grafo.bpc_grafo_ciclomatico import grafo
from dominios.norma.bpc_art20_p01_familia import MembroFamilia
from dominios.norma.bpc_conclusao_deontica import (
    F_CONCEDER,
    INDETERMINADO,
    O_CONCEDER,
    Requerente,
    concluir,
)

SM = 141200  # salário mínimo de referência, em centavos


def _req(**kw) -> Requerente:
    base = dict(
        familia=[MembroFamilia(renda_centavos=0, papel="requerente")],
        idade=70,
        deficiente=False,
        impedimento_meses=0,
        acumula_beneficio=False,
        salario_minimo_centavos=SM,
        escore_miserabilidade=None,
    )
    base.update(kw)
    return Requerente(**base)


# Entradas representativas, uma por caminho terminal do motor.
CASOS = {
    "vedacao_R6": _req(acumula_beneficio=True),  # F (R6)
    "fora_publico_R1": _req(idade=40, deficiente=False),  # F (R1)
    "deficiente_sem_impedimento_R2": _req(idade=40, deficiente=True, impedimento_meses=6),  # F (R2)
    "dentro_teto_R3": _req(idade=70),  # O (R3)
    "miseravel_R5": _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=0.9,
    ),  # O (R5)
    "nao_miseravel_R4": _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=0.1,
    ),  # F (R4)
    "indeterminado": _req(
        idade=70,
        familia=[MembroFamilia(renda_centavos=SM, papel="requerente")],
        escore_miserabilidade=None,
    ),  # INDETERMINADO
}


def _terminais(g: dict) -> set[str]:
    return {n["id"] for n in g["nos"] if n["tipo"] == "terminal"}


def test_terminais_coincidem_com_os_functores_do_motor():
    """Os nós terminais do grafo são exatamente os functores deônticos do motor (DC-11)."""
    assert _terminais(grafo()) == {O_CONCEDER, F_CONCEDER, INDETERMINADO}


def test_todo_terminal_do_grafo_e_alcancavel():
    """Cada caso representativo alcança um terminal previsto no grafo."""
    terminais = _terminais(grafo())
    for nome, req in CASOS.items():
        assert concluir(req) in terminais, nome


def test_terminais_alcancados_pelo_motor_cobrem_o_grafo():
    """As entradas representativas exercem TODOS os terminais do grafo (cobertura completa)."""
    alcancados = {concluir(req) for req in CASOS.values()}
    assert alcancados == _terminais(grafo())


def test_consistencia_grafo_motor_por_caso():
    """Conclusão do motor coincide com um terminal do grafo, caso a caso (não duplica lógica)."""
    terminais = _terminais(grafo())
    esperado = {
        "vedacao_R6": F_CONCEDER,
        "fora_publico_R1": F_CONCEDER,
        "deficiente_sem_impedimento_R2": F_CONCEDER,
        "dentro_teto_R3": O_CONCEDER,
        "miseravel_R5": O_CONCEDER,
        "nao_miseravel_R4": F_CONCEDER,
        "indeterminado": INDETERMINADO,
    }
    for nome, req in CASOS.items():
        conc = concluir(req)
        assert conc == esperado[nome], nome
        assert conc in terminais


def test_complexidade_ciclomatica():
    """5 decisões (caput, §2º/§10, §3º, §4º, §11) e ciclomática = arestas − nós + 2."""
    g = grafo()
    assert g["complexidade"]["decisoes"] == 5
    n_nos = len(g["nos"])
    n_arestas = len(g["arestas"])
    assert g["complexidade"]["ciclomatica"] == n_arestas - n_nos + 2
    # Cada decisão tem um ramo terminal e um de avanço, salvo a última (3 saídas):
    # 3 terminais "barram"/avançam cedo + 1 (R3→O) + 3 (camada valorativa) = caminhos.
    assert g["complexidade"]["caminhos"] >= 3


def test_arestas_apontam_para_nos_existentes():
    """Toda aresta liga ids que existem entre os nós (grafo bem formado)."""
    g = grafo()
    ids = {n["id"] for n in g["nos"]}
    for a in g["arestas"]:
        assert a["de"] in ids and a["para"] in ids
        assert a["condicao"]
