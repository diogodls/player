import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Sobe o scroll para o topo sempre que a rota mudar.
 * Deve ser chamado uma única vez dentro de um componente
 * que vive dentro do BrowserRouter.
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
}
