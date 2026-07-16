import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import FormNotice from '../components/FormNotice.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';

export default function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [localResetUrl, setLocalResetUrl] = useState('');
  const { meta } = useSiteContent();
  const isResetMode = Boolean(token);

  usePageMetadata({
    title: 'Recuperar password',
    description: 'Recuperacion de acceso administrativo.',
    path: '/admin/reset-password',
    noIndex: true,
  });

  const labels =
    meta.code === 'es'
      ? {
          eyebrow: 'Acceso privado',
          requestTitle: 'Recuperar password',
          requestDescription: 'Escribe el email del admin y prepararemos un enlace temporal para cambiar la contraseña.',
          resetTitle: 'Nueva contraseña',
          resetDescription: 'Crea una nueva contraseña para volver a entrar al panel.',
          email: 'Email',
          emailPlaceholder: 'admin@email.com',
          password: 'Nuevo password',
          confirmPassword: 'Confirmar password',
          passwordPlaceholder: 'Minimo 8 caracteres',
          showPassword: 'Mostrar password',
          hidePassword: 'Ocultar password',
          requestSubmit: 'Enviar enlace',
          resetSubmit: 'Cambiar password',
          submitting: 'Procesando...',
          backToLogin: 'Volver al login',
          requestSuccess: 'Si ese email pertenece a un admin, el enlace de recuperacion fue preparado.',
          resetSuccess: 'Password actualizado. Ya puedes entrar con la nueva contraseña.',
          localLink: 'Enlace local de recuperacion',
          mismatch: 'Los passwords no coinciden.',
          genericError: 'No fue posible completar la solicitud. Intenta nuevamente.',
          invalidToken: 'El enlace de recuperacion no es valido o expiro.',
        }
      : {
          eyebrow: 'Private access',
          requestTitle: 'Recover password',
          requestDescription: 'Enter the admin email and we will prepare a temporary link to change the password.',
          resetTitle: 'New password',
          resetDescription: 'Create a new password to get back into the dashboard.',
          email: 'Email',
          emailPlaceholder: 'admin@email.com',
          password: 'New password',
          confirmPassword: 'Confirm password',
          passwordPlaceholder: 'Minimum 8 characters',
          showPassword: 'Show password',
          hidePassword: 'Hide password',
          requestSubmit: 'Send link',
          resetSubmit: 'Change password',
          submitting: 'Processing...',
          backToLogin: 'Back to login',
          requestSuccess: 'If that email belongs to an admin, a reset link has been prepared.',
          resetSuccess: 'Password updated. You can now log in with the new password.',
          localLink: 'Local reset link',
          mismatch: 'Passwords do not match.',
          genericError: 'Unable to complete the request. Please try again.',
          invalidToken: 'The reset link is invalid or has expired.',
        };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    setLocalResetUrl('');

    try {
      const response = await api.requestPasswordReset({ email });
      setNotice(labels.requestSuccess);
      setLocalResetUrl(response.data?.resetUrl || '');
    } catch {
      setError(labels.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password !== passwordConfirmation) {
      setError(labels.mismatch);
      return;
    }

    setSubmitting(true);

    try {
      await api.resetPassword({ token, password });
      setPassword('');
      setPasswordConfirmation('');
      setNotice(labels.resetSuccess);
    } catch (requestError) {
      setError(requestError.status === 400 ? labels.invalidToken : labels.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" tabIndex="-1">
      <section className="auth-panel">
        <BrandLogo />
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{isResetMode ? labels.resetTitle : labels.requestTitle}</h1>
          <p>{isResetMode ? labels.resetDescription : labels.requestDescription}</p>
        </div>

        {isResetMode ? (
          <form className="contact-form" onSubmit={handleResetSubmit}>
            <label>
              {labels.password}
              <span className="password-field">
                <input
                  autoComplete="new-password"
                  minLength="8"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={labels.passwordPlaceholder}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? labels.hidePassword : labels.showPassword}
                  aria-pressed={showPassword}
                  className="password-field__toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </span>
            </label>
            <label>
              {labels.confirmPassword}
              <input
                autoComplete="new-password"
                minLength="8"
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                placeholder={labels.passwordPlaceholder}
                required
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirmation}
              />
            </label>
            {notice ? <FormNotice>{notice}</FormNotice> : null}
            {error ? <FormNotice type="error">{error}</FormNotice> : null}
            <button className="button button--primary" disabled={submitting || Boolean(notice)} type="submit">
              {submitting ? labels.submitting : labels.resetSubmit}
            </button>
            <Link className="auth-link" to="/admin/login">{labels.backToLogin}</Link>
          </form>
        ) : (
          <form className="contact-form" onSubmit={handleRequestSubmit}>
            <label>
              {labels.email}
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={labels.emailPlaceholder}
                required
                type="email"
                value={email}
              />
            </label>
            {notice ? <FormNotice>{notice}</FormNotice> : null}
            {localResetUrl ? <a className="auth-dev-link" href={localResetUrl}>{labels.localLink}</a> : null}
            {error ? <FormNotice type="error">{error}</FormNotice> : null}
            <button className="button button--primary" disabled={submitting} type="submit">
              {submitting ? labels.submitting : labels.requestSubmit}
            </button>
            <Link className="auth-link" to="/admin/login">{labels.backToLogin}</Link>
          </form>
        )}
      </section>
    </main>
  );
}
