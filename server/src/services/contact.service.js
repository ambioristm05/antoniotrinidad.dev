import { ContactMessage } from '../models/ContactMessage.js';

const duplicateWindowMs = 15 * 60 * 1000;

export const saveContactMessage = async ({ name, email, subject, message }) => {
  const normalizedMessage = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  };
  const duplicateSince = new Date(Date.now() - duplicateWindowMs);
  const duplicate = await ContactMessage.findOne({
    email: normalizedMessage.email,
    subject: normalizedMessage.subject,
    message: normalizedMessage.message,
    createdAt: { $gte: duplicateSince },
  });

  if (duplicate) {
    return {
      contactMessage: duplicate,
      created: false,
    };
  }

  const contactMessage = await ContactMessage.create(normalizedMessage);

  return {
    contactMessage,
    created: true,
  };
};
