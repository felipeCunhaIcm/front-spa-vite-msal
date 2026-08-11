# Política de segurança

## Relato de vulnerabilidades

Não publique tokens, credenciais, dados pessoais ou detalhes exploráveis em issues públicas.

Use o recurso **Private vulnerability reporting** do GitHub, quando habilitado no repositório. Inclua uma descrição do impacto, passos mínimos para reprodução e a versão ou commit afetado.

## Responsabilidade de quem utiliza o template

Este projeto é uma referência de frontend e não substitui os controles do ambiente de produção. Antes de implantar:

- valide tokens e permissões no servidor;
- utilize HTTPS;
- configure uma Content Security Policy;
- restrinja redirect URIs, origens CORS e acesso de rede;
- mantenha as dependências atualizadas;
- não armazene segredos ou tokens no repositório e nos logs.

Identificadores presentes em exemplos devem ser fictícios. Revise o histórico do Git antes de tornar um repositório público, pois remover um segredo do commit atual não o remove de commits anteriores.
