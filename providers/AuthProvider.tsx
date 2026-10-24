"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearSession,
  getStoredUser,
  getStoredMembership,
  getToken,
  persistSession,
  setStoredMembership,
  setStoredUser,
  type AuthUser,
  type ActiveMembership,
} from "@/lib/authStorage.util";
import { authApi } from "@/api/services";

interface AuthContextValue {
  user: AuthUser | null;
  membership: ActiveMembership | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, membership?: ActiveMembership | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalMembership: (membership: ActiveMembership | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [membership, setMembership] = useState<ActiveMembership | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
    setMembership(getStoredMembership());
    setHydrated(true);
  }, []);

  const hasToken = Boolean(token);

  // Fetch current me
  const { data: meData, isLoading: isMeLoading, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: hydrated && hasToken,
    retry: false,
  });

  useEffect(() => {
    if (meData?.user) {
      setUser(meData.user);
      setStoredUser(meData.user);
      setMembership(meData.activeMembership);
      setStoredMembership(meData.activeMembership);
    }
  }, [meData]);

  const login = useCallback(
    (nextToken: string, nextUser: AuthUser, nextMembership?: ActiveMembership | null) => {
      persistSession(nextToken, nextUser, nextMembership);
      setToken(nextToken);
      setUser(nextUser);
      setMembership(nextMembership ?? null);
      queryClient.clear();
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    setMembership(null);
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const res = await refetch();
    if (res.data?.user) {
      setUser(res.data.user);
      setMembership(res.data.activeMembership);
      setStoredUser(res.data.user);
      setStoredMembership(res.data.activeMembership);
    }
  }, [refetch]);

  const updateLocalMembership = useCallback((nextMembership: ActiveMembership | null) => {
    setMembership(nextMembership);
    setStoredMembership(nextMembership);
  }, []);

  const value = useMemo(
    () => ({
      user,
      membership,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading: !hydrated || (hasToken && isMeLoading && !user),
      login,
      logout,
      refreshUser,
      updateLocalMembership,
    }),
    [user, membership, token, hydrated, hasToken, isMeLoading, login, logout, refreshUser, updateLocalMembership]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
