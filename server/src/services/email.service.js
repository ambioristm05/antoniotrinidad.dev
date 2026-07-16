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
