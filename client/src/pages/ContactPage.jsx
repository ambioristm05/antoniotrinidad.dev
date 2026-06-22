import ContactForm from '../components/ContactForm.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { buildEmailComposeUrl } from '../services/emailLinks.js';

export default function ContactPage() {
  const { contact, profile } = useSiteContent();
  usePageMetadata({ title: contact.eyebrow, description: contact.description, path: '/contact' });

  return (
    <section className="page-section">
      <SectionHeader
        as="h1"
        eyebrow={contact.eyebrow}
        title={contact.title}
        description={contact.description}
      />
      <div className="split-layout split-layout--contact">
        <ContactForm />
        <aside className="contact-aside">
          <h2>{contact.asideTitle}</h2>
          <p>{profile.location}</p>
          <a href={buildEmailComposeUrl({ email: profile.email })} rel="noreferrer" target="_blank">{profile.email}</a>
          <div className="clean-list">
            <p>{contact.responseTime}</p>
            <p>{contact.bestWith}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
