const legacyTokenKeys = ["token", "authToken", "techcare_token"] as const;
const authRoles = ["ADMIN", "AGENT", "CUSTOMER"] as const;
type AuthRole = (typeof authRoles)[number];

function getSessionRole(): AuthRole | null {
  const savedRole = sessionStorage.getItem("authRole");
  const role = authRoles.find((authRole) => authRole === savedRole);
  if (role) return role;

  const savedUser = sessionStorage.getItem("user");
  if (!savedUser) return null;
  try {
    const user: unknown = JSON.parse(savedUser);
    if (typeof user !== "object" || user === null || !("role" in user)) return null;
    const userRole = authRoles.find((authRole) => authRole === user.role);
    if (userRole) sessionStorage.setItem("authRole", userRole);
    return userRole ?? null;
  } catch {
    return null;
  }
}

function getPortalRole(): AuthRole | null {
  const routeRole = window.location.pathname.split("/")[1]?.toUpperCase();
  return authRoles.find((role) => role === routeRole) ?? null;
}

export function getAuthToken(): string | null {
  for (const key of legacyTokenKeys) {
    localStorage.removeItem(key);
  }

  const sessionRole = getSessionRole();
  const portalRole = getPortalRole();
  if (sessionRole && portalRole && sessionRole !== portalRole) return null;

  const role = sessionRole ?? portalRole;
  if (!role) return null;

  const token =
    (sessionRole ? sessionStorage.getItem("token") : null) ||
    localStorage.getItem(`token:${role}`);
  if (token && !sessionRole) {
    sessionStorage.setItem("authRole", role);
    sessionStorage.setItem("token", token);
  }
  return token;
}

export function setAuthToken(token: string, role: AuthRole): void {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("authRole", role);
  localStorage.setItem(`token:${role}`, token);
  for (const key of legacyTokenKeys) {
    localStorage.removeItem(key);
  }
}

export function clearAuthToken(): void {
  const role = getSessionRole() ?? getPortalRole();
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("authRole");
  if (role) localStorage.removeItem(`token:${role}`);
  for (const key of legacyTokenKeys) {
    localStorage.removeItem(key);
  }
}
