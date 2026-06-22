export const buildEmailComposeUrl = ({ email = '', subject = '', body = '' } = {}) => {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email.trim(),
    ...(subject.trim() ? { su: subject.trim() } : {}),
    ...(body ? { body } : {}),
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
};
