# Convenções do projeto — linguagem, taxonomia e decisões conceituais

> Cumpre o harness do repositório do artigo (`METODOLOGIA-ESCRITA.md`,
> `PROTOCOLO-COERENCIA-DOUTRINARIA.md`, `sistema-bpc/CONTRATO-BUILD.md`).
> **Regra-mãe:** traduzir o técnico para o jurídico. PT-BR jurídico em tudo — código,
> nomes de arquivo, comentários e tela. Nenhum jargão de programação exposto.

## 1. Linguagem (glossário técnico → jurídico)
| Não dizer (técnico) | Dizer (jurídico) |
|---|---|
| gate / passa-falha | **portão deôntico** (o que obriga ou veda) |
| input/output | **dados de entrada / conclusão** |
| flag booleana | **predicado** (verdadeiro/falso) |
| score / threshold | **grau (0 a 10) / limiar** |
| hardcoded | **fixado no código** |
| deploy | **publicação do sistema** |
| teste automático (pytest) | **conferência determinística** (aprova/reprova sozinha, sem opinião) |
| LLM / modelo | **leitor-propositor** (interpreta e propõe; nunca decide) |

Vocabulário canônico do projeto (vem do `MAPA-AUTORES-CONCEITOS.md`): subsunção, functor
deôntico (Obrigatório/Permitido/Proibido), mandado de otimização, textura aberta,
**derrotabilidade**, resíduo valorativo, trilha de raciocínio determinístico, esquema
generativo recorrente.

## 2. Taxonomia dos arquivos da norma (rastreável pela própria lei)
Cada **condição deôntica** vira um arquivo, nomeado **ancorado ao art. 20 da LOAS**, de modo
que a ordem alfabética = a ordem da lei. Formato: `bpc-art20-<paragrafo>-<conceito>`.

| Arquivo | Âncora legal | O que decide |
|---|---|---|
| `bpc-art20-00caput-publico` | art. 20, caput | quem é o público (idoso 65+ OU deficiente) |
| `bpc-art20-p01-familia` | art. 20, §1º | composição do grupo familiar |
| `bpc-art20-p02-impedimento` | art. 20, §2º + §10 | deficiência com impedimento de longo prazo (≥ 2 anos) |
| `bpc-art20-p03-renda` | art. 20, §3º | renda familiar per capita e o critério de ¼ do salário mínimo |
| `bpc-art20-p04-vedacao` | art. 20, §4º | vedação de acumulação de benefício |
| `bpc-art20-p11-miserabilidade` | art. 20, §11 | demais elementos (resíduo valorativo) que afastam a presunção do ¼ SM |
| `bpc-conclusao-deontica` | art. 20 (síntese) | conclui Obrigatório conceder × Proibido conceder × Indeterminado (valoração humana); lógica fechada e total (DC-10) |

> O ordenamento alfabético (`00caput` → `p01` → `p02` → `p03` → `p04` → `p11`) reproduz a
> sequência da lei. Qualquer humano localiza a regra pelo dispositivo legal.
>
> Nota de linguagem de programação: no nome do arquivo Python o hífen vira sublinhado
> (`bpc_art20_p03_renda.py`), por exigência da linguagem; a forma canônica com hífen vale para
> documentos e referências.

## 3. Convenção "Decisão Conceitual" (criada agora)
Toda escolha de modelagem que **não é dedução automática da lei** — mas uma opção doutrinária,
jurisprudencial ou política — é declarada como **Decisão Conceitual (DC)**, no mesmo espírito do
rastreio de fonte por print.

- **Registro central:** `DECISOES-CONCEITUAIS.md` (id `DC-NN`, a escolha, o fundamento, a fonte
  com print ou `[A CONFIRMAR]`, e as regras afetadas).
- **No código:** a regra cita a decisão, ex.: `# DC-01 — limiar de miserabilidade (ver
  DECISOES-CONCEITUAIS.md)`. Assim a regra codada aponta sempre para a escolha que a sustenta.
- **Disciplina anti-fabricação:** DC sem fundamento confirmado fica `[A CONFIRMAR]`; nunca é
  apresentada como verdade firme.

## 4. Dinheiro e convergência (decisões 1 do Kalyl)
- **Todo valor monetário é tratado em centavos** (número inteiro de centavos), com comparação
  exata. Proíbe-se arredondamento que possa alterar a fração de ¼ do salário mínimo.
- **As 5 leituras** do leitor-propositor seguem o critério mais rigoroso já fixado no sistema
  (desvio ≤ 0,10 e ao menos 80% dos predicados coincidentes) — ver `DC-05`.

## 5. Regras invioláveis herdadas (resumo do `sistema-bpc/CONTRATO-BUILD.md`)
1. O leitor-propositor (IA) só **propõe**; quem **decide** é a camada determinística.
2. Ordem fixa de avaliação (nunca invertida).
3. Convergência: 5 leituras a temperatura zero; não convergiu = **indeterminação → humano**.
4. Tudo carimbado **PROTÓTIPO / ILUSTRATIVO** enquanto não houver execução empírica real.

## 6. Alcance do `lint-texto` (decisão do Kalyl, 2026-06-18)
- O `lint-texto` valida a **prosa destinada ao artigo** (e textos corridos de leitura).
- Documentos de **referência interna** — tabelas, registros (como `DECISOES-CONCEITUAIS.md`),
  taxonomia de arquivos e código — ficam **estruturados** e isentos das regras de prosa (§2.2
  abertura por conjunção, travessão, dois-pontos explicativo, sintagma nominal nu).
- O **§2.7 (registro científico cauteloso: sem promessa nem asserção categórica)** vale em
  **todo** texto que eu produzo, inclusive nos documentos de referência.
