import { useState } from 'react';

import { useSiteContent } from '../hooks/useSiteContent.js';

const initialForm = { name: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const { contact } = useSiteContent();
  const labels = contact.form;

  function handleChange(event) {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');

    window.setTimeout(() => {
      setStatus('sent');
      setForm(initialForm);
    }, 450);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          {labels.name}
          <input name="name" value={form.name} onChange={handleChange} minLength="2" required placeholder={labels.namePlaceholder} />
        </label>
        <label>
          {labels.email}
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder={labels.emailPlaceholder} />
        </label>
      </div>
      <label>
        {labels.subject}
        <input name="subject" value={form.subject} onChange={handleChange} minLength="4" required placeholder={labels.subjectPlaceholder} />
      </label>
      <label>
        {labels.message}
        <textarea name="message" value={form.message} onChange={handleChange} minLength="20" required rows="3" placeholder={labels.messagePlaceholder} />
      </label>
      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? labels.sending : labels.send}
        </button>
        {status === 'sent' ? <p className="form-success">{labels.sent}</p> : null}
      </div>
    </form>
  );
}
