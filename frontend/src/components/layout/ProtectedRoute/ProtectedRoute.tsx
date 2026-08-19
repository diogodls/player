import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext/AuthContext';

/**
 * Protege rotas autenticadas.
 * Enquanto o estado de auth está sendo verificado (refresh inicial), exibe loading.
 * Se não autenticado, redireciona para /login.
 */
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-dark)',
          color: 'var(--text-muted)',
          fontSize: '1rem',
          gap: '12px',
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            border: '2px solid var(--selected-blue)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        Verificando sessão...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
