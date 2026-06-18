# Registro de Decisões Conceituais (DC)

> Cada DC documenta uma escolha que **não decorre por dedução automática da lei**, mas de opção
> doutrinária, jurisprudencial ou política. A convenção está descrita em `CONVENCOES.md` (§3).
> Enquanto o fundamento não tiver prova confirmada (print da fonte), a DC permanece
> `[A CONFIRMAR]` e não se apresenta como verdade firme.

| Id | A escolha (em uma frase) | Fundamento | Fonte / prova | Regras afetadas |
|---|---|---|---|---|
| DC-01 | O limiar do grau de miserabilidade fica em 0,50, embora seja escolha política, não jurídica, e por isso deva ser calibrado e declarado. | O critério de ¼ do salário mínimo opera como presunção relativa, conforme a jurisprudência. | `[A CONFIRMAR]` — calibrar com sentenças reais. | `bpc-art20-p11-miserabilidade`, `bpc-conclusao-deontica` |
| DC-02 | O impedimento de longo prazo conta a partir de 24 meses. | art. 20, §10, da LOAS. | `[A CONFIRMAR]` — conferir a redação vigente. | `bpc-art20-p02-impedimento` |
| DC-03 | A miserabilidade comprovada **derrota** a regra-geral do ¼ do salário mínimo (derrotabilidade). | A presunção do ¼ SM admite prova em contrário, segundo a jurisprudência consolidada (entre outros, RE 567.985 e Rcl 4.374, no STF). | `[A CONFIRMAR]` — anexar print das decisões. | `bpc-art20-p03-renda`, `bpc-art20-p11-miserabilidade` |
| DC-04 | Todo valor monetário é tratado em centavos, com comparação exata. | Precisão patrimonial: o arredondamento poderia alterar a fração de ¼ do salário mínimo e, com ela, o direito. | Decisão de engenharia declarada (Kalyl, 2026-06-18). | `bpc-art20-p03-renda` |
| DC-05 | A convergência das cinco leituras exige desvio menor ou igual a 0,10 e ao menos 80% de predicados coincidentes. | Critério mais rigoroso já fixado no sistema (`sistema-bpc/Config.gs`). | `sistema-bpc/CONTRATO-BUILD.md` (regra inviolável 3). | camada de valoração |
| DC-06 | A família segue a enumeração fechada do art. 20, §1º, da LOAS (requerente, cônjuge ou companheiro, pais, irmãos solteiros, filhos e enteados solteiros, menores tutelados, sob o mesmo teto), e a composição é **validada**: papel fora da lista é recusado. | art. 20, §1º, da LOAS. | `[A CONFIRMAR]` — anexar print do dispositivo. | `bpc-art20-p01-familia` |
| DC-07 | Somente a miserabilidade e o grau de limitação constituem resíduo valorativo; o restante decide-se por subsunção determinística. | Fronteira entre o objetivo (número ou predicado) e o que exige apreciação humana, conforme a tese. | `pesquisa/01-formalizacao-deontica-bpc.md`. | toda a norma |
| DC-08 | O leitor-propositor (IA) jamais decide; apenas interpreta e propõe um grau, enquanto a camada determinística decide. | Regra inviolável do sistema e princípio da própria tese. | `sistema-bpc/CONTRATO-BUILD.md` (regra inviolável 1). | toda a norma |
| DC-09 | Renda acima do ¼ do salário mínimo com a miserabilidade por resolver (grau ausente ou cinco leituras sem convergência) devolve INDETERMINADO, que exige valoração humana (estudo social), e nunca uma negação automática. | A presunção do §3º é relativa e o §11 exige apreciação concreta; o aplicador da norma determinaria o estudo social, em vez de negar de plano. | `pesquisa/01-formalizacao-deontica-bpc.md`; `../src/oficina/hibrido.py` (escala humana). | `bpc-art20-p11-miserabilidade`, `bpc-conclusao-deontica` |
| DC-10 | A norma é uma lógica fechada e total: toda entrada resolve a um estado definido (O_CONCEDER, F_CONCEDER, INDETERMINADO) ou ao estado de guarda DADOS_INVALIDOS, sem buraco, sem travar e sem negação silenciosa. | Natureza deôntica fechada por duas camadas; exigência de simular a aplicabilidade automática da norma. | Decisão do Kalyl (2026-06-18); prova em `dominios/norma/tests/test_logica_fechada.py`. | `bpc-conclusao-deontica` (`simular`) |

## Como citar uma DC no código
Cada regra aponta para a decisão que a sustenta, por exemplo:

```python
# DC-01 — limiar de miserabilidade (ver DECISOES-CONCEITUAIS.md)
LIMIAR_MISERABILIDADE = 0.50
```

Assim a regra codada remete sempre à escolha que a fundamenta, do mesmo modo que cada citação do
artigo remete ao print da fonte.
