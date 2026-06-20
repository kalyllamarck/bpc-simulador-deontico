"""Domínio EMENDA — simulação ex-ante de uma alteração da norma do BPC.

A norma já está convertida em lógica deôntica fechada (domínio `norma`). Este domínio
acrescenta a camada PRÉ-VIGÊNCIA: pega uma alteração proposta (ou recém-editada) da
norma, expressa-a na MESMA linguagem deôntica e expõe os seus efeitos de forma objetiva,
porém traduzidos para LINGUAGEM JURÍDICA, sem jargão de programação.

Três perguntas que o domínio responde:
  1. O que muda? — duas versões da norma (antes × depois) e a diferença de elegibilidade,
     caso a caso, em prosa jurídica (`diff_impacto`).
  2. Quem é atingido e quanto custa? — uma grade de perfis familiares percorre as duas
     versões; conta-se a transição de estado e estima-se o impacto orçamentário, com os
     mesmos guardrails honestos do domínio `impacto` (`diff_impacto`).
  3. Que domínios a alteração alcança? — a partir da variável tocada, percorre-se o grafo
     de dependência até os domínios que autorizam o pagamento e o equilíbrio do art. 201
     (`grafo_dominios`).

Caso de prova real: o Decreto 12.534/2025, que revogou exclusões de renda do Decreto
6.214/2007 (notadamente a transferência de renda do Bolsa Família), fazendo-a passar a
COMPOR a renda per capita do BPC. Ver `exclusoes_renda`.
"""
