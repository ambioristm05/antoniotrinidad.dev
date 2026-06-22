export const emptyContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

export const contactFormToPayload = (form) => ({
  name: form.name.trim(),
  email: form.email.trim().toLowerCase(),
  subject: form.subject.trim(),
  message: form.message.trim(),
  ...(form.website ? { website: form.website.trim() } : {}),
});
