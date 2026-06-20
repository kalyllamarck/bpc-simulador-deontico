"""Exclusões de renda parametrizadas — a "torneira" da alteração da norma.

O cálculo da renda per capita do BPC (art. 20, §3º, da LOAS) não soma TODA a renda do
grupo familiar: o regulamento (Decreto 6.214/2007, art. 4º, §2º) lista parcelas que NÃO
são computadas. Alterar essa lista é alterar quem é elegível, sem tocar no teto de ¼ do
salário mínimo. É exatamente o que fez o Decreto 12.534/2025.

Este módulo NÃO reescreve o motor (domínio `norma`): ele apenas monta a entrada. Cada
membro do grupo familiar passa a ter rendas CATEGORIZADAS por fonte; a versão da norma
diz quais categorias são excluídas; e `montar_requerente` soma apenas o que a versão
manda computar, devolvendo um `Requerente` comum que o motor aplica sem alteração.

Versões modeladas:
  - v1 (redação do Decreto 6.214/2007 ANTES do Decreto 12.534/2025): exclui, entre
    outras parcelas, a transferência de renda (Bolsa Família/PETI).
  - v2 (redação APÓS o Decreto 12.534/2025): a transferência de renda PASSA A COMPOR a
    renda per capita (inciso revogado). Permanecem excluídos, por exemplo, o benefício
    previdenciário de até um salário mínimo de idoso/PcD (inciso IX) e o BPC de outro
    idoso ou pessoa com deficiência da família (inciso VIII).

Cautela de fonte: o Decreto 12.534/2025 está sub judice (TRF-3 e TRF-5 afastaram a sua
aplicação por retrocesso social). Aqui ele é tratado como caso de PROVA do método, não
como juízo sobre a sua validade. As categorias modeladas são as de efeito mais claro;
a lista completa do art. 4º, §2º é mais ampla.
"""

from __future__ import annotations

from dataclasses import dataclass, replace

from dominios.norma.bpc_art20_p01_familia import MembroFamilia
from dominios.norma.bpc_conclusao_deontica import Requerente, simular

# --- Categorias de renda (rótulos jurídicos, não técnicos) -------------------------
# O valor de cada constante é a descrição que aparece na tradução jurídica do efeito.
SALARIO = "renda do trabalho ou salário"
TRANSFERENCIA_RENDA = "transferência de renda (Bolsa Família/PETI)"  # Dec. 6.214, art. 4º, §2º, II
# inciso IX (Decreto 6.214/2007, art. 4º, §2º) — permanece excluído após o Decreto 12.534/2025:
PREVIDENCIARIO_MINIMO = (
    "benefício previdenciário de até um salário mínimo de idoso ou pessoa com deficiência"
)
BPC_OUTRO = "BPC de outro idoso ou pessoa com deficiência da família"  # inciso VIII
OUTRA_RENDA = "outra renda computável"

# --- Versões da norma: quais categorias NÃO são computadas (excluídas) -------------
# v1 = redação anterior ao Decreto 12.534/2025.
EXCLUSOES_V1 = frozenset({TRANSFERENCIA_RENDA, PREVIDENCIARIO_MINIMO, BPC_OUTRO})
# v2 = após o Decreto 12.534/2025: a transferência de renda sai da lista de exclusões
# (passa a compor a renda); permanecem o previdenciário mínimo e o BPC de outro membro.
EXCLUSOES_V2 = frozenset({PREVIDENCIARIO_MINIMO, BPC_OUTRO})

VERSOES = {
    "v1": EXCLUSOES_V1,
    "v2": EXCLUSOES_V2,
}

# Rótulo legível de cada versão, para a prosa jurídica.
ROTULO_VERSAO = {
    "v1": "redação anterior ao Decreto 12.534/2025",
    "v2": "redação após o Decreto 12.534/2025",
}


@dataclass(frozen=True)
class RendaCategorizada:
    """Uma parcela de renda de um membro, com a sua fonte (categoria) e o valor em centavos."""

    categoria: str
    centavos: int


@dataclass(frozen=True)
class MembroPerfil:
    """Um membro do grupo familiar com as suas rendas separadas por fonte.

    `papel` segue a enumeração do art. 20, §1º (validada pelo motor ao montar o Requerente).
    """

    papel: str
    rendas: tuple[RendaCategorizada, ...] = ()


@dataclass(frozen=True)
class PerfilFamiliar:
    """Um caso-tipo: o grupo familiar com rendas categorizadas + os demais fatos do art. 20.

    É a entrada "rica" do domínio emenda. `montar_requerente` a converte no `Requerente`
    comum do motor, aplicando as exclusões da versão escolhida.
    """

    id: str
    descricao: str
    membros: tuple[MembroPerfil, ...]
    idade: int
    deficiente: bool
    impedimento_meses: int
    acumula_beneficio: bool
    salario_minimo_centavos: int
    escore_miserabilidade: float | None = None


def renda_computavel_centavos(membro: MembroPerfil, exclusoes: frozenset[str]) -> int:
    """Soma as rendas do membro que a versão manda computar (exclui as categorias vetadas)."""
    return sum(r.centavos for r in membro.rendas if r.categoria not in exclusoes)


def montar_requerente(perfil: PerfilFamiliar, versao: str) -> Requerente:
    """Converte o perfil num `Requerente`, somando só a renda computável da versão.

    Não altera o motor: devolve a entrada normalizada que `simular` aplica como sempre.
    """
    if versao not in VERSOES:
        raise KeyError(f"versão desconhecida: {versao!r}. Use uma de {sorted(VERSOES)}.")
    exclusoes = VERSOES[versao]
    familia = [
        MembroFamilia(renda_centavos=renda_computavel_centavos(m, exclusoes), papel=m.papel)
        for m in perfil.membros
    ]
    return Requerente(
        familia=familia,
        idade=perfil.idade,
        deficiente=perfil.deficiente,
        impedimento_meses=perfil.impedimento_meses,
        acumula_beneficio=perfil.acumula_beneficio,
        salario_minimo_centavos=perfil.salario_minimo_centavos,
        escore_miserabilidade=perfil.escore_miserabilidade,
    )


def simular_versao(perfil: PerfilFamiliar, versao: str) -> dict:
    """Aplica a norma a um perfil sob a versão escolhida; devolve o resultado do motor."""
    return simular(montar_requerente(perfil, versao))


def com_escore(perfil: PerfilFamiliar, escore: float | None) -> PerfilFamiliar:
    """Devolve uma cópia do perfil com outro grau de miserabilidade (para sensibilidade)."""
    return replace(perfil, escore_miserabilidade=escore)
