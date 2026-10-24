export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isSuperAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveMembership {
  id: string;
  messId: string;
  role: 'MANAGER' | 'MEMBER';
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: string;
  mess: {
    id: string;
    name: string;
    inviteCode: string;
    managerId: string;
  };
}

const ACCESS_TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const MEMBERSHIP_KEY = "auth_active_membership";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredMembership(): ActiveMembership | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MEMBERSHIP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveMembership;
  } catch {
    return null;
  }
}

export function setStoredMembership(membership: ActiveMembership | null): void {
  if (typeof window === "undefined") return;
  if (!membership) {
    localStorage.removeItem(MEMBERSHIP_KEY);
  } else {
    localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(membership));
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MEMBERSHIP_KEY);
}

export function persistSession(token: string, user: AuthUser, membership?: ActiveMembership | null): void {
  setToken(token);
  setStoredUser(user);
  if (membership !== undefined) {
    setStoredMembership(membership);
  }
}
