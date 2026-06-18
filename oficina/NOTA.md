# Cópia versionada da camada híbrida

`hibrido.py` é uma **cópia fiel** do harness Oficina
(`doutorado-oficina-cientifica/src/oficina/hibrido.py`), trazida para que este repositório
seja **autossuficiente** (roda e publica sem depender do harness).

Princípio que ela materializa: o leitor-propositor (IA) **interpreta e propõe** um grau; a
função pura `decidir(escore, limiar)` **decide**. As cinco leituras só valem se convergirem.

Ao mudar o original no harness, atualizar esta cópia.
