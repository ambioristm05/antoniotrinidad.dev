import { useState } from 'react';
import { Link } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { api } from '../services/api.js';
import { contactFormToPayload, emptyContactForm } from '../services/contactForm.js';

export default function ContactForm() {
  const [form, setForm] = useState(emptyContactForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const { language } = usePreferences();
  const { contact } = useSiteContent();
  const labels = contact.form;
  const copy = language === 'es'
    ? { sent: 'Tu mensaje fue enviado correctamente.', error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.', website: 'Sitio web', consentBefore: 'Acepto la ', consentLink: 'política de privacidad y cookies', consentAfter: '.' }
    : { sent: 'Your message was sent successfully.', error: 'The message could not be sent. Please try again.', website: 'Website', consentBefore: 'I accept the ', consentLink: 'privacy and cookie policy', consentAfter: '.' };

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    if (status !== 'sending') {
      setStatus('idle');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      await api.sendMessage(contactFormToPayload(form));
      setForm(emptyContactForm);
      setPrivacyConsent(false);
      setStatus('sent');
    } catch (requestError) {
      setError(requestError.message || copy.error);
      setStatus('error');
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">{copy.website}</label>
        <input autoComplete="off" id="contact-website" name="website" onChange={handleChange} tabIndex="-1" value={form.website} />
      </div>
      <div className="form-grid">
        <label>
          {labels.name}
          <input autoComplete="name" maxLength="100" minLength="2" name="name" onChange={handleChange} placeholder={labels.namePlaceholder} required value={form.name} />
        </label>
        <label>
          {labels.email}
          <input autoComplete="email" maxLength="254" name="email" onChange={handleChange} placeholder={labels.emailPlaceholder} required type="email" value={form.email} />
        </label>
      </div>
      <label>
        {labels.subject}
        <input maxLength="160" minLength="3" name="subject" onChange={handleChange} placeholder={labels.subjectPlaceholder} required value={form.subject} />
      </label>
      <label>
        {labels.message}
        <textarea maxLength="3000" minLength="10" name="message" onChange={handleChange} placeholder={labels.messagePlaceholder} required rows="5" value={form.message} />
      </label>
      <div className="form-actions contact-form__actions">
        <label className="contact-consent">
          <input
            checked={privacyConsent}
            onChange={(event) => setPrivacyConsent(event.target.checked)}
            required
            type="checkbox"
          />
          <span>
            {copy.consentBefore}
            <Link to="/privacy#cookies">{copy.consentLink}</Link>
            {copy.consentAfter}
          </span>
        </label>
        <button className="button button--primary" disabled={status === 'sending'} type="submit">
          {status === 'sending' ? labels.sending : labels.send}
        </button>
        {status === 'sent' && <p className="form-success" role="status">{copy.sent}</p>}
        {status === 'error' && <p className="form-error" role="alert">{error}</p>}
      </div>
    </form>
  );
}
