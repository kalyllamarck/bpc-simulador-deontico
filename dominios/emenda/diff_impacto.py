"""Diferença de efeito entre duas versões da norma — em linguagem jurídica.

Percorre um perfil (ou a grade inteira) sob as duas versões da norma, identifica a
transição de estado deôntico e a descreve em prosa jurídica (antes/depois/efeito), sem
qualquer jargão de programação. Em seguida, estima o impacto orçamentário de ordem de
grandeza, reusando a calculadora do domínio `impacto` e os seus guardrails de honestidade.

Regras de ouro herdadas de `impacto` (não se afrouxam aqui):
  - o sistema EXPÕE o efeito; não declara (in)constitucionalidade;
  - a fração de atingidos vem da GRADE (ilustrativa do mecanismo), não da PNADc — sai
    rotulada como não calibrada, como toda estimativa não ancorada em microdados;
  - o BPC é assistência (art. 203, V); o elo com o art. 201 é argumentativo.
"""

from __future__ import annotations

from dominios.emenda.exclusoes_renda import (
    ROTULO_VERSAO,
    PerfilFamiliar,
    simular_versao,
)
from dominios.impacto.impacto import (
    AVISO_HONESTO,
    ROTULO_HIPOTESE_JURISTA,
    carregar_ancoras,
    impacto_anual_reais,
    semaforo_art201,
)
from dominios.norma.bpc_conclusao_deontica import F_CONCEDER, INDETERMINADO, O_CONCEDER

# Rótulo legível de cada conclusão, para a prosa jurídica.
ROTULO_CONCLUSAO = {
    O_CONCEDER: "concessão obrigatória",
    F_CONCEDER: "concessão vedada",
    INDETERMINADO: "indeterminado (exige aferição de miserabilidade por estudo social)",
}


def _reais(centavos: int | None) -> str:
    """Formata centavos como 'R$ x,yz' (None → '—')."""
    if centavos is None:
        return "—"
    return f"R$ {centavos / 100:.2f}".replace(".", ",")


def transicao_caso(perfil: PerfilFamiliar) -> dict:
    """Aplica as duas versões a um perfil e devolve as conclusões, rendas e a transição."""
    v1 = simular_versao(perfil, "v1")
    v2 = simular_versao(perfil, "v2")
    return {
        "id": perfil.id,
        "descricao": perfil.descricao,
        "v1": v1,
        "v2": v2,
        "transicao": f"{v1['conclusao']} → {v2['conclusao']}",
        # "Atingido" = perdeu a concessão obrigatória que tinha sob a versão anterior.
        "perde_concessao": v1["conclusao"] == O_CONCEDER and v2["conclusao"] != O_CONCEDER,
        "muda_de_camada": (
            v1["conclusao"] == O_CONCEDER
            and v2["conclusao"] == O_CONCEDER
            and v1["rastro"] != v2["rastro"]
        ),
    }


def traduzir_efeito(t: dict) -> str:
    """Traduz a transição de um caso para linguagem jurídica (antes/depois/efeito).

    Sem jargão de programação: descreve o que a redação anterior e a posterior produzem
    e qual o efeito sobre a elegibilidade, citando os dispositivos do art. 20 da LOAS.
    """
    r1 = _reais(t["v1"]["renda_per_capita_centavos"])
    r2 = _reais(t["v2"]["renda_per_capita_centavos"])
    antes = (
        f"Sob a {ROTULO_VERSAO['v1']}, a renda per capita apurada é de {r1} e a conclusão é "
        f"de {ROTULO_CONCLUSAO[t['v1']['conclusao']]}."
    )
    depois = (
        f"Sob a {ROTULO_VERSAO['v2']}, a transferência de renda passa a compor o cálculo, a renda "
        f"per capita sobe a {r2} e a conclusão é de {ROTULO_CONCLUSAO[t['v2']['conclusao']]}."
    )
    if t["perde_concessao"] and t["v2"]["conclusao"] == INDETERMINADO:
        efeito = (
            "Efeito: a família perde a elegibilidade presumida pelo teto de ¼ do salário "
            "mínimo (art. 20, §3º) e passa à aferição de miserabilidade (art. 20, §11), por "
            "estudo social, sem concessão nem negação automática."
        )
    elif t["perde_concessao"] and t["v2"]["conclusao"] == F_CONCEDER:
        efeito = (
            "Efeito: afastada a miserabilidade no caso concreto, a renda recomposta supera o "
            "teto e a concessão passa a ser vedada (art. 20, §3º), em sentido contrário ao "
            "mínimo existencial (art. 203, V, da Constituição)."
        )
    elif t["muda_de_camada"]:
        efeito = (
            "Efeito: a elegibilidade se mantém, porém o caso migra da regra objetiva do teto "
            "(art. 20, §3º) para a cláusula de miserabilidade (art. 20, §11), o que desloca a "
            "decisão da subsunção para a aferição valorativa."
        )
    else:
        efeito = (
            "Efeito: sem alteração de resultado, pois neste caso a versão posterior não "
            "recompõe a renda a ponto de cruzar o teto de ¼ do salário mínimo (art. 20, §3º)."
        )
    return f"[{t['id']}] {t['descricao']} {antes} {depois} {efeito}"


def diff_grade(grade: tuple[PerfilFamiliar, ...]) -> list[dict]:
    """Aplica as duas versões a toda a grade e devolve as transições com a tradução jurídica."""
    out = []
    for perfil in grade:
        t = transicao_caso(perfil)
        t["efeito_juridico"] = traduzir_efeito(t)
        out.append(t)
    return out


def resumo(diffs: list[dict]) -> dict:
    """Sintetiza as transições: contagens e a fração de atingidos entre os elegíveis da v1."""
    elegiveis_v1 = [d for d in diffs if d["v1"]["conclusao"] == O_CONCEDER]
    perdem = [d for d in diffs if d["perde_concessao"]]
    migram = [d for d in diffs if d["muda_de_camada"]]
    base = len(elegiveis_v1)
    contagem: dict[str, int] = {}
    for d in diffs:
        contagem[d["transicao"]] = contagem.get(d["transicao"], 0) + 1
    return {
        "total_casos": len(diffs),
        "elegiveis_v1": base,
        "perdem_concessao": len(perdem),
        "migram_de_camada": len(migram),
        "fracao_atingida_na_grade": (len(perdem) / base) if base else 0.0,
        "contagem_por_transicao": contagem,
        "ids_perdem": [d["id"] for d in perdem],
        "ids_migram": [d["id"] for d in migram],
    }


def sensibilidade_por_ponto_percentual(
    *, ancoras: dict | None = None, ano_sm: str = "2026"
) -> dict:
    """Sensibilidade KISS e honesta: quanto o gasto do BPC varia por 1 ponto percentual
    de beneficiários que mudam de elegibilidade.

    Não depende de fração populacional (que exige PNADc): é uma régua de ordem de grandeza
    — `1% do estoque × 1 SM × 12`. Serve para enunciar o efeito sem inventar um número de
    cobertura, que é o uso correto enquanto a fração real não for calibrada.
    """
    ancoras = ancoras if ancoras is not None else carregar_ancoras()
    estoque = float(ancoras["estoque_total_beneficios_emitidos_2025"]["valor"])
    salario_minimo = float(ancoras["beneficio_unitario_sm"][ano_sm])
    meses = int(ancoras["meses"]["valor"])
    benef_por_pp = estoque * 0.01
    return {
        "beneficiarios_por_ponto_percentual": benef_por_pp,
        "reais_ano_por_ponto_percentual": impacto_anual_reais(benef_por_pp, salario_minimo, meses),
        "aviso": AVISO_HONESTO,
    }


def estimar_impacto_orcamentario(
    fracao_atingida: float,
    *,
    ancoras: dict | None = None,
    ano_sm: str = "2026",
    rotulo_fonte_fracao: str = "fração ILUSTRATIVA da grade — não calibrada em PNADc",
) -> dict:
    """Estima o impacto orçamentário de ordem de grandeza de um retrocesso de elegibilidade.

    Modelo KISS: Δ beneficiários = −(fração atingida × estoque); Δ R$ = Δ benef × 1 SM × 12;
    o semáforo do art. 201 expõe a direção fiscal. A FRAÇÃO não vem da PNADc — sai sempre
    rotulada como não calibrada (mesmo princípio do guardrail de `impacto`): é ordem de
    grandeza, não previsão. O sinal negativo do gasto reflete a redução de cobertura.
    """
    ancoras = ancoras if ancoras is not None else carregar_ancoras()
    estoque = float(ancoras["estoque_total_beneficios_emitidos_2025"]["valor"])
    salario_minimo = float(ancoras["beneficio_unitario_sm"][ano_sm])
    meses = int(ancoras["meses"]["valor"])
    gasto_atual = float(ancoras["gasto_bpc_2024_bilhoes"]["valor"]) * 1e9

    delta_beneficiarios = -(fracao_atingida * estoque)  # retrocesso reduz a cobertura
    delta_reais = impacto_anual_reais(delta_beneficiarios, salario_minimo, meses)
    gasto_novo = gasto_atual + delta_reais
    semaforo = semaforo_art201(gasto_novo, ancoras=ancoras)

    return {
        "estado": "CALCULADO",
        "fracao_atingida": fracao_atingida,
        "calibracao": f"{ROTULO_HIPOTESE_JURISTA}; {rotulo_fonte_fracao}",
        "delta_beneficiarios": delta_beneficiarios,
        "delta_reais": delta_reais,
        "gasto_atual": gasto_atual,
        "gasto_novo": gasto_novo,
        "semaforo": semaforo,
        "aviso": AVISO_HONESTO,
    }
