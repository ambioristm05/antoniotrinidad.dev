import { useSiteContent } from '../hooks/useSiteContent.js';

const messages = [
  { name: 'Laura Perez', subject: 'MVP para servicios', status: 'unread' },
  { name: 'Carlos Diaz', subject: 'Revision de dashboard', status: 'read' },
  { name: 'Equipo Studio', subject: 'Colaboracion frontend', status: 'archived' },
];

export default function AdminMessagesPage() {
  const { meta } = useSiteContent();
  const labels = meta.code === 'es' ? { eyebrow: 'Contacto', title: 'Mensajes recibidos' } : { eyebrow: 'Contact', title: 'Received messages' };

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
        </div>
      </div>
      <div className="admin-list admin-list--wide">
        {messages.map((message) => (
          <article key={message.subject}>
            <span>{message.status}</span>
            <strong>{message.subject}</strong>
            <small>{message.name}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
