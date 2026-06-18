# SLOT — Dados para calibrar as elasticidades (PNADc) e confirmar âncoras

As âncoras de **gasto, estoque, concessões, salário mínimo e espécies** já estão
**CONFIRMADAS** em `ancoras.json` (com `fonte` e `status` por constante). O que falta é
**calibrar as elasticidades e o take-up** — e isso **só** sai de cálculo sobre a PNADc,
nunca de estimativa da IA. Enquanto as elasticidades ficam `null`, o motor devolve o
estado `NAO_CALIBRADO` (não inventa número) e a Tela 2 mostra "estimativa pendente de
calibração (PNADc)".

## Espécies (confirmadas)
- **87** = BPC-PcD (Amparo Social ao Portador de Deficiência).
- **88** = BPC-Idoso (Amparo Social ao Idoso).

## Fontes citáveis CONFIRMADAS (já refletidas em ancoras.json)
| Constante | Valor | Fonte citável |
|---|---|---|
| gasto BPC 2024 | R$ 113,421 bi | Tesouro Nacional, RTN dez/2024, `serie_historica_dez24.xlsx` |
| estoque benefícios emitidos 2025 | 7.645.372 | BEPS abr/2026, Quadro 2, linha 2025 (INSS/MPS) |
| concessões assistenciais 2023 | 804.138 | AEPS 2023 |
| benefício unitário (SM) | 1412 / 1518 / 1622 | Portaria Interministerial MPS/MF (2024/2025/2026) |

## Fontes para baixar (o que falta para calibrar)
- **BEPS — Quadro 20 e Quadro 4 (XLS):** estoque/concessão por espécie (87 × 88).
  Boletins: https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/Dados-estatisticos-previdencia-social-e-inss/boletins-da-previdencia-social
- **RTN dez/2024 (XLSX):** `serie_historica_dez24.xlsx` (Tesouro Nacional) — âncora de gasto já confirmada.
- **MDS / SAGI — VIS DATA 3 (CSV):** séries de beneficiários do BPC por UF/município/espécie.
- **Portal da Transparência (CSV):** https://portaldatransparencia.gov.br/download-de-dados/bpc — estoque por UF/município.
- **PNADc 2024 (microdados IBGE):** base do cálculo das elasticidades e do take-up.

## Receita de download (subagente Sonnet, quando autorizado)
1. Baixar os XLS/XLSX/CSV das fontes acima (BEPS Quadro 20/4; RTN dez/2024; VIS DATA 3; Transparência).
2. Baixar os microdados da **PNADc 2024** (IBGE) + dicionário de variáveis.
3. Ler local com pandas (o PDF do BEPS vem ilegível pela web — sempre baixar e ler o arquivo).
4. **Take-up:** estoque_BEPS_Q2 por espécie ÷ elegíveis_PNADc2024 (RDPC abaixo do limiar legal),
   separando idosos 65+ (espécie 88) e PcD (espécie 87). Ref.: Medeiros TD 1416/IPEA (2009);
   MDS/SAGI (2009) ≈ 57% para PcD.
5. **Elasticidade do limiar de renda (¼ → ½ SM):** contar na PNADc 2024 as pessoas com RDPC entre
   0,25 e 0,50 SM, entre idosos 65+ e PcD.
6. **Elasticidade do critério etário:** simular o público na PNADc por idade mínima. Ref.: Jaccoud
   TD 2301/IPEA (2017) estimou ≈ 67% de redução se a idade fosse a 70.
7. **Elasticidade do critério de deficiência:** inconclusiva fora de dados administrativos do INSS
   (avaliação biopsicossocial, não renda) — registrar como tal, não chutar.

## Falta baixar (checklist)
- [ ] BEPS Quadro 20 e Quadro 4 (XLS) — repartição estoque/concessão por espécie 87 × 88.
- [ ] MDS/SAGI VIS DATA 3 (CSV) — séries do BPC.
- [ ] Portal da Transparência (CSV) — estoque por UF/município.
- [ ] **PNADc 2024 (microdados IBGE)** — base do cálculo das elasticidades e do take-up.
- [x] RTN dez/2024 (XLSX) — gasto 2024 confirmado (R$ 113,421 bi).

Enquanto a PNADc não for processada, as elasticidades e o take-up seguem `null`/`A_CONFIRMAR`
e a saída da Tela 2 fica rotulada "ordem de grandeza, não previsão" e "pendente de calibração".
