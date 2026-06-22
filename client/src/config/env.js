const normalizeUrl = (value, variableName) => {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported protocol');
    }

    return value.replace(/\/+$/, '');
  } catch {
    throw new Error(`${variableName} must be a valid HTTP or HTTPS URL`);
  }
};

export const env = {
  apiUrl: normalizeUrl(import.meta.env?.VITE_API_URL || 'http://localhost:5000/api', 'VITE_API_URL'),
  siteUrl: normalizeUrl(import.meta.env?.VITE_SITE_URL || 'https://www.antoniotrinidad.dev', 'VITE_SITE_URL'),
};
