# `dominios/grafo` — a estrutura da norma, como vista

Expõe o art. 20 como **grafo de fluxo de controle** e mede sua **complexidade ciclomática**
(McCabe). Não decide nada: o grafo é **derivado** da ordem de `concluir()` (motor da norma),
nunca uma segunda lógica (DC-11). Seus nós terminais coincidem com os functores do motor
(O_CONCEDER, F_CONCEDER, INDETERMINADO).

- `bpc_grafo_ciclomatico.py` — `grafo()` devolve nós, arestas e a complexidade.
- A consistência grafo × motor é provada em `tests/test_grafo_ciclomatico.py`.

Leitura jurídica: a complexidade conta os caminhos lógicos independentes da norma — uma medida
da densidade condicional do dispositivo, útil para auditar a fidelidade da formalização à lei.
