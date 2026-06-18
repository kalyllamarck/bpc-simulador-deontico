"""Os 4 templates de prompt da Tela 1 — VALORAR a prova, nunca decidir.

Cada prompt devolve o sinal estruturado que o `Propositor` de `oficina/hibrido.py` já espera:
escore (0–1) + justificativa (citação literal) + bit. Roda a temperatura 0, 5 vezes.
A decisão (passa/falha) é da camada deôntica (`decidir()`), nunca da IA.

Fonte: pesquisa/02-ux-jurista-placeholders.md §3 (templates) e §4 (convergência).

Regras comuns a todos (do §3):
  - Só valora o que está no texto. Sem base → escore null → escala humana (não chuta).
  - Justificativa = citação literal. Sem citação, a proposta é descartada.
  - Escala-âncora de 3–4 pontos: é o que faz as 5 leituras convergirem.
  - A IA nunca diz "concede/nega". Só descreve o grau.

Uso: `PROMPT.format(texto=trecho)` (ou `.format(texto=..., contexto=...)` na vulnerabilidade).
"""

from __future__ import annotations

# Template 1 — placeholder {{Atestado Médico}}
PROMPT_LIMITACAO = """\
PAPEL: Você lê laudos/perícias e MEDE o grau de limitação descrito. Você NÃO diagnostica,
NÃO decide benefício. Só reproduz, em nota, o que o texto afirma.
TEXTO: <<{texto}>>
RÉGUA (devolva o ponto mais fiel ao texto):
  0,0–0,3  limitação leve: trabalha com adaptação, vida independente.
  0,4–0,6  limitação moderada: restrição relevante a trabalho; precisa de apoio parcial.
  0,7–0,9  limitação grave: impede trabalho habitual; dependência significativa.
  1,0      limitação total: incapaz para trabalho e atos da vida independente.
DEVOLVA JSON: {{"escore": <0-1>, "bit": <true se ≥0,7 (grave/total)>,
  "justificativa": "<frase(s) LITERAL(is) do texto que sustentam a nota>"}}
SE o texto não permitir medir: {{"escore": null, "justificativa": "sem base no texto"}}.
"""

# Template 2 — placeholder {{Condições socioeconômicas}}
PROMPT_MISERABILIDADE = """\
PAPEL: Você MEDE o grau de miserabilidade descrito no estudo social / na descrição.
NÃO decide o benefício. A renda formal NÃO é seu objeto (isso é o CadÚnico, objetivo);
aqui você valora a privação concreta DESCRITA (alimentação, moradia, acesso a serviços).
TEXTO: <<{texto}>>
RÉGUA:
  0,0–0,3  privação baixa: necessidades básicas atendidas.
  0,4–0,6  privação relevante: faltas recorrentes em itens essenciais.
  0,7–1,0  privação extrema: insegurança alimentar, moradia precária, sem serviços.
DEVOLVA JSON: {{"escore": <0-1>, "bit": <true se ≥0,7>,
  "justificativa": "<citação literal>"}}
SE o texto não permitir medir: {{"escore": null, "justificativa": "sem base no texto"}}.
"""

# Template 3 — placeholder {{Condições socioeconômicas}} (mesmo placeholder da miserabilidade)
PROMPT_VULNERABILIDADE = """\
PAPEL: Você MEDE como vulnerabilidades SE SOMAM (raça, gênero, idade, deficiência, território,
violência). NÃO decide. Quanto mais eixos sobrepostos e agravantes, maior o grau.
TEXTO + CONTEXTO OBJETIVO: <<{texto}>> | {contexto}
RÉGUA:
  0,0–0,3  um eixo isolado, sem agravante.
  0,4–0,6  dois eixos somados OU um eixo com agravante territorial/violência.
  0,7–1,0  múltiplos eixos sobrepostos e agravados.
DEVOLVA JSON: {{"escore": <0-1>, "bit": <true se ≥0,7>, "justificativa":
  "<eixos identificados + citação literal de cada um>"}}
SE o texto não permitir medir: {{"escore": null, "justificativa": "sem base no texto"}}.
"""

# Template 4 — placeholder {{Descrição da residência}}
PROMPT_PRECARIEDADE = """\
PAPEL: Você EXTRAI sinais de precariedade da moradia descritos no texto. NÃO decide.
TEXTO: <<{texto}>>
RÉGUA: 0 = moradia adequada ... 1,0 = insalubre/risco (terra, sem água/esgoto, alagamento).
DEVOLVA JSON: {{"escore": <0-1>, "bit": <true se ≥0,6>,
  "justificativa": "<sinais citados literalmente>"}}
SE o texto não permitir medir: {{"escore": null, "justificativa": "sem base no texto"}}.
"""
