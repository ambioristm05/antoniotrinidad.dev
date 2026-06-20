import BrandLogo from '../components/BrandLogo.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminLoginPage() {
  const { meta } = useSiteContent();
  const labels =
    meta.code === 'es'
      ? {
          eyebrow: 'Acceso privado',
          title: 'Gestion de contenido',
          description: 'Login visual listo para conectar al endpoint `/api/auth/login`.',
          password: 'Password',
          passwordPlaceholder: 'Tu password',
          submit: 'Entrar',
        }
      : {
          eyebrow: 'Private access',
          title: 'Content management',
          description: 'Visual login ready to connect to the `/api/auth/login` endpoint.',
          password: 'Password',
          passwordPlaceholder: 'Your password',
          submit: 'Log in',
        };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <BrandLogo />
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
        <form className="contact-form">
          <label>
            Email
            <input type="email" placeholder="admin@email.com" required />
          </label>
          <label>
            {labels.password}
            <input type="password" placeholder={labels.passwordPlaceholder} required />
          </label>
          <button className="button button--primary" type="submit">
            {labels.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
