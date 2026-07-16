import { useEffect, useState } from 'react';
import { Download, Languages, Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import CookieConsentBanner from '../components/CookieConsentBanner.jsx';
import { FacebookIcon, GitHubIcon, LinkedInIcon } from '../components/SocialIcons.jsx';
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
      <a className="skip-link" href="#main-content">
        {language === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
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

      <main id="main-content" tabIndex="-1">
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
          <a className="footer-link" href={profile.facebook} target="_blank" rel="noreferrer">
            <FacebookIcon />
            <span>Facebook</span>
          </a>
          <a className="footer-link" href={profile.resumeUrl} download>
            <Download size={22} strokeWidth={2} aria-hidden="true" />
            <span>{nav.resume}</span>
          </a>
          <NavLink className="footer-link" to="/privacy">
            <ShieldCheck size={22} strokeWidth={2} aria-hidden="true" />
            <span>{nav.privacy}</span>
          </NavLink>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  );
}
