import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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
          submit: 'Entrar',
          submitting: 'Verificando...',
          invalid: 'El email o la contraseña no son correctos.',
          genericError: 'No fue posible iniciar sesion. Intenta nuevamente.',
        }
      : {
          eyebrow: 'Private access',
          title: 'Content management',
          description: 'Log in to manage projects, posts and messages.',
          password: 'Password',
          passwordPlaceholder: 'Your password',
          submit: 'Log in',
          submitting: 'Checking...',
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
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              minLength="8"
              placeholder={labels.passwordPlaceholder}
              required
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button--primary" type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? labels.submitting : labels.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
