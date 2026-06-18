# SLOT — Cole aqui o .gs exportado do seu AppScript

## O que fazer

1. No Google Sheets do BPC, vá em **Extensões → Apps Script**.
2. Copie todo o conteúdo do editor (um ou mais arquivos `.gs`).
3. Cole nesta pasta como `kalyl-atual.gs` (ou renomeie como quiser).

## O que provavelmente precisa casar com `bpc.gs`

### 1. Nomes de função
Se o seu `.gs` já tem funções como `calcularRenda()`, `verificarIdade()` etc.,
verifique se batem com as chamadas em `bpc.gs`. Se não baterem, ajuste os nomes
nas funções auxiliares do `bpc.gs` (seção "FUNÇÕES AUXILIARES").

### 2. Nomes de colunas / campos do objeto `x`
As funções auxiliares em `bpc.gs` leem campos como:
- `x["dataNascimento"]`
- `x["temDeficiencia"]`
- `x["impedimentoMeses"]`
- `x["rendaFamiliar"]`
- `x["numMembros"]`
- `x["acumulaBeneficio"]`
- `x["cadUnico"]`, `x["atestado"]`, `x["residencia"]`, `x["socioeconomico"]`

Cada um desses precisa bater com o nome real da coluna na planilha
(ou com o nome que seu código já usa para passar os dados).
Todos têm comentário `// [A CONFIRMAR]` para fácil localização.

### 3. Salário mínimo
A constante `SALARIO_MINIMO` em `bpc.gs` está em 1518.00 (2025).
Se o seu `.gs` já calcula isso de outra forma (lendo de uma célula da planilha,
por exemplo), substitua a linha da constante pela sua lógica.

### 4. Função LLM real
`LLM_escoreMiserabilidade()` está como STUB e devolve 0.
Cole aqui o bloco real que chama o LLM externo (UrlFetchApp.fetch ou similar).
O contrato é: recebe os 4 campos, devolve um número entre 0.0 e 1.0.

### 5. Limiar de miserabilidade
`var LIMIAR = 0.5` — confirmar com os testes das 5 sentenças.
