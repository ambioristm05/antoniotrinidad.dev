import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, login, status } = useAuth();
  const { meta } = useSiteContent();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/admin';
  usePageMetadata({ title: 'Admin', description: 'Acceso administrativo privado.', path: '/admin/login', noIndex: true });
  const labels =
    meta.code === 'es'
      ? {
          eyebrow: 'Acceso privado',
          title: 'Gestion de contenido',
          description: 'Inicia sesion para administrar proyectos, posts y mensajes.',
          password: 'Password',
          passwordPlaceholder: 'Tu password',
          showPassword: 'Mostrar password',
          hidePassword: 'Ocultar password',
          submit: 'Entrar',
          submitting: 'Verificando...',
          forgotPassword: 'Olvide mi password',
          invalid: 'El email o la contraseña no son correctos.',
          genericError: 'No fue posible iniciar sesion. Intenta nuevamente.',
        }
      : {
          eyebrow: 'Private access',
          title: 'Content management',
          description: 'Log in to manage projects, posts and messages.',
          password: 'Password',
          passwordPlaceholder: 'Your password',
          showPassword: 'Show password',
          hidePassword: 'Hide password',
          submit: 'Log in',
          submitting: 'Checking...',
          forgotPassword: 'Forgot your password?',
          invalid: 'The email or password is incorrect.',
          genericError: 'Unable to log in. Please try again.',
        };

  useEffect(() => {
    if (isAuthenticated) navigate(destination, { replace: true });
  }, [destination, isAuthenticated, navigate]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(form);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.status === 401 ? labels.invalid : labels.genericError);
    }
  };

  return (
    <main className="auth-page" tabIndex="-1">
      <section className="auth-panel">
        <BrandLogo />
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="admin@email.com"
              required
            />
          </label>
          <label>
            {labels.password}
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                minLength="8"
                placeholder={labels.passwordPlaceholder}
                required
              />
              <button
                className="password-field__toggle"
                type="button"
                aria-label={showPassword ? labels.hidePassword : labels.showPassword}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </span>
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button--primary" type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? labels.submitting : labels.submit}
          </button>
          <Link className="auth-link" to="/admin/reset-password">
            {labels.forgotPassword}
          </Link>
        </form>
      </section>
    </main>
  );
}
