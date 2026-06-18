"""Grupo familiar e renda per capita — art. 20, §1º e §3º, da LOAS (Lei 8.742/93).

O §1º enumera de forma fechada quem compõe o grupo familiar para fins do benefício:
o requerente, o cônjuge ou companheiro, os pais e, na ausência de um deles, a madrasta
ou o padrasto, os irmãos solteiros, os filhos e enteados solteiros e os menores
tutelados, desde que vivam sob o mesmo teto.

A renda familiar per capita (base do critério econômico do §3º) é a soma das rendas
mensais dos membros do grupo, dividida pelo número de membros.

Decisões conceituais:
  - DC-06 — a família segue a enumeração FECHADA do art. 20, §1º (parente sob o mesmo
            teto); a composição é VALIDADA: papel fora da lista é recusado, como o
            aplicador da norma recusaria quem não integra o grupo familiar legal.
  - DC-04 — todo valor monetário é tratado em centavos inteiros, com comparação exata;
            proíbe-se arredondamento que possa alterar a fração de ¼ do salário mínimo.

A enumeração legal abaixo é a relação FECHADA de papéis admitidos no grupo. A verificação
de quem efetivamente vive sob o mesmo teto é fato do caso concreto, registrado na própria
montagem do grupo familiar (cada membro incluído já é membro do mesmo teto).
"""

from __future__ import annotations

from dataclasses import dataclass

# Enumeração fechada do art. 20, §1º, da LOAS (DC-06). Relação dos papéis admitidos no
# grupo familiar, todos exigindo convivência sob o mesmo teto.
PAPEIS_GRUPO_FAMILIAR = (
    "requerente",
    "cônjuge ou companheiro",
    "pai",
    "mãe",
    "madrasta ou padrasto",  # na ausência de um dos pais
    "irmão solteiro",
    "filho ou enteado solteiro",
    "menor tutelado",
)


@dataclass(frozen=True)
class MembroFamilia:
    """Um integrante do grupo familiar (art. 20, §1º).

    `renda_centavos` é a renda mensal do membro em centavos inteiros (DC-04).
    `papel` é meramente descritivo (auditoria); não altera o cálculo da renda.
    """

    renda_centavos: int
    papel: str = "requerente"


class ComposicaoFamiliarInvalida(ValueError):
    """A composição do grupo familiar não cabe na enumeração do art. 20, §1º (DC-06)."""


def validar_composicao(membros: list[MembroFamilia]) -> None:
    """Confere a composição do grupo familiar contra o art. 20, §1º (DC-06).

    Recusa, com erro claro, o que o aplicador da norma recusaria:
      - grupo vazio (há sempre, ao menos, o requerente);
      - grupo sem o requerente;
      - papel fora da enumeração fechada do §1º;
      - renda de membro negativa.
    Não decide o benefício; apenas garante que a entrada é a do art. 20, §1º.
    """
    if not membros:
        raise ComposicaoFamiliarInvalida(
            "grupo familiar vazio: a norma pressupõe ao menos o requerente (art. 20, §1º)"
        )
    if not any(membro.papel == "requerente" for membro in membros):
        raise ComposicaoFamiliarInvalida("grupo familiar sem o requerente (art. 20, §1º)")
    fora_da_lista = sorted({m.papel for m in membros if m.papel not in PAPEIS_GRUPO_FAMILIAR})
    if fora_da_lista:
        raise ComposicaoFamiliarInvalida(
            "papel fora da enumeração do art. 20, §1º: " + ", ".join(fora_da_lista)
        )
    if any(membro.renda_centavos < 0 for membro in membros):
        raise ComposicaoFamiliarInvalida("renda de membro não pode ser negativa")


def renda_familiar_total_centavos(membros: list[MembroFamilia]) -> int:
    """Soma das rendas mensais do grupo familiar, em centavos inteiros (art. 20, §3º; DC-04)."""
    return sum(membro.renda_centavos for membro in membros)


def renda_per_capita_centavos(membros: list[MembroFamilia]) -> int:
    """Renda familiar per capita em centavos: soma das rendas / número de membros.

    Divisão inteira (art. 20, §3º; DC-04): trabalha em centavos para não introduzir
    arredondamento que altere a fração de ¼ do salário mínimo. Grupo vazio é situação
    impossível na norma (há sempre, ao menos, o requerente).
    """
    if not membros:
        raise ValueError("grupo familiar não pode ser vazio (há sempre o requerente)")
    return renda_familiar_total_centavos(membros) // len(membros)
