import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { loginRequest, logoutRequest, refreshRequest } from '../../services/auth';

type AuthUser = {
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Obtém um access token válido, renovando silenciosamente se necessário */
  getValidToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

// Decodifica o payload de um JWT sem verificação (somente no cliente, apenas para ler email/exp)
function decodeJwt(token: string): { sub: string; email: string; exp: number } | null {
  try {
    const base64Payload = token.split('.')[1];
    const json = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { sub: string; email: string; exp: number };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  // Considera expirado 30s antes para evitar race conditions
  return Date.now() / 1000 >= payload.exp - 30;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const applyToken = useCallback((token: string) => {
    const payload = decodeJwt(token);
    setAccessToken(token);
    setUser(payload ? { email: payload.email } : null);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Tenta renovar o token silenciosamente ao carregar a página
  useEffect(() => {
    let cancelled = false;
    refreshRequest()
      .then((token) => {
        if (!cancelled) applyToken(token);
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyToken, clearAuth]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const token = await loginRequest(email, senha);
      applyToken(token);
    },
    [applyToken],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  /**
   * Retorna um access token válido.
   * Se o token atual estiver expirado, executa um refresh (deduplicado se já em andamento).
   */
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }
    const promise = refreshRequest()
      .then((token) => {
        applyToken(token);
        return token;
      })
      .catch(() => {
        clearAuth();
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });
    refreshPromiseRef.current = promise;
    return promise;
  }, [accessToken, applyToken, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, getValidToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
