import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { readCookieConsent, saveCookieConsent } from '../services/cookieConsent.js';

const copyByLanguage = {
  es: {
    title: 'Preferencias de cookies',
    description: 'Usamos almacenamiento esencial para recordar el idioma, el tema y tu decisión. No usamos cookies publicitarias.',
    policy: 'Ver política de privacidad y cookies',
    accept: 'Aceptar',
    reject: 'Rechazar',
  },
  en: {
    title: 'Cookie preferences',
    description: 'We use essential storage to remember the language, theme and your choice. We do not use advertising cookies.',
    policy: 'View privacy and cookie policy',
    accept: 'Accept',
    reject: 'Reject',
  },
};

export default function CookieConsentBanner() {
  const { language } = usePreferences();
  const [consent, setConsent] = useState(() => readCookieConsent());
  const labels = copyByLanguage[language] ?? copyByLanguage.es;

  if (consent) return null;

  const choose = (value) => setConsent(saveCookieConsent(value));

  return (
    <section className="cookie-banner" aria-labelledby="cookie-banner-title" role="dialog">
      <div className="cookie-banner__content">
        <Cookie aria-hidden="true" size={24} />
        <div>
          <strong id="cookie-banner-title">{labels.title}</strong>
          <p>{labels.description}</p>
          <Link to="/privacy#cookies">{labels.policy}</Link>
        </div>
      </div>
      <div className="cookie-banner__actions">
        <button className="button button--secondary button--small" onClick={() => choose('rejected')} type="button">
          {labels.reject}
        </button>
        <button className="button button--primary button--small" onClick={() => choose('accepted')} type="button">
          {labels.accept}
        </button>
      </div>
    </section>
  );
}
