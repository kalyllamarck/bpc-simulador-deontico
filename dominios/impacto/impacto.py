"""Calculadora de impacto do BPC + semaforo de tensao com o art. 201 (Tela 2).

O jurista mexe num parametro da norma (limiar de renda, idade do idoso, prazo de
impedimento da deficiencia) e o sistema estima quanto o gasto publico SOBE ou DESCE
e acende um SEMAFORO de pressao sobre o equilibrio do art. 201 da CF.

REGRAS DE OURO (tese do projeto):
  - O sistema EXPOE a tensao; NAO declara inconstitucionalidade. O art. 201 e
    principio, sem numero legal de "sustentavel" - maquina nao julga passa/falha.
  - O BPC e ASSISTENCIA (art. 203, V), nao seguro contributivo (art. 201). O elo
    com o art. 201 e ARGUMENTATIVO (pressao sobre a seguridade), nao automatico.
  - As elasticidades NUNCA vem de chute da IA. Sao calculadas sobre a PNADc. Enquanto
    null em `ancoras.json`, o motor NAO inventa numero: devolve estado NAO_CALIBRADO.
    O jurista pode informar uma hipotese explicita, que sai ROTULADA como nao calibrada.
  - Tudo e estimativa de ORDEM DE GRANDEZA (microssimulacao de 1a ordem), nao previsao.

Metodo (pesquisa/03 §2): cada parametro e uma "torneira".
  Impacto R$ = delta beneficiarios x 1 salario minimo x meses.

KISS: Python puro, sem rede. As constantes ficam em `ancoras.json` (editavel).
"""

from __future__ import annotations

import json
from pathlib import Path

_ANCORAS_PATH = Path(__file__).with_name("ancoras.json")

# Mapa parametro da Tela 2 -> chave da elasticidade em ancoras.json.
_ELASTICIDADE_POR_PARAMETRO = {
    "renda": "elasticidade_limiar_renda_1_4_para_1_2_SM",
    "idade": "elasticidade_criterio_etario",
    "deficiencia": "elasticidade_criterio_deficiencia",
}

# Ano de referencia para o salario minimo unitario do BPC.
_ANO_SM_PADRAO = "2024"

# Aviso honesto reusado pela saida do semaforo. EXPOE, nao DECIDE.
AVISO_HONESTO = (
    "Estimativa de ordem de grandeza, nao previsao oficial. Este sinal EXPOE a "
    "tensao orcamentaria; NAO e declaracao de inconstitucionalidade. O BPC e "
    "assistencia social (art. 203, V), custeado pelo orcamento, e nao seguro "
    "contributivo do art. 201; o elo com o equilibrio do art. 201 e argumentativo "
    "(pressao sobre a seguridade), nao automatico: e um indicador, nao um veredito."
)

# Rotulo obrigatorio quando o resultado usa uma hipotese do jurista (sem calibracao).
ROTULO_HIPOTESE_JURISTA = "hipotese do jurista - nao calibrada em PNADc"

# Mensagem do guardrail quando a elasticidade nao foi calibrada e o jurista nao
# informou hipotese: o motor NAO inventa numero.
MENSAGEM_NAO_CALIBRADO = (
    "elasticidade nao calibrada - calcular sobre PNADc; ou informe uma hipotese "
    "explicita do jurista"
)


def carregar_ancoras(caminho: str | Path | None = None) -> dict:
    """Le as constantes editaveis de `ancoras.json` (ou de um caminho dado)."""
    p = Path(caminho) if caminho is not None else _ANCORAS_PATH
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _fonte_ancoras(ancoras: dict) -> dict:
    """Resumo de proveniencia das ancoras CONFIRMADAS, para carimbar toda saida."""
    return {
        "gasto_bpc_2024": ancoras["gasto_bpc_2024_bilhoes"].get("fonte"),
        "estoque_2025": ancoras["estoque_total_beneficios_emitidos_2025"].get("fonte"),
        "beneficio_unitario": ancoras["beneficio_unitario_sm"].get("fonte"),
    }


def _salario_minimo(ancoras: dict, ano: str = _ANO_SM_PADRAO) -> float:
    """Salario minimo (= benefício unitario do BPC) do ano de referencia, em R$."""
    return float(ancoras["beneficio_unitario_sm"][ano])


def _gasto_base_reais(ancoras: dict) -> float:
    """Gasto base do BPC em R$ (a ancora confirmada esta em bilhoes)."""
    return float(ancoras["gasto_bpc_2024_bilhoes"]["valor"]) * 1e9


# ---- §2.1 - Formula base ----------------------------------------------------------


def impacto_anual_reais(
    delta_beneficiarios: float, salario_minimo: float, meses: int = 12
) -> float:
    """Impacto anual em R$ = delta beneficiarios x 1 salario minimo x meses.

    Formula base do §2.1. Positivo = gasta MAIS; negativo = gasta MENOS.
    """
    return delta_beneficiarios * salario_minimo * meses


# ---- §2.2 - Sensibilidade por parametro (GUARDRAIL de elasticidade) ---------------


def _elasticidade_efetiva(parametro: str, ancoras: dict, elasticidade_hipotese: float | None):
    """Resolve a elasticidade a usar e o rotulo de calibracao.

    Tres caminhos:
      1. Ancora calibrada (valor != null) -> usa o valor, rotulo "calibrada".
      2. Ancora null, mas o jurista informou `elasticidade_hipotese` -> usa a
         hipotese, rotulo ROTULO_HIPOTESE_JURISTA.
      3. Ancora null e nenhuma hipotese -> retorna (None, None): o motor NAO
         inventa numero (estado NAO_CALIBRADO).

    Devolve `(elasticidade, baseline, rotulo_calibracao)` ou `(None, baseline, None)`.
    """
    elasticidades = ancoras["elasticidades"]
    if parametro not in _ELASTICIDADE_POR_PARAMETRO:
        raise KeyError(
            f"parametro desconhecido: {parametro!r}. "
            f"Use um de {sorted(_ELASTICIDADE_POR_PARAMETRO)}."
        )
    chave = _ELASTICIDADE_POR_PARAMETRO[parametro]
    tabela = elasticidades[chave]
    baseline = tabela["_baseline"]
    valor_ancora = tabela.get("valor")

    if valor_ancora is not None:
        return float(valor_ancora), baseline, "calibrada em PNADc"
    if elasticidade_hipotese is not None:
        return float(elasticidade_hipotese), baseline, ROTULO_HIPOTESE_JURISTA
    return None, baseline, None


def estimar_delta(
    parametro: str, valor_novo: float, *, ancoras: dict, elasticidade_hipotese: float | None = None
):
    """Estima o delta no nº de beneficiarios quando o jurista muda um parametro.

    Modelo de 1a ordem (linear):

        delta benef ~= estoque x elasticidade x (valor_novo - baseline)

    GUARDRAIL: a elasticidade NUNCA vem de chute da IA. Se a ancora estiver null e
    o jurista nao informar `elasticidade_hipotese`, devolve `None` (o chamador trata
    como NAO_CALIBRADO). Se a hipotese vier, calcula e o resultado sera ROTULADO.

    `parametro` em {"renda", "idade", "deficiencia"}.

    Devolve `(delta_beneficiarios | None, rotulo_calibracao | None)`.
    """
    elasticidade, baseline, rotulo = _elasticidade_efetiva(
        parametro, ancoras, elasticidade_hipotese
    )
    if elasticidade is None:
        return None, None

    estoque = float(ancoras["estoque_total_beneficios_emitidos_2025"]["valor"])
    delta_parametro = valor_novo - baseline
    return estoque * elasticidade * delta_parametro, rotulo


# ---- §3.2 - Semaforo do art. 201 (3 cores) ----------------------------------------


def semaforo_art201(gasto_novo: float, *, ancoras: dict) -> dict:
    """Acende o semaforo de PRESSAO orcamentaria (sinal 1 da pesquisa §3.2).

    peso = gasto_novo / gasto_atual. Acrescimo % aciona as cores:
      - VERDE   : abaixo do limiar amarelo.
      - AMARELO : >= +amarelo% e < +vermelho%.
      - VERMELHO: >= +vermelho%.

    A mensagem e HONESTA: expoe tensao, nao declara inconstitucionalidade, e cita
    art. 203, V vs art. 201. Os limiares sao escolha politica editavel, nao verdade.
    """
    gasto_atual = _gasto_base_reais(ancoras)
    peso = gasto_novo / gasto_atual
    # Acrescimo % sobre o gasto atual. Arredonda para matar ruido de ponto flutuante
    # (ex.: 1,2 vira 19,999...%) - assim os limiares batem exatos no corte.
    peso_pct = round((peso - 1.0) * 100.0, 6)

    sem = ancoras["semaforo"]
    amarelo = sem["limiar_amarelo_pct"]
    vermelho = sem["limiar_vermelho_pct"]

    if peso_pct >= vermelho:
        cor = "vermelho"
        forca = "ALTA"
    elif peso_pct >= amarelo:
        cor = "amarelo"
        forca = "MODERADA"
    else:
        cor = "verde"
        forca = "BAIXA"

    sinal = "+" if peso_pct >= 0 else ""
    mensagem_honesta = (
        f"Pressao orcamentaria {forca}: a alteracao leva o gasto do BPC a "
        f"{sinal}{peso_pct:.1f}% do patamar atual (peso {peso:.2f}x). {AVISO_HONESTO}"
    )

    return {
        "cor": cor,
        "peso": peso,
        "peso_pct": peso_pct,
        "mensagem_honesta": mensagem_honesta,
    }


# ---- O que a Tela 2 consome -------------------------------------------------------


def simular(
    parametro: str, valor_novo: float, *, ancoras: dict, elasticidade_hipotese: float | None = None
) -> dict:
    """Junta tudo: delta beneficiarios, delta R$/ano, gasto novo e semaforo do art. 201.

    E a funcao que a Tela 2 chama. Tudo e estimativa de ordem de grandeza.

    GUARDRAIL: se a elasticidade nao foi calibrada (null em ancoras.json) e o jurista
    nao informou `elasticidade_hipotese`, devolve um estado "NAO_CALIBRADO" com mensagem
    clara, sem inventar numero. Se a hipotese vier, calcula e ROTULA o resultado como
    nao calibrado em PNADc. Toda saida inclui `fonte_ancoras`.
    """
    fonte_ancoras = _fonte_ancoras(ancoras)

    # Valida o parametro cedo (levanta KeyError se desconhecido).
    delta_beneficiarios, rotulo_calibracao = estimar_delta(
        parametro,
        valor_novo,
        ancoras=ancoras,
        elasticidade_hipotese=elasticidade_hipotese,
    )

    if delta_beneficiarios is None:
        return {
            "estado": "NAO_CALIBRADO",
            "parametro": parametro,
            "valor_novo": valor_novo,
            "mensagem": MENSAGEM_NAO_CALIBRADO,
            "delta_beneficiarios": None,
            "delta_reais": None,
            "gasto_atual": _gasto_base_reais(ancoras),
            "gasto_novo": None,
            "semaforo": None,
            "fonte_ancoras": fonte_ancoras,
            "aviso": AVISO_HONESTO,
        }

    salario_minimo = _salario_minimo(ancoras)
    meses = int(ancoras["meses"]["valor"])
    gasto_atual = _gasto_base_reais(ancoras)

    delta_reais = impacto_anual_reais(delta_beneficiarios, salario_minimo, meses)
    gasto_novo = gasto_atual + delta_reais
    semaforo = semaforo_art201(gasto_novo, ancoras=ancoras)

    return {
        "estado": "CALCULADO",
        "parametro": parametro,
        "valor_novo": valor_novo,
        "calibracao": rotulo_calibracao,
        "delta_beneficiarios": delta_beneficiarios,
        "delta_reais": delta_reais,
        "gasto_atual": gasto_atual,
        "gasto_novo": gasto_novo,
        "semaforo": semaforo,
        "fonte_ancoras": fonte_ancoras,
        "aviso": AVISO_HONESTO,
    }
