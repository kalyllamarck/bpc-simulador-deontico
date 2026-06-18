"""Teste 5/5 — liga fixtures simuladas à norma deôntica BPC.

SENTENÇAS SIMULADAS: fictícias, criadas para exercitar o simulador deôntico.
NÃO são decisões reais. Substituir pelas sentenças reais quando disponíveis.

Gate determinístico: pytest decide, não a IA.
Exige 5/5 acertos entre resultado_real (gabarito) e concluir() (norma deôntica).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from dominios.norma.bpc_art20_p01_familia import MembroFamilia
from dominios.norma.bpc_conclusao_deontica import Requerente, concluir


def _reais_para_centavos(reais: float) -> int:
    """Converte reais (gabarito) em centavos inteiros (DC-04). Arredonda ao centavo."""
    return round(reais * 100)


FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"
GABARITOS = sorted(FIXTURES_DIR.glob("*-gabarito.json"))


def _carregar(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _montar_familia(renda_total_reais: float, n_familia: int) -> list[MembroFamilia]:
    """Monta um grupo familiar com `n_familia` membros e a renda total dada.

    O gabarito traz só a renda total e o número de membros; concentra-se a renda no
    requerente e atribui-se renda zero aos demais. A soma / nº de membros reproduz a
    mesma renda per capita do gabarito, sem alterar a fixture.
    """
    total_centavos = _reais_para_centavos(renda_total_reais)
    membros = [MembroFamilia(renda_centavos=total_centavos, papel="requerente")]
    membros += [
        MembroFamilia(renda_centavos=0, papel="filho ou enteado solteiro")
        for _ in range(n_familia - 1)
    ]
    return membros


def _montar_requerente(gabarito: dict) -> Requerente:
    obj = gabarito["objetivos"]
    return Requerente(
        familia=_montar_familia(obj["renda_total"], obj["n_familia"]),
        idade=obj["idade"],
        deficiente=obj["deficiente"],
        impedimento_meses=obj["impedimento_meses"],
        acumula_beneficio=obj["acumula_beneficio"],
        salario_minimo_centavos=_reais_para_centavos(obj["salario_minimo"]),
        escore_miserabilidade=gabarito.get("escore_miserabilidade"),
    )


def _decidir_legivel(requerente: Requerente) -> str:
    """Converte saída deôntica em CONCEDIDO / NEGADO."""
    raw = concluir(requerente)
    return "CONCEDIDO" if raw == "O_CONCEDER" else "NEGADO"


# ---------------------------------------------------------------------------
# Parâmetros dos 5 casos
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("gabarito_path", GABARITOS, ids=[p.stem for p in GABARITOS])
def test_acerto_individual(gabarito_path: Path) -> None:
    """Cada fixture deve bater com o resultado_real do gabarito."""
    gabarito = _carregar(gabarito_path)
    assert gabarito.get("simulada") is True, (
        f"{gabarito_path.name}: campo 'simulada' deve ser true (sentença fictícia)"
    )

    requerente = _montar_requerente(gabarito)
    resultado = _decidir_legivel(requerente)
    esperado = gabarito["resultado_real"]

    assert resultado == esperado, (
        f"[{gabarito_path.stem}] esperado={esperado}, obtido={resultado} "
        f"(regra_chave={gabarito.get('regra_chave')}, nota={gabarito.get('nota')})"
    )


def test_cinco_de_cinco() -> None:
    """Gate explícito: TODOS os 5 gabaritos devem acertar."""
    assert len(GABARITOS) == 5, (
        f"Esperado 5 gabaritos, encontrado {len(GABARITOS)}. "
        "Verifique os arquivos em dominios/valoracao/fixtures/."
    )
    erros = []
    for path in GABARITOS:
        gabarito = _carregar(path)
        requerente = _montar_requerente(gabarito)
        resultado = _decidir_legivel(requerente)
        esperado = gabarito["resultado_real"]
        if resultado != esperado:
            erros.append(f"{path.stem}: esperado={esperado}, obtido={resultado}")

    assert not erros, "Falhou(am) fixture(s):\n" + "\n".join(erros)


# ---------------------------------------------------------------------------
# Teste da tese: R5 salva o caso 004 — zerando o escore, vira NEGADO
# ---------------------------------------------------------------------------


def test_tese_r5_derrota_r4() -> None:
    """Prova que é R5 (miserabilidade) que concede o caso 004.

    Com escore_miserabilidade=0.85 → CONCEDIDO (R5 derrota R4).
    Zerando o escore (None) → NEGADO (R4 prevalece).
    Isso mostra que a miserabilidade, e não outro fator, é determinante.
    """
    gabarito_path = FIXTURES_DIR / "004-gabarito.json"
    gabarito = _carregar(gabarito_path)

    # Estado original: R5 ativo
    requerente_original = _montar_requerente(gabarito)
    assert _decidir_legivel(requerente_original) == "CONCEDIDO", (
        "004 com escore_miserabilidade=0.85 deveria ser CONCEDIDO (R5 ativo)"
    )

    # Contra-factual: zeramos o escore — R5 não dispara
    from dataclasses import replace

    requerente_sem_escore = replace(requerente_original, escore_miserabilidade=None)
    assert _decidir_legivel(requerente_sem_escore) == "NEGADO", (
        "004 sem escore_miserabilidade deveria ser NEGADO (só R4 ativa, renda per capita > ¼ SM)"
    )
