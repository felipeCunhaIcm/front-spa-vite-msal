import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
} from "@azure/msal-browser";
import { getApiRequest, loginRequest, msalConfig } from "./msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

export const initializeAuth = async (): Promise<void> => {
  await msalInstance.initialize();
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (account) msalInstance.setActiveAccount(account);
};

export const getAccount = (): AccountInfo | null => {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null;
  if (account && !msalInstance.getActiveAccount()) msalInstance.setActiveAccount(account);
  return account;
};

export const signIn = async (): Promise<void> => {
  const response = await msalInstance.loginPopup(loginRequest);
  if (!response.account) throw new Error("O Entra ID não retornou uma conta para a aplicação.");
  msalInstance.setActiveAccount(response.account);
};

export const signOut = async (): Promise<void> => {
  const account = getAccount();
  if (account) await msalInstance.logoutPopup({ account });
};

export const getAccessToken = async (): Promise<string> => {
  const account = getAccount();
  if (!account) throw new Error("Nenhuma conta autenticada.");

  const request = { ...getApiRequest(), account };
  try {
    return (await msalInstance.acquireTokenSilent(request)).accessToken;
  } catch (error) {
    if (!(error instanceof InteractionRequiredAuthError)) throw error;
    return (await msalInstance.acquireTokenPopup(request)).accessToken;
  }
};
