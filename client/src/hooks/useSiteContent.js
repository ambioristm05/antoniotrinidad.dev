import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { getSiteContent } from '../data/siteContent.js';

export function useSiteContent() {
  const { language } = usePreferences();

  return getSiteContent(language);
}
