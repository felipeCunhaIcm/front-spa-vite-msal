import "./styles.css";
import { getAccount, getAccessToken, initializeAuth, signIn, signOut } from "./auth";
import { apiPath } from "./msalConfig";

const statusEl = document.querySelector<HTMLPreElement>("#status")!;
const signinBtn = document.querySelector<HTMLButtonElement>("#signinBtn")!;
const signoutBtn = document.querySelector<HTMLButtonElement>("#signoutBtn")!;
const callApiBtn = document.querySelector<HTMLButtonElement>("#callApiBtn")!;

const show = (message: string) => (statusEl.textContent = message);
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

const accountDetails = () => {
  const account = getAccount();
  if (!account) return "Nenhum usuário autenticado.";

  const claims = account.idTokenClaims as Record<string, unknown> | undefined;
  const expiration = typeof claims?.exp === "number"
    ? new Date(claims.exp * 1000).toLocaleString("pt-BR")
    : "não informada";

  return JSON.stringify({
    status: "Autenticação concluída",
    nome: account.name,
    usuario: account.username,
    tenantId: account.tenantId,
    emissor: claims?.iss,
    audiencia: claims?.aud,
    expiraEm: expiration,
    roles: claims?.roles,
  }, null, 2);
};

const refreshUi = () => {
  const account = getAccount();
  signinBtn.disabled = Boolean(account);
  signoutBtn.disabled = !account;
  callApiBtn.disabled = !account;
  show(accountDetails());
};

signinBtn.addEventListener("click", async () => {
  show("Abrindo login...");
  try {
    await signIn();
    refreshUi();
  } catch (error) {
    show(`Erro ao autenticar: ${errorMessage(error)}`);
  }
});

signoutBtn.addEventListener("click", async () => {
  show("Saindo...");
  try {
    await signOut();
    refreshUi();
  } catch (error) {
    show(`Erro ao sair: ${errorMessage(error)}`);
  }
});

callApiBtn.addEventListener("click", async () => {
  show("Adquirindo token e chamando API...");
  try {
    const token = await getAccessToken();
    const response = await fetch(apiPath, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    show(`Resposta da API: ${await response.text()}`);
  } catch (error) {
    show(`Erro ao chamar API: ${errorMessage(error)}`);
  }
});

const start = async () => {
  try {
    await initializeAuth();
    refreshUi();
  } catch (error) {
    signinBtn.disabled = true;
    show(`Erro de configuração: ${errorMessage(error)}`);
  }
};

void start();
