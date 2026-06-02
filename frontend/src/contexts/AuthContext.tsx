import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type LoginPayload, type RegisterCompanyPayload, type RegisterUserPayload } from '@/lib/api/auth.api';
import { clearAuthSession, getRefreshToken, getStoredUser } from '@/lib/api/client';
import { getDashboardPath } from '@/lib/nav';
import type { AuthUser } from '@/types/api';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<string>;
  registerUser: (payload: RegisterUserPayload) => Promise<string>;
  registerCompany: (payload: RegisterCompanyPayload) => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (payload: RegisterUserPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.registerUser(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerCompany = useCallback(async (payload: RegisterCompanyPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.registerCompany(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    } else {
      clearAuthSession();
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      registerUser,
      registerCompany,
      logout,
    }),
    [user, isLoading, login, registerUser, registerCompany, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
