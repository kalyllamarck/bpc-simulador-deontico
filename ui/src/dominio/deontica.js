/* Tradução deôntica do art. 20 da LOAS — comando a comando.
 *
 * DERIVADA do motor determinístico (dominios/norma/bpc_conclusao_deontica.py e o grafo),
 * NÃO é uma segunda lógica (DC-11): cada functor e cada operador aqui espelha o que o motor
 * já aplica e os testes já cobrem. A glosa traduz a operação que o código executa; nada é
 * inventado. Onde a classificação é interpretativa, marca-se [A CONFIRMAR].
 *
 * Mapa motor → dispositivo (ids do grafo do motor):
 *   R6 → §4º · R1 → caput · R2 → §2º+§10 · R3 → §3º · R5R4 → §11 · R7 → síntese (O_CONCEDER)
 */

/* Operadores lógicos que aparecem no texto da norma (os que o motor aplica). */
export const OPERADORES = {
  disjuncao: { simbolo: '∨', nome: 'disjunção (ou)' },
  conjuncao: { simbolo: '∧', nome: 'conjunção (e)' },
  negacao: { simbolo: '¬', nome: 'negação (não/nem)' },
  relacional: { simbolo: '<', nome: 'comparação (limiar)' },
}

/* Functores deônticos (os três que o motor conclui). */
export const FUNCTORES = {
  O: { simbolo: 'O', nome: 'Obrigatório', glosa: 'o Estado tem o dever de conceder' },
  P: { simbolo: 'P', nome: 'Permitido', glosa: 'é facultado (faculdade probatória)' },
  F: { simbolo: 'F', nome: 'Proibido', glosa: 'é vedado conceder' },
}

/* Tradução por dispositivo. A chave casa com DISPOSITIVOS (citacoes.js) e o id do nó do motor. */
export const DEONTICA = {
  caput: {
    rotulo: 'Art. 20, caput',
    no_motor: 'R1',
    functor: 'O',
    operadores: ['disjuncao', 'negacao'],
    termos: [
      {
        texto: 'pessoa com deficiência OU idoso 65+',
        op: 'disjuncao',
        glosa:
          'integra o público quando idoso (≥ 65 anos) ∨ pessoa com deficiência: operador deôntico de disjunção no antecedente da norma — o motor: integra_publico(idade, deficiente)',
      },
      {
        texto: 'NÃO possuir meios de prover a própria manutenção NEM tê-la provida pela família',
        op: 'negacao',
        glosa:
          'dupla negação no antecedente (¬ meios próprios ∧ ¬ meios da família): a hipoteca econômica que o §3º operacionaliza pela renda mensal per capita',
      },
    ],
    formula: 'O(conceder) ← (idoso ∨ deficiente) ∧ ¬meios ∧ demais condições',
    glosa:
      'O caput é a norma jurídica nuclear: enuncia, sob a forma de proposição prescritiva, o functor deôntico O (Estado obrigado a garantir um salário-mínimo) e delimita o público no antecedente. A subsunção do público ao antecedente é determinística.',
    notas: ['BB01-u01', 'C004-u01'], // norma como proposição prescritiva (Bobbio); relação jurídica direito/dever (Hohfeld)
  },
  p1: {
    rotulo: 'Art. 20, §1º',
    no_motor: 'R3', // entra no cálculo da renda per capita (R3)
    functor: null,
    operadores: ['conjuncao'],
    termos: [
      {
        texto:
          'família = requerente ∧ cônjuge ∧ pais ∧ irmãos solteiros ∧ filhos/enteados solteiros ∧ tutelados',
        op: 'conjuncao',
        glosa:
          'enumeração fechada e conjuntiva, sob o mesmo teto (DC-06); o motor valida a composição antes de aplicar a norma',
      },
    ],
    formula: 'renda_per_capita = Σ(renda dos membros) ÷ nº de membros',
    glosa:
      'Define o conjunto família (enumeração fechada), base do per capita do §3º. É definicional, não tem functor próprio.',
    notas: [],
  },
  p2: {
    rotulo: 'Art. 20, §2º',
    no_motor: 'R2',
    functor: null,
    operadores: ['conjuncao'],
    termos: [
      {
        texto: 'impedimento de longo prazo ∧ barreira ∧ obstrução da participação plena',
        op: 'conjuncao',
        glosa:
          'conjunção dos elementos do conceito de pessoa com deficiência; o motor: impedimento_longo_ok(...)',
      },
    ],
    formula: 'deficiente ⇔ impedimento ∧ longo_prazo ∧ barreira',
    glosa: 'Conceitua pessoa com deficiência; junto do §10 forma a condição R2.',
    notas: [],
  },
  p3: {
    rotulo: 'Art. 20, §3º',
    no_motor: 'R3',
    functor: null,
    operadores: ['relacional'],
    termos: [
      {
        texto: 'renda mensal per capita INFERIOR A ¼ do salário-mínimo',
        op: 'relacional',
        glosa:
          'comparação com limiar: renda_per_capita < ¼ · salário-mínimo (em centavos, DC-04); o motor: criterio_economico_objetivo(...)',
      },
    ],
    formula: 'R3 ⇔ renda_per_capita < (salário_mínimo ÷ 4)',
    glosa:
      'O critério econômico objetivo: comparação relacional da renda mensal per capita com o limiar de ¼ do salário-mínimo. Institui presunção relativa de incapacidade econômica, derrotável pelo §11 (derrotabilidade, DC-03).',
    notas: [],
  },
  p4: {
    rotulo: 'Art. 20, §4º',
    no_motor: 'R6',
    functor: 'F',
    operadores: ['negacao'],
    termos: [
      {
        texto: 'NÃO PODE ser acumulado com outro benefício da seguridade',
        op: 'negacao',
        glosa:
          'proibição expressa (functor deôntico F): ¬ acumulação. O motor a testa primeiro, como vedação absoluta no antecedente: acumula_beneficio_vedado(...)',
      },
    ],
    formula: 'F(conceder) ← acumula_benefício_vedado',
    glosa:
      'Vedação de acumulação — o único functor explícito de PROIBIÇÃO no art. 20; barra a concessão antes de qualquer outra condição.',
    notas: [],
  },
  p10: {
    rotulo: 'Art. 20, §10',
    no_motor: 'R2',
    functor: null,
    operadores: ['relacional'],
    termos: [
      {
        texto: 'impedimento de longo prazo = efeitos por prazo mínimo de 2 (dois) anos',
        op: 'relacional',
        glosa: 'limiar temporal: impedimento_meses ≥ 24 (DC-02); compõe a condição R2 com o §2º',
      },
    ],
    formula: 'longo_prazo ⇔ impedimento_meses ≥ 24',
    glosa: 'Fixa o prazo mínimo do impedimento (§2º). Determinístico.',
    notas: [],
  },
  p11: {
    rotulo: 'Art. 20, §11',
    no_motor: 'R5R4',
    functor: 'P',
    operadores: ['negacao'],
    termos: [
      {
        texto: 'PODERÃO ser utilizados outros elementos probatórios da miserabilidade',
        op: 'negacao',
        glosa:
          'faculdade probatória (functor P) que derrota a presunção do §3º (derrotabilidade, DC-03). É o único resíduo valorativo do art. 20 — zona de indeterminação valorativa em que a IA interpreta e propõe o grau, sem decidir; a linha determinística é que conclui.',
      },
    ],
    formula: 'P(provar miserabilidade) ⇒ derrota R4 (presunção do ¼ SM)',
    glosa:
      'A cláusula de abertura (§11): permite superar a presunção do §3º. É a textura aberta da norma — resíduo valorativo onde a subsunção não se fecha. Sem convergência, o estado permanece INDETERMINADO e a valoração é deferida ao jurista, externamente, no estudo social (DC-09).',
    notas: ['A001-u01', 'DOC005-u01'], // derrotabilidade (Prakken & Sartor); textura aberta, núcleo de certeza (Hart)
  },
}

/* Mapa id do nó do motor → dispositivos que ele aplica (para o drill-down do grafo). */
export const NO_PARA_DISPOSITIVOS = {
  R6: ['p4'],
  R1: ['caput'],
  R2: ['p2', 'p10'],
  R3: ['p3', 'p1'],
  R5R4: ['p11'],
}

/* Functor de um nó terminal do motor (para rotular os desfechos no grafo). */
export const TERMINAL_FUNCTOR = {
  O_CONCEDER: 'O',
  F_CONCEDER: 'F',
  INDETERMINADO_VALORACAO_HUMANA: null, // não é functor: é a abertura para o estudo social
}
