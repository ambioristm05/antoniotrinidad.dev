import { useEffect, useState } from 'react';
import { Languages, Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function PublicLayout() {
  const { language, theme, setLanguage, toggleTheme } = usePreferences();
  const { controls, nav, profile } = useSiteContent();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nextLanguage = language === 'es' ? 'en' : 'es';
  const activeLanguageLabel = language === 'es' ? controls.spanish : controls.english;
  const nextLanguageLabel = nextLanguage === 'es' ? controls.spanish : controls.english;
  const navItems = [
    { label: nav.home, to: '/' },
    { label: nav.about, to: '/about' },
    { label: nav.projects, to: '/projects' },
    { label: nav.blog, to: '/blog' },
    { label: nav.contact, to: '/contact' },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const closeMenu = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [isMenuOpen]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <BrandLogo />
        <nav id="mobile-navigation" className={`site-nav${isMenuOpen ? ' site-nav--open' : ''}`} aria-label={nav.aria}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <div className="toggle-group" aria-label={controls.languageLabel}>
            <span className="toggle-group__icon" aria-hidden="true">
              <Languages size={17} strokeWidth={2} />
            </span>
            <button
              aria-label={`${controls.languageLabel}: ${activeLanguageLabel}`}
              className={`language-toggle language-toggle--${language}`}
              onClick={() => setLanguage(nextLanguage)}
              title={nextLanguageLabel}
              type="button"
            >
              <span className="language-toggle__track" aria-hidden="true">
                <span className="flag flag--es" />
                <span className="flag flag--en" />
              </span>
            </button>
          </div>
          <button className="icon-toggle" onClick={toggleTheme} type="button" aria-label={controls.themeLabel}>
            {theme === 'light' ? <Moon size={17} strokeWidth={2.1} aria-hidden="true" /> : <Sun size={17} strokeWidth={2.1} aria-hidden="true" />}
            <span className="icon-toggle__label">{theme === 'light' ? controls.dark : controls.light}</span>
          </button>
          <NavLink className="button button--small" to="/contact">
            {nav.primaryCta}
          </NavLink>
          <button
            className="icon-toggle menu-toggle"
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen
                ? language === 'es' ? 'Cerrar menú' : 'Close menu'
                : language === 'es' ? 'Abrir menú' : 'Open menu'
            }
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          >
            {isMenuOpen ? <X size={20} strokeWidth={2.2} aria-hidden="true" /> : <Menu size={20} strokeWidth={2.2} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <BrandLogo className="brand--footer" />
        </div>
        <p className="footer-copy">
          © 2026 <Link to="/">antoniotrinidad.dev</Link>. Todos los derechos reservados.
        </p>
        <div className="footer-links">
          <a className="footer-link" href={profile.github} target="_blank" rel="noreferrer">
            <GitHubIcon />
            <span>GitHub</span>
          </a>
          <a className="footer-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
          <NavLink className="footer-link" to="/privacy">
            <ShieldCheck size={22} strokeWidth={2} aria-hidden="true" />
            <span>{nav.privacy}</span>
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.19-3.37-1.19a2.65 2.65 0 0 0-1.11-1.46c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.14 2.14 0 0 1 .64-1.34c-2.22-.25-4.56-1.11-4.56-4.94a3.86 3.86 0 0 1 1.03-2.68 3.59 3.59 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.48 9.48 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.37.84.4 1.79.1 2.64a3.86 3.86 0 0 1 1.03 2.68c0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M6.94 8.98H3.75V20h3.19V8.98ZM5.35 4a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7ZM20.25 20h-3.18v-5.36c0-1.28-.03-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V20h-3.18V8.98h3.05v1.5h.04a3.35 3.35 0 0 1 3.01-1.65c3.22 0 3.82 2.12 3.82 4.88V20h.27Z" />
    </svg>
  );
}
