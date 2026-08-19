import { useState, useId } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRightToBracket,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import styles from './Login.module.scss';
import logo from '../../assets/logoo.png';

const Login = () => {
  const emailId = useId();
  const senhaId = useId();
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Já autenticado → redireciona
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setError('Preencha o email e a senha.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), senha);
      navigate('/', { replace: true });
    } catch {
      setError('Email ou senha inválidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Fundo com partículas de gradiente animadas */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <main className={styles.card}>
        <header className={styles.header}>
          <img src={logo} alt="Logo Player" className={styles.logo} />
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>Faça login para acessar o painel</p>
        </header>

        <form id="login-form" onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor={emailId} className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
              <input
                id={emailId}
                type="email"
                className={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={senhaId} className={styles.label}>
              Senha
            </label>
            <div className={styles.inputWrapper}>
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              <input
                id={senhaId}
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {error && (
            <div id="login-error" role="alert" className={styles.error}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                Entrando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faArrowRightToBracket} />
                Entrar
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
