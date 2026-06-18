# Paleta de Cores — ObservaSocial

Cores extraídas dos logos oficiais via Pillow (quantize 8 cores).

## Cores oficiais

| Hex       | Papel               | Frequência |
|-----------|---------------------|------------|
| `#3d4f4f` | Primária / Texto    | ~96% (fundo e símbolo) |
| `#43c295` | Acento / Ícone      | ~1% (detalhe gráfico do logo) |
| `#ffffff` | Sobre fundo escuro  | branco padrão |
| `#d2eae3` | Verde pálido apoio  | residual |

### Papéis no tokens.css

- `--cor-primaria`: `#3d4f4f` — verde-petróleo, cor estrutural da marca
- `--cor-secundaria`: `#43c295` — verde-menta/esmeralda, acento vivo
- `--cor-texto`: `#3d4f4f` — mesmo tom do símbolo sobre fundo branco
- Fonte tipográfica: **[A CONFIRMAR]** — não identificável em imagem rasterizada

## Fontes dos arquivos

| Arquivo               | Nome no Drive                     | File ID                            | URL |
|-----------------------|-----------------------------------|------------------------------------|-----|
| logo-fundo-verde.jpg  | Logo fundo verde (ObservaSocial)  | `19jBi7IoMqfmVWyjb1ibOUpEt169amJjz` | https://drive.google.com/file/d/19jBi7IoMqfmVWyjb1ibOUpEt169amJjz/view |
| logo-fundo-branco.jpg | Logo fundo branco (ObservaSocial) | `1IIJTJ1meXT7FEal0Xj8aAoVyI6eiqeJ1` | https://drive.google.com/file/d/1IIJTJ1meXT7FEal0Xj8aAoVyI6eiqeJ1/view |
| logo-versoes.pdf      | Logo versões (ObservaSocial)      | `18ntu892FdJe5J0wxpMqulO2erkCT6Hbc` | https://drive.google.com/file/d/18ntu892FdJe5J0wxpMqulO2erkCT6Hbc/view |

## Método de extração

- Ferramenta: Python + Pillow, `Image.quantize(8)` sobre RGB
- Filtro: ignorado branco quase puro (R>240 AND G>240 AND B>240)
- Data: 2026-06-18
