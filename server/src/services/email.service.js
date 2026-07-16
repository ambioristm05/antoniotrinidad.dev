import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const resendEndpoint = 'https://api.resend.com/emails';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const sendPasswordResetEmail = async ({ to, resetUrl, expiresInMinutes }) => {
  if (!env.email.enabled) {
    throw new AppError('Email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM.', 503);
  }

  const safeResetUrl = escapeHtml(resetUrl);
  const safeMinutes = escapeHtml(expiresInMinutes);
  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.email.from,
      to: [to],
      subject: 'Recupera tu acceso al panel de Antonio Trinidad',
      html: `
        <p>Recibimos una solicitud para restablecer tu contrasena de administrador.</p>
        <p>Usa este enlace dentro de los proximos ${safeMinutes} minutos:</p>
        <p><a href="${safeResetUrl}">Restablecer contrasena</a></p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
      text: [
        'Recibimos una solicitud para restablecer tu contrasena de administrador.',
        `Usa este enlace dentro de los proximos ${expiresInMinutes} minutos:`,
        resetUrl,
        'Si no solicitaste este cambio, puedes ignorar este correo.',
      ].join('\n\n'),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.message || payload?.error || 'Password reset email could not be sent', 502);
  }

  return payload;
};

export const sendContactNotificationEmail = async ({ email, message, name, subject }) => {
  if (!env.email.enabled) {
    throw new AppError('Email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM.', 503);
  }

  const recipient = env.email.contactTo || env.adminEmail;

  if (!recipient) {
    throw new AppError('Contact notification email is not configured. Add CONTACT_NOTIFICATION_EMAIL or ADMIN_EMAIL.', 503);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.email.from,
      to: [recipient],
      reply_to: email,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      html: `
        <h2>Nuevo mensaje desde el portafolio</h2>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Asunto:</strong> ${safeSubject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${safeMessage}</p>
      `,
      text: [
        'Nuevo mensaje desde el portafolio',
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Asunto: ${subject}`,
        '',
        message,
      ].join('\n'),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.message || payload?.error || 'Contact notification email could not be sent', 502);
  }

  return payload;
};
