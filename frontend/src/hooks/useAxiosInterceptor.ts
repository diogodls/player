import { useEffect, useRef } from 'react';
import { apiClient } from '../services/auth';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { useNavigate } from 'react-router';

/**
 * Configura interceptors Axios globais:
 * - Request: injeta o access token atual no header Authorization
 * - Response: em 401, tenta refresh silencioso e reexecuta a request original
 *
 * Deve ser chamado uma única vez dentro do componente App (já autenticado).
 */
export function useAxiosInterceptor() {
  const { getValidToken, logout } = useAuth();
  const navigate = useNavigate();
  const interceptorsRef = useRef<{ req: number; res: number } | null>(null);

  useEffect(() => {
    const reqInterceptor = apiClient.interceptors.request.use(async (config) => {
      const token = await getValidToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    const resInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await getValidToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
          // Refresh falhou — redireciona para login
          await logout();
          navigate('/login');
        }
        return Promise.reject(error);
      },
    );

    interceptorsRef.current = { req: reqInterceptor, res: resInterceptor };

    return () => {
      apiClient.interceptors.request.eject(reqInterceptor);
      apiClient.interceptors.response.eject(resInterceptor);
    };
  }, [getValidToken, logout, navigate]);
}
