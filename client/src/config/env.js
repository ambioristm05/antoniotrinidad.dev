const normalizeApiUrl = (value) => {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported protocol');
    }

    return value.replace(/\/+$/, '');
  } catch {
    throw new Error('VITE_API_URL must be a valid HTTP or HTTPS URL');
  }
};

export const env = {
  apiUrl: normalizeApiUrl(import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'),
};
