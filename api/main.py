"""Motor (API) que liga as telas à norma já pronta.

Dois caminhos, em PT-BR jurídico:
  - POST /simular  → monta o Requerente (art. 20) e aplica a conclusão deôntica.
  - POST /impacto  → estima a variação de beneficiários, de gasto e o semáforo do art. 201.

A API só TRANSPORTA dados; quem aplica a norma é `dominios/`. A IA nunca decide: ela
apenas interpreta e propõe o grau de miserabilidade; a linha determinística decide.

Como rodar (a partir da raiz do simulador, simulador-deontico/):
    pip install -r api/requirements.txt
    uvicorn api.main:app --reload
A tela (Vite) encaminha /api/* para http://127.0.0.1:8000 (ver ui/vite.config.js).
"""

from __future__ import annotations

import sys
from pathlib import Path

# A raiz do simulador (onde vive o pacote `dominios`) é a pasta-mãe de `api/`.
RAIZ_SIMULADOR = Path(__file__).resolve().parent.parent
if str(RAIZ_SIMULADOR) not in sys.path:
    sys.path.insert(0, str(RAIZ_SIMULADOR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dominios.decisao import maccormick_justificacao as motor_maccormick
from dominios.grafo import bpc_grafo_ciclomatico as motor_grafo
from dominios.impacto import impacto as motor_impacto
from dominios.norma import bpc_conclusao_deontica as motor_norma
from dominios.norma.bpc_art20_p01_familia import MembroFamilia
from dominios.valoracao import alexy_formula_peso, muller_programa_ambito

app = FastAPI(
    title="Simulador deôntico do BPC — ObservaSocial",
    description="A API transporta dados; a norma do art. 20 da LOAS vive em dominios/.",
    version="0.1.0",
)

# Em desenvolvimento a tela costuma vir via proxy do Vite; o CORS aberto facilita
# também o consumo direto, sem proxy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Tela 1 — Valoração ────────────────────────────────────────────────────────


class MembroEntrada(BaseModel):
    renda_centavos: int = 0
    papel: str = "requerente"


class RequerenteEntrada(BaseModel):
    """Os fatos do requerente (art. 20). Espelha o dataclass Requerente."""

    familia: list[MembroEntrada] = Field(default_factory=list)
    idade: int = 0
    deficiente: bool = False
    impedimento_meses: int = 0
    acumula_beneficio: bool = False
    salario_minimo_centavos: int = 141200
    escore_miserabilidade: float | None = None


def _montar_requerente(entrada: RequerenteEntrada) -> motor_norma.Requerente:
    """Monta o Requerente (art. 20) a partir da entrada Pydantic. Reusado pelos endpoints."""
    return motor_norma.Requerente(
        familia=[
            MembroFamilia(renda_centavos=m.renda_centavos, papel=m.papel) for m in entrada.familia
        ],
        idade=entrada.idade,
        deficiente=entrada.deficiente,
        impedimento_meses=entrada.impedimento_meses,
        acumula_beneficio=entrada.acumula_beneficio,
        salario_minimo_centavos=entrada.salario_minimo_centavos,
        escore_miserabilidade=entrada.escore_miserabilidade,
    )


@app.post("/simular")
def simular(entrada: RequerenteEntrada) -> dict:
    """Aplica a conclusão deôntica do art. 20 e devolve {conclusao, rastro, ...}."""
    return motor_norma.simular(_montar_requerente(entrada))


# ─── Tela 2 — Impacto ──────────────────────────────────────────────────────────


class ImpactoEntrada(BaseModel):
    parametro: str  # "renda" | "idade" | "deficiencia"
    valor_novo: float
    # Hipótese explícita do jurista (opcional). Sem ela, e estando a elasticidade
    # não calibrada na PNADc, o motor devolve NAO_CALIBRADO — nunca inventa número.
    elasticidade_hipotese: float | None = None


@app.post("/impacto")
def impacto(entrada: ImpactoEntrada) -> dict:
    """Estima Δ beneficiários, Δ gasto e o semáforo do art. 201 (ordem de grandeza)."""
    ancoras = motor_impacto.carregar_ancoras()
    return motor_impacto.simular(
        entrada.parametro,
        entrada.valor_novo,
        ancoras=ancoras,
        elasticidade_hipotese=entrada.elasticidade_hipotese,
    )


# ─── Grafo ciclomático — estrutura de decisão da norma ───────────────────────────


@app.get("/grafo")
def grafo() -> dict:
    """Expõe o grafo de fluxo de controle do art. 20 e a complexidade ciclomática."""
    return motor_grafo.grafo()


# ─── Valoração doutrinária (expositiva) — Alexy ou Müller ────────────────────────


class ValorarEntrada(RequerenteEntrada):
    """Os fatos do requerente + a âncora doutrinária e escores opcionais (Alexy)."""

    ancora: str = "alexy"  # "alexy" | "muller"
    escores: dict | None = None


@app.post("/valorar")
def valorar(entrada: ValorarEntrada) -> dict:
    """Expõe o sopesamento (Alexy) ou o enquadramento programa×âmbito (Müller). Não decide."""
    if entrada.ancora == "alexy":
        return alexy_formula_peso.expor(entrada.escores or {})
    if entrada.ancora == "muller":
        requerente = _montar_requerente(entrada)
        caso = {
            "familia": entrada.familia,
            "idade": entrada.idade,
            "deficiente": entrada.deficiente,
            "renda_per_capita_centavos": motor_norma.renda_per_capita(requerente),
        }
        return muller_programa_ambito.enquadrar(caso)
    return {"erro": f"âncora desconhecida: {entrada.ancora!r} (use 'alexy' ou 'muller')"}


# ─── Justificação de MacCormick (silogismo + 3 gates) ────────────────────────────


@app.post("/decidir-maccormick")
def decidir_maccormick(entrada: RequerenteEntrada) -> dict:
    """Expõe a justificação de MacCormick: silogismo de 1ª ordem e, se não fecha, 3 gates."""
    return motor_maccormick.justificar(_montar_requerente(entrada))


@app.get("/")
def raiz() -> dict:
    return {
        "motor": "Simulador deôntico do BPC — ObservaSocial",
        "caminhos": [
            "POST /simular",
            "POST /impacto",
            "GET /grafo",
            "POST /valorar",
            "POST /decidir-maccormick",
        ],
        "aviso": "A API transporta dados; a norma vive em dominios/. A IA não decide.",
    }
