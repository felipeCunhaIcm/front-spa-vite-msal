# SPA Vite + MSAL

Template enxuto de autenticação para Single-Page Applications com Microsoft Entra ID e `@azure/msal-browser`.

O projeto demonstra o fluxo **Authorization Code com PKCE**, restauração de sessão, logout, aquisição silenciosa de access token e chamada a uma API protegida. Ele foi pensado como base para estudos, aplicações internas e protótipos que poderão evoluir para uma arquitetura com backend ou reverse proxy.

## Recursos

- autenticação Microsoft Entra ID por popup;
- Authorization Code com PKCE gerenciado pelo MSAL;
- cache em `sessionStorage`;
- login OIDC separado da autorização da API;
- recuperação da conta ativa após recarregar a página;
- visualização segura dos principais claims do ID token;
- aquisição silenciosa de access token, com interação apenas quando necessária;
- proxy de desenvolvimento opcional para `/api`;
- TypeScript estrito, build de produção e CI.

## Arquitetura

```text
Navegador ── login ──> Microsoft Entra ID
    │                         │
    │ <── ID/access token ────┘
    │
    └── Bearer token ──> API protegida
```

O navegador autentica o usuário e solicita um token destinado à API. A API, e não a SPA, é responsável por validar o token e autorizar cada operação.

## Pré-requisitos

- Node.js 18 ou superior;
- um tenant Microsoft Entra ID;
- um registro de aplicação do tipo SPA;
- uma API que exponha uma permissão delegada, caso a chamada protegida seja utilizada.

## Configuração do Entra ID

### 1. Registrar a SPA

No centro de administração do Microsoft Entra:

1. Acesse **App registrations** e crie ou selecione a aplicação cliente.
2. Em **Authentication**, adicione a plataforma **Single-page application**.
3. Cadastre a URI de redirecionamento:

   ```text
   http://localhost:5173/auth-redirect.html
   ```

4. Não crie nem use um client secret na SPA.

### 2. Configurar a API

No registro da API:

1. Acesse **Expose an API**.
2. Defina o Application ID URI, normalmente `api://<api-client-id>`.
3. Exponha uma permissão delegada, por exemplo `access_as_user`.
4. No registro da SPA, adicione essa permissão em **API permissions**.
5. Conceda consentimento administrativo quando a política do tenant exigir.

Para um ambiente real, prefira registros separados para a SPA e para a API. Isso deixa a audiência e as responsabilidades de cada aplicação mais claras.

## Instalação

```bash
npm install
```

Copie o arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

Em Linux ou macOS:

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
VITE_ENTRA_CLIENT_ID=<client-id-da-spa>
VITE_ENTRA_TENANT_ID=<tenant-id>
VITE_REDIRECT_URI=http://localhost:5173/auth-redirect.html
VITE_API_SCOPE=api://<client-id-da-api>/access_as_user
VITE_API_PATH=/api/protected
```

Inicie o projeto:

```bash
npm run dev
```

Acesse `http://localhost:5173` e selecione **Entrar**. Após a autenticação, a interface apresenta apenas claims úteis para validação, nunca o token bruto.

## API e proxy de desenvolvimento

Se a API local estiver em outro endereço, acrescente ao `.env`:

```env
VITE_API_PROXY_TARGET=http://localhost:3000
```

Durante `npm run dev`, o Vite encaminhará `/api/*` para esse destino. Esse recurso serve apenas para desenvolvimento e não implementa controle de acesso em produção.

A API deve validar, no mínimo:

- assinatura e algoritmo do JWT;
- emissor (`iss`) e tenant esperado;
- audiência (`aud`) da API;
- validade temporal (`exp` e `nbf`);
- escopo delegado (`scp`) ou app role (`roles`) exigido pela rota.

## Uso como proxy SSO

Uma SPA sozinha não protege uma aplicação que pode ser acessada diretamente. Para adicionar SSO a uma aplicação sem suporte nativo, utilize um componente servidor:

```text
Navegador -> reverse proxy ou BFF autenticado -> aplicação interna
```

O proxy deve ser o único caminho de rede até a aplicação, manter uma sessão segura no servidor e rejeitar requisições não autenticadas. O proxy do Vite não deve ser usado para essa finalidade.

## Segurança

- Arquivos `.env` são ignorados pelo Git; somente `.env.example` deve ser versionado.
- Variáveis `VITE_*` são incluídas no código enviado ao navegador. Nunca armazene segredos nelas.
- Client ID e tenant ID não são credenciais, mas permanecem fora do código para facilitar reutilização e evitar expor dados específicos de um ambiente.
- Tokens ficam em `sessionStorage`, reduzindo a persistência após o fechamento da aba, mas proteção contra XSS ainda é obrigatória.
- Não registre tokens, authorization codes ou dados pessoais em logs.
- Use HTTPS e uma Content Security Policy adequada em produção.
- Restrinja as redirect URIs aos endereços realmente utilizados.

Consulte [SECURITY.md](SECURITY.md) antes de publicar ou implantar este modelo.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor local com hot reload |
| `npm run typecheck` | Verificação estática do TypeScript |
| `npm run build` | Validação e build de produção |
| `npm run preview` | Pré-visualização local do build |

## Estrutura

```text
.
├── auth-redirect.html       # retorno dedicado do popup
├── src/
│   ├── auth.ts              # operações MSAL
│   ├── authRedirect.ts      # ponte de retorno do popup
│   ├── main.ts              # interface e chamada da API
│   └── msalConfig.ts        # configuração por ambiente
├── .env.example
└── vite.config.ts
```

## Limitações

Este repositório demonstra autenticação e aquisição de tokens no frontend. Ele não inclui uma API, validação JWT no servidor, persistência de sessão server-side, autorização de negócio nem reverse proxy de produção.

## Contribuição

Contribuições são bem-vindas. Abra uma issue descrevendo o cenário e, ao enviar uma alteração, confirme que `npm run typecheck` e `npm run build` foram executados com sucesso.
