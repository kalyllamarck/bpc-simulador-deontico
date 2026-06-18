# Simulador deôntico do BPC · ObservaSocial

Tela web (React + Tailwind) do simulador da norma do BPC, com a identidade do
**ObservaSocial** (não do escritório). O sistema apenas APLICA a norma do art. 20 da
LOAS; quando não conclui, manda o caso para valoração humana (estudo social). A IA
jamais decide: ela interpreta e propõe; quem decide é a linha determinística.

Duas telas:

- **Valoração do caso** — dois modos (colar a sentença / descrever as provas), os campos
  do art. 20, a luz de concordância das cinco leituras (verde = concordaram; amarela =
  divergiram → confira) e a conclusão em linguagem jurídica: **Obrigatório conceder /
  Proibido conceder / Indeterminado: exige valoração humana**, com a trilha citando os
  dispositivos.
- **Impacto e art. 201** — controles para os parâmetros (limiar de renda, idade,
  deficiência), a variação de beneficiários e de gasto, e o **semáforo do art. 201**
  (verde/amarelo/vermelho), com o aviso honesto de que o sinal *expõe a tensão, não
  declara inconstitucionalidade*.

## Como rodar as duas pontas

A partir da raiz do simulador (`simulador-deontico/`):

```bash
# 1) Motor (API) — aplica a norma já pronta em dominios/
pip install -r api/requirements.txt
uvicorn api.main:app --reload          # sobe em http://127.0.0.1:8000

# 2) Tela (em outro terminal), a partir de ui/
cd ui
npm install
npm run dev                            # abre em http://localhost:5173
```

A tela encaminha `/api/*` para o motor (proxy do Vite, ver `ui/vite.config.js`). **Sem o
motor no ar, as telas caem no dado de exemplo** (mesma forma da saída real), para permitir
a demonstração sem backend.

## Marca

A identidade visual é do **ObservaSocial** (não do escritório/LSA). Logos em `ui/marca/`
(copiados para `ui/public/marca/` para a tela servir); paleta em `ui/marca/CORES.md`:
primária `#3d4f4f` (verde-petróleo), acento `#43c295` (verde-menta). Os tokens da marca
estão em `ui/tailwind.config.js` (`observa-petroleo`, `observa-menta`).

## Publicação futura

Previsto publicar em `aluno.lamarck.adv.br/profeduardo`.

## Pendências

- Rodar `npm install` e `pip install -r api/requirements.txt` (precisa de rede — não feito
  aqui).
- Fonte tipográfica oficial do ObservaSocial: **[A CONFIRMAR]** (não identificável na
  imagem rasterizada do logo).
