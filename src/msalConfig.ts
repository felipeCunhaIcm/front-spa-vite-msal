import type { Configuration, PopupRequest, SilentRequest } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID?.trim();
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID?.trim();
const redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth-redirect.html`;

if (!clientId || !tenantId) {
  throw new Error("Configure VITE_ENTRA_CLIENT_ID e VITE_ENTRA_TENANT_ID no arquivo .env.");
}

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

// Login (OIDC) e autorização da API são pedidos separados de propósito.
export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile"],
};

export const getApiRequest = (): Omit<SilentRequest, "account"> => {
  const scope = import.meta.env.VITE_API_SCOPE?.trim();
  if (!scope) throw new Error("Configure VITE_API_SCOPE para chamar a API protegida.");
  return { scopes: [scope] };
};

export const apiPath = import.meta.env.VITE_API_PATH || "/api/protected";
