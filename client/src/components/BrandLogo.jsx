import { Link } from 'react-router-dom';

import { useSiteContent } from '../hooks/useSiteContent.js';

export default function BrandLogo({ as: Component = Link, className = '', showRole = true, to = '/' }) {
  const { nav, profile } = useSiteContent();
  const props = Component === Link ? { to } : {};

  return (
    <Component className={`brand ${className}`.trim()} aria-label={`${profile.siteName}, ${nav.home}`} {...props}>
      <span className="brand__mark">
        <img src={profile.logoUrl} alt="" aria-hidden="true" />
      </span>
      <span className="brand__copy">
        <strong>{profile.siteName}</strong>
        {showRole ? <small>{profile.shortRole}</small> : null}
      </span>
    </Component>
  );
}
