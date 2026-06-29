const sharedProfile = {
  name: 'Antonio Trinidad Mercedes',
  siteName: 'antoniotrinidad.dev',
  logoUrl: '/favicon.svg',
  logoWideUrl: '/brand/antonio-trinidad-logo.png',
  email: 'hi@antoniotrinidad.dev',
  github: 'https://github.com/ambioristm05',
  linkedin: 'https://www.linkedin.com/in/antoniotrinidad/',
  resumeUrl: '/Antonio-Trinidad-CV.pdf',
};

const sampleAvatarUrls = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
];

const projectBase = [
  { id: '1', slug: 'panel-operativo-servicios', featured: true, technologies: ['React', 'Express', 'MongoDB', 'JWT'], imageUrl: '/projects/operations-panel.svg' },
  { id: '2', slug: 'blog-tecnico-cms', featured: true, technologies: ['React', 'Node.js', 'Markdown', 'MongoDB'], imageUrl: '/projects/cms-blog.svg' },
  { id: '3', slug: 'landing-captacion-medible', featured: true, technologies: ['Vite', 'React', 'CSS', 'Forms API'], imageUrl: '/projects/lead-landing.svg' },
  { id: '4', slug: 'api-automatizacion-contenido', featured: true, technologies: ['Node.js', 'Express', 'MongoDB', 'Webhooks'], imageUrl: '/projects/api-automation.svg' },
].map((project) => ({ ...project, liveUrl: 'https://example.com', repoUrl: 'https://github.com/' }));

const projectsEs = [
  { title: 'Panel Operativo para Servicios', summary: 'Dashboard para seguimiento de clientes, tickets y métricas internas con filtros rápidos.', description: 'Una interfaz enfocada en la lectura rápida de información operativa para reducir el trabajo manual del equipo.', category: 'SaaS', status: 'En producción', results: ['35% menos tiempo de seguimiento', 'Flujos de soporte centralizados', 'Panel administrativo con roles'], challenge: 'Unificar datos dispersos sin saturar la pantalla principal.', solution: 'Diseñé una vista por prioridades con filtros persistentes y acciones visibles por contexto.', imageAlt: 'Vista previa de un panel operativo con métricas y tareas.' },
  { title: 'Blog Técnico con CMS', summary: 'Sistema editorial con posts, categorías, etiquetas, búsqueda y borradores.', description: 'Un blog pensado para publicar aprendizajes técnicos con buen rendimiento y administración privada.', category: 'Contenido', status: 'MVP', results: ['Editor simple para borradores', 'SEO básico por artículo', 'Búsqueda por texto y etiquetas'], challenge: 'Mantener una experiencia editorial simple sin perder control técnico.', solution: 'Separé contenido, metadatos y estado de publicación para escalar el flujo.', imageAlt: 'Vista previa de un CMS para blog técnico.' },
  { title: 'Landing de Captación Medible', summary: 'Página enfocada en conversión con formulario, analítica y carga rápida.', description: 'Sitio de una página para validar una oferta, capturar leads y medir conversiones.', category: 'Marketing', status: 'Caso de estudio', results: ['LCP por debajo de 2s', 'Formulario con validación', 'Lectura móvil optimizada'], challenge: 'Explicar una oferta técnica sin convertir la página en folleto.', solution: 'Usé jerarquía directa, pruebas sociales y llamadas a la acción visibles.', imageAlt: 'Vista previa de una landing page orientada a conversión.' },
  { title: 'API de Automatización de Contenido', summary: 'Backend para recibir formularios, disparar webhooks y organizar mensajes.', description: 'Una API para conectar formularios públicos con procesos privados, notificaciones y seguimiento.', category: 'Backend', status: 'Prototipo', results: ['Webhooks listos para integrar', 'Validación compartida', 'Mensajes ordenados por estado'], challenge: 'Conectar entradas de usuario con acciones internas sin trabajo manual.', solution: 'Diseñé endpoints claros, estados persistentes y puntos de integración.', imageAlt: 'Vista previa de un flujo de automatización backend.' },
];

const projectsEn = [
  { title: 'Operations Panel for Services', summary: 'Dashboard for tracking clients, tickets and internal metrics with quick filters.', description: 'An interface focused on fast reading of operational information to reduce manual work.', category: 'SaaS', status: 'In production', results: ['35% less tracking time', 'Centralized support flows', 'Role-based admin panel'], challenge: 'Unify scattered data without overcrowding the main screen.', solution: 'I designed a priority-based view with persistent filters and contextual actions.', imageAlt: 'Preview of an operations dashboard with metrics and tasks.' },
  { title: 'Technical Blog with CMS', summary: 'Editorial system with posts, categories, tags, search and drafts.', description: 'A blog designed to publish technical learnings with strong performance and private administration.', category: 'Content', status: 'MVP', results: ['Simple draft editor', 'Basic SEO per article', 'Search by text and tags'], challenge: 'Keep the editorial experience simple without losing technical control.', solution: 'I separated content, metadata and publishing status so the workflow can scale.', imageAlt: 'Preview of a CMS for a technical blog.' },
  { title: 'Measurable Lead Capture Landing', summary: 'Conversion-focused page with form, analytics and fast loading.', description: 'A one-page site for validating an offer, capturing leads and measuring conversions.', category: 'Marketing', status: 'Case study', results: ['LCP below 2s', 'Validated form', 'Mobile reading optimized'], challenge: 'Explain a technical offer without turning the page into a brochure.', solution: 'I used direct hierarchy, trust signals and visible calls to action.', imageAlt: 'Preview of a conversion-focused landing page.' },
  { title: 'Content Automation API', summary: 'Backend for receiving forms, triggering webhooks and organizing messages.', description: 'An API connecting public forms with private processes, notifications and tracking.', category: 'Backend', status: 'Prototype', results: ['Webhook-ready integrations', 'Shared validation', 'Messages organized by state'], challenge: 'Connect user input with internal actions without manual work.', solution: 'I designed clear endpoints, persistent states and integration points.', imageAlt: 'Preview of a backend automation flow.' },
];

const postBase = [
  ['1', 'estructurar-mvp-mern-sin-deuda', '2026-06-10', 6, true, '/blog/mern-mvp.svg'],
  ['2', 'patrones-ui-dashboards-diarios', '2026-06-04', 5, true, '/blog/dashboard-ui.svg'],
  ['3', 'validacion-compartida-frontend-backend', '2026-05-28', 4, true, '/blog/shared-validation.svg'],
  ['4', 'autenticacion-jwt-sesiones-mern', '2026-06-14', 7, false, '/blog/shared-validation.svg'],
  ['5', 'formularios-react-validacion-ux', '2026-06-12', 5, false, '/blog/dashboard-ui.svg'],
  ['6', 'mongo-modelos-escalables', '2026-06-08', 6, false, '/blog/mern-mvp.svg'],
  ['7', 'apis-rest-limpias-node-express', '2026-06-01', 5, false, '/blog/shared-validation.svg'],
  ['8', 'performance-react-vite', '2026-05-24', 4, false, '/blog/dashboard-ui.svg'],
  ['9', 'deploy-mern-produccion', '2026-05-18', 6, false, '/blog/mern-mvp.svg'],
].map(([id, slug, publishedAt, readingTime, featured, imageUrl]) => ({ id, slug, publishedAt, readingTime, featured, imageUrl }));

const postsEs = [
  ['Como estructurar un MVP MERN sin crear deuda desde el día uno', 'Una guía práctica para separar responsabilidades, validar el dominio y preparar el proyecto para crecer.', 'Un MVP sano es una versión enfocada que permite aprender rápido sin cerrar puertas técnicas. La clave está en mantener límites claros entre modelos, rutas, validaciones, servicios y la interfaz.', 'Arquitectura', ['MERN', 'MVP', 'Arquitectura']],
  ['Patrones de UI para dashboards que se usan todos los días', 'Decisiones visuales para interfaces densas que deben sentirse rápidas y confiables.', 'Un dashboard operativo debe favorecer comparación, búsqueda y acción. Las tablas legibles, filtros estables y rutas cortas mejoran el trabajo diario.', 'Frontend', ['UI', 'React', 'Dashboards']],
  ['Validación compartida entre frontend y backend', 'Cómo pensar reglas de datos para formularios, APIs y mensajes de error coherentes.', 'El frontend ayuda a responder rápido y el backend protege la integridad. Cuando ambas capas usan criterios equivalentes, los errores son más claros.', 'Backend', ['Validación', 'API', 'Formularios']],
  ['Autenticación JWT y sesiones en aplicaciones MERN', 'Una mirada práctica a tokens, expiración, refresh y rutas protegidas.', 'Una implementación confiable considera expiración, renovación, almacenamiento seguro y la experiencia cuando una sesión vence.', 'Backend', ['JWT', 'Seguridad', 'MERN']],
  ['Formularios React con validación y buena experiencia', 'Patrones para formularios claros, mensajes útiles y estados que reducen fricción.', 'Validar temprano, mostrar errores cerca del campo y preservar el progreso hace que la interfaz se sienta más confiable.', 'Frontend', ['React', 'Formularios', 'UX']],
  ['Modelos de MongoDB que pueden crecer', 'Decisiones simples para esquemas, relaciones y consultas antes de escalar.', 'Conviene pensar en consultas frecuentes, duplicación controlada, índices y límites claros entre entidades.', 'Base de datos', ['MongoDB', 'Mongoose', 'Datos']],
  ['APIs REST limpias con Node y Express', 'Organización de rutas, controladores, servicios y errores para APIs mantenibles.', 'Separar rutas, controladores, servicios y validaciones ayuda a cambiar el producto sin convertir cada endpoint en una excepción.', 'Backend', ['Node.js', 'Express', 'REST']],
  ['Performance en React y Vite desde el inicio', 'Pequeñas decisiones de carga, bundles e imágenes que mejoran la experiencia.', 'Elegir bien dependencias, dividir rutas, optimizar imágenes y medir el impacto evita sorpresas cuando la aplicación crece.', 'Frontend', ['React', 'Vite', 'Performance']],
  ['Deploy de una app MERN a producción', 'Checklist práctico para variables, builds, base de datos, logs y seguridad básica.', 'Variables de entorno, CORS, base de datos, logs, backups y monitoreo hacen la diferencia entre demo y producto.', 'DevOps', ['Deploy', 'MERN', 'Producción']],
];

const postsEn = [
  ['How to structure a MERN MVP without creating debt on day one', 'A practical guide to separating responsibilities, validating the domain and preparing for growth.', 'A healthy MVP is a focused version that lets you learn fast without closing technical doors. Keep clear boundaries between models, routes, validation, services and UI.', 'Architecture', ['MERN', 'MVP', 'Architecture']],
  ['UI patterns for dashboards people use every day', 'Visual decisions for dense interfaces that need to feel fast and trustworthy.', 'Operational dashboards should favor comparison, search and action through legible tables, stable filters and short paths.', 'Frontend', ['UI', 'React', 'Dashboards']],
  ['Shared validation between frontend and backend', 'How to think about data rules for forms, APIs and coherent error messages.', 'The frontend responds quickly and the backend protects integrity. Equivalent criteria make errors clearer.', 'Backend', ['Validation', 'API', 'Forms']],
  ['JWT authentication and sessions in MERN apps', 'A practical look at tokens, expiration, refresh flows and protected routes.', 'Reliable authentication considers expiration, renewal, safe storage and the experience when a session expires.', 'Backend', ['JWT', 'Security', 'MERN']],
  ['React forms with validation and better UX', 'Patterns for clear forms, useful messages and states that reduce friction.', 'Early validation, nearby errors and preserved progress make interfaces feel more reliable.', 'Frontend', ['React', 'Forms', 'UX']],
  ['MongoDB models that can grow', 'Simple decisions for schemas, relationships and queries before scaling.', 'Think about frequent queries, controlled duplication, indexes and clear entity boundaries.', 'Database', ['MongoDB', 'Mongoose', 'Data']],
  ['Clean REST APIs with Node and Express', 'Organizing routes, controllers, services and errors for maintainable APIs.', 'Separating routes, controllers, services and validation helps the product change cleanly.', 'Backend', ['Node.js', 'Express', 'REST']],
  ['React and Vite performance from the start', 'Small loading, bundle and image decisions that improve the real experience.', 'Choose dependencies carefully, split routes, optimize images and measure impact.', 'Frontend', ['React', 'Vite', 'Performance']],
  ['Deploying a MERN app to production', 'A practical checklist for variables, builds, database, logs and basic security.', 'Environment variables, CORS, database access, logs, backups and monitoring separate a demo from a product.', 'DevOps', ['Deploy', 'MERN', 'Production']],
];

const commentAuthors = ['Marcos Peña', 'Camila Ortiz', 'Luis Romero', 'Sofía Martínez', 'Rafael Díaz', 'Elena Vargas', 'Javier Núñez', 'Paola Reyes', 'Andrés Molina', 'Natalia Cruz', 'Diego Santos', 'Valeria Méndez'];
const commentDates = ['2026-06-18T12:10:00-04:00', '2026-06-17T18:45:00-04:00', '2026-06-16T09:20:00-04:00', '2026-06-15T14:05:00-04:00', '2026-06-14T11:12:00-04:00', '2026-06-13T17:30:00-04:00', '2026-06-12T08:50:00-04:00', '2026-06-11T19:10:00-04:00', '2026-06-10T15:25:00-04:00', '2026-06-09T10:15:00-04:00', '2026-06-08T13:42:00-04:00', '2026-06-07T16:18:00-04:00'];
const commentsEs = ['Me gusta el enfoque de separar responsabilidades desde el inicio.', 'Validar temprano es clave para evitar correcciones costosas.', 'Buen punto sobre conectar la UI a datos reales.', 'Me serviría ver una estructura de carpetas de ejemplo.', 'Muy útil para equipos que quieren avanzar con orden.', 'El equilibrio entre velocidad y mantenimiento es esencial.', 'Me gustaría una segunda parte sobre testing.', 'El artículo ayuda a pensar en producto, no solo en código.', 'Una arquitectura simple también necesita intención.', 'Los límites claros ayudan al equipo a leer el proyecto.', 'Sería interesante compararlo con una arquitectura de servicios.', 'Me quedo con aprender rápido sin cerrar puertas técnicas.'];
const commentsEn = ['I like the focus on separating responsibilities early.', 'Early validation is key to avoiding expensive fixes.', 'Good point about connecting the UI to real data.', 'I would like to see an example folder structure.', 'Very useful for teams that want to move fast with order.', 'The balance between speed and maintenance is essential.', 'I would like a second part about testing.', 'The article helps you think about product, not just code.', 'Simple architecture still needs intention.', 'Clear boundaries help teams read the project.', 'It would be interesting to compare it with a service architecture.', 'I am keeping the idea of learning fast without closing technical doors.'];

function makeComments(language) {
  const texts = language === 'es' ? commentsEs : commentsEn;
  return commentAuthors.map((author, index) => ({
    author,
    avatarUrl: sampleAvatarUrls[index] || undefined,
    text: texts[index],
    createdAt: commentDates[index],
    replies: index === 0 ? [{ id: `reply-${language}`, author: sharedProfile.name, text: language === 'es' ? 'Exacto. Esa separación evita que un cambio pequeño toque media aplicación.' : 'Exactly. That separation keeps a small change from touching half the app.', createdAt: '2026-06-18T12:35:00-04:00' }] : [],
  }));
}

function makeProjects(language) {
  const localized = language === 'es' ? projectsEs : projectsEn;
  return projectBase.map((project, index) => ({ ...project, ...localized[index] }));
}

function makePosts(language) {
  const localized = language === 'es' ? postsEs : postsEn;
  return postBase.map((post, index) => {
    const [title, excerpt, content, category, tags] = localized[index];
    return { ...post, title, excerpt, content, category, tags, author: sharedProfile.name, imageAlt: language === 'es' ? `Portada técnica: ${title}` : `Technical cover: ${title}` };
  });
}

function makePrivacy(language) {
  const es = language === 'es';
  return {
    eyebrow: es ? 'Privacidad' : 'Privacy',
    title: es ? 'Política de privacidad' : 'Privacy policy',
    description: es ? 'En antoniotrinidad.dev respetamos tu privacidad y protegemos la información personal que compartes con nosotros de conformidad con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea y cualquier otra normativa aplicable.' : 'At antoniotrinidad.dev we respect your privacy and protect the personal information you share with us under the General Data Protection Regulation (GDPR) and other applicable regulations.',
    responsible: {
      title: es ? 'Responsable del tratamiento' : 'Data controller',
      items: [
        { label: es ? 'Titular:' : 'Owner:', value: sharedProfile.name },
        { label: es ? 'Sitio web:' : 'Website:', value: sharedProfile.siteName, href: '/' },
        { label: es ? 'Correo electrónico:' : 'Email:', value: sharedProfile.email, href: `mailto:${sharedProfile.email}` },
      ],
    },
    sections: [
      { title: es ? 'Datos que recopilamos' : 'Data we collect', paragraphs: [es ? 'Podemos recopilar:' : 'We may collect:'], items: es ? ['Nombre y apellidos.', 'Correo electrónico.', 'Número de teléfono.', 'Información enviada mediante formularios.', 'Datos técnicos de navegación.'] : ['First and last name.', 'Email address.', 'Phone number.', 'Information submitted through forms.', 'Technical browsing data.'] },
      { title: es ? 'Finalidad del tratamiento' : 'Purpose of processing', paragraphs: [es ? 'Utilizamos los datos para:' : 'We use data to:'], items: es ? ['Responder consultas.', 'Elaborar presupuestos.', 'Prestar servicios profesionales.', 'Mejorar la experiencia del sitio.', 'Cumplir obligaciones legales.'] : ['Respond to inquiries.', 'Prepare quotes.', 'Provide professional services.', 'Improve the website experience.', 'Comply with legal obligations.'] },
      { title: 'Cookies', paragraphs: [es ? 'Este sitio utiliza almacenamiento local esencial para recordar preferencias como idioma, tema y decisión de cookies. No utilizamos cookies publicitarias. Si en el futuro incorporamos analítica no esencial, solicitaremos consentimiento antes de activarla.' : 'This site uses essential local storage to remember preferences such as language, theme and cookie choice. We do not use advertising cookies. If non-essential analytics are added in the future, we will request consent before enabling them.'] },
      { title: es ? 'Protección de datos' : 'Data protection', paragraphs: [es ? 'Aplicamos medidas razonables para proteger la información frente a accesos no autorizados, pérdida o uso indebido.' : 'We apply reasonable measures to protect information against unauthorized access, loss or misuse.'] },
      { title: es ? 'Derechos del usuario' : 'User rights', paragraphs: [es ? 'Puedes solicitar acceso, corrección, eliminación, limitación u oposición al tratamiento.' : 'You may request access, correction, deletion, restriction or objection to processing.'], link: { before: es ? 'Para ejercer estos derechos, escríbenos a ' : 'To exercise these rights, write to ', label: sharedProfile.email, href: `mailto:${sharedProfile.email}`, after: '.' } },
      { title: es ? 'Cambios en esta política' : 'Changes to this policy', paragraphs: [es ? 'Podemos actualizar esta política para adaptarla a cambios legales o técnicos.' : 'We may update this policy to adapt it to legal or technical changes.'] },
    ],
  };
}

function makeContent(language) {
  const es = language === 'es';
  return {
    meta: { code: language, dateLocale: es ? 'es-DO' : 'en-US', readingUnit: 'min' },
    nav: { home: es ? 'Inicio' : 'Home', about: es ? 'Sobre mí' : 'About', projects: es ? 'Proyectos' : 'Projects', blog: 'Blog', contact: es ? 'Contacto' : 'Contact', privacy: es ? 'Privacidad' : 'Privacy', primaryCta: es ? 'Hablemos' : "Let's talk", aria: es ? 'Navegación principal' : 'Main navigation' },
    controls: { themeLabel: es ? 'Cambiar tema' : 'Change theme', languageLabel: es ? 'Cambiar idioma' : 'Change language', light: es ? 'Claro' : 'Light', dark: es ? 'Oscuro' : 'Dark', spanish: 'ES', english: 'EN' },
    profile: { ...sharedProfile, role: es ? 'Desarrollador Fullstack MERN' : 'MERN Fullstack Developer', shortRole: 'FullStack Developer', tagline: es ? 'Construyo productos web claros, rápidos y mantenibles para convertir ideas en software real.' : 'I build clear, fast and maintainable web products that turn ideas into real software.', location: es ? 'San Pedro de Macorís, República Dominicana' : 'San Pedro de Macoris, Dominican Republic', metrics: es ? [{ label: 'stack principal', value: 'MERN' }, { label: 'enfoque', value: 'UX + API' }, { label: 'entrega', value: 'MVP a producción' }] : [{ label: 'main stack', value: 'MERN' }, { label: 'focus', value: 'UX + API' }, { label: 'delivery', value: 'MVP to production' }] },
    home: { primaryAction: es ? 'Ver proyectos' : 'View projects', secondaryAction: es ? 'Contactar' : 'Contact me', terminal: `const product = {\n  stack: ['React', 'Node', 'MongoDB'],\n  focus: 'clarity',\n  delivery: 'MVP ready to scale'\n};`, featuredProjects: { eyebrow: es ? 'Proyectos destacados' : 'Featured projects', title: es ? 'Trabajo pensado para usuarios reales y equipos que necesitan avanzar' : 'Work shaped for real users and teams that need momentum', description: es ? 'Casos con problema, solución, stack y resultado.' : 'Cases with problem, solution, stack and outcome.' }, stack: { eyebrow: 'Stack', title: es ? 'Herramientas de trabajo' : 'Tools I work with', description: es ? 'Un stack concentrado para construir rápido y mantener con calma.' : 'A focused stack for shipping fast and maintaining calmly.' }, blog: { eyebrow: 'Blog', title: es ? 'Notas técnicas desde el proceso' : 'Technical notes from the process', description: es ? 'Artículos sobre arquitectura, frontend, backend y producto.' : 'Articles about architecture, frontend, backend and product.' } },
    about: { eyebrow: es ? 'Sobre mí' : 'About', title: es ? 'Desarrollo interfaces y APIs con una obsesión tranquila por la claridad' : 'I develop interfaces and APIs with a calm obsession for clarity', description: es ? 'Me interesa el punto donde la experiencia, la arquitectura y el negocio se encuentran.' : 'I care about where experience, architecture and business meet.', paragraphs: es ? ['Soy Antonio Trinidad, desarrollador fullstack enfocado en aplicaciones MERN.', 'Trabajo con ciclos cortos, entregables visibles y bases técnicas mantenibles.'] : ['I am Antonio Trinidad, a fullstack developer focused on MERN applications.', 'I work with short cycles, visible deliverables and maintainable foundations.'] },
    projectsPage: { eyebrow: es ? 'Proyectos' : 'Projects', title: es ? 'Casos de trabajo con contexto, decisiones y resultados' : 'Case studies with context, decisions and outcomes', description: es ? 'Filtra por tipo de proyecto y entra al detalle.' : 'Filter by project type and open the details.', all: es ? 'Todos' : 'All', back: es ? 'Volver a proyectos' : 'Back to projects', challenge: es ? 'Reto' : 'Challenge', solution: es ? 'Solución' : 'Solution', results: es ? 'Resultados' : 'Results', demo: 'Demo', code: es ? 'Código' : 'Code', cardLink: es ? 'Ver caso' : 'View case', technologiesLabel: es ? 'Tecnologías' : 'Technologies' },
    blogPage: { eyebrow: 'Blog', title: es ? 'Ideas técnicas para construir con más criterio' : 'Technical ideas for building with better judgment', description: es ? 'Busca por tema, categoría o etiqueta.' : 'Search by topic, category or tag.', searchLabel: es ? 'Buscar artículos' : 'Search articles', searchPlaceholder: es ? 'React, API, arquitectura...' : 'React, API, architecture...', cardLink: es ? 'Leer artículo' : 'Read article', back: es ? 'Volver al blog' : 'Back to blog', readingLabel: es ? 'min de lectura' : 'min read', tagsLabel: es ? 'Etiquetas' : 'Tags', mainIdea: es ? 'Idea principal' : 'Main idea', mainIdeaText: es ? 'La meta es reducir fricción para el usuario y para el equipo que mantiene el producto.' : 'The goal is to reduce friction for users and for the team maintaining the product.', comments: { eyebrow: es ? 'Comentarios' : 'Comments', title: es ? 'Los 10 comentarios más recientes' : 'The 10 most recent comments', guestName: es ? 'Visitante' : 'Guest', messageLabel: es ? 'Comentario' : 'Comment', messagePlaceholder: es ? 'Escribe un comentario...' : 'Write a comment...', replyLabel: es ? 'Respuesta' : 'Reply', replyPlaceholder: es ? 'Escribe una respuesta.' : 'Write a reply.', submit: es ? 'Publicar' : 'Publish', reply: es ? 'Responder' : 'Reply', submitReply: es ? 'Publicar' : 'Publish', cancel: es ? 'Cancelar' : 'Cancel', showAll: es ? 'Mostrar todos los comentarios' : 'Show all comments', showRecent: es ? 'Mostrar solo los 10 recientes' : 'Show only the 10 recent comments', samples: makeComments(language) } },
    contact: { eyebrow: es ? 'Contacto' : 'Contact', title: es ? 'Cuéntame qué estás construyendo' : 'Tell me what you are building', description: es ? 'Si tienes una idea, un MVP en marcha o una aplicación que necesita orden, este es un buen punto de partida.' : 'If you have an idea, an MVP in progress or an application that needs order, this is a good place to start.', asideTitle: es ? 'Datos rápidos' : 'Quick details', responseTime: es ? 'Tiempo de respuesta de 24 a 48 horas.' : 'Response time of 24 to 48 hours.', bestWith: es ? 'Ideal si ya tienes objetivos, alcance o una lista corta de problemas.' : 'Best if you already have goals, scope or a short list of problems.', form: { name: es ? 'Nombre' : 'Name', namePlaceholder: es ? 'Tu nombre' : 'Your name', email: 'Email', emailPlaceholder: es ? 'tu@email.com' : 'you@email.com', subject: es ? 'Asunto' : 'Subject', subjectPlaceholder: es ? 'Proyecto, consulta o colaboración' : 'Project, question or collaboration', message: es ? 'Mensaje' : 'Message', messagePlaceholder: es ? 'Cuéntame qué estás construyendo y dónde necesitas apoyo.' : 'Tell me what you are building and where you need support.', send: es ? 'Enviar mensaje' : 'Send message', sending: es ? 'Enviando...' : 'Sending...', sent: es ? 'Mensaje listo para conectar al backend.' : 'Message ready to connect to the backend.' } },
    privacy: makePrivacy(language),
    notFound: { eyebrow: '404', title: es ? 'Esta página no existe' : 'This page does not exist', description: es ? 'La ruta que abriste no coincide con ninguna pantalla disponible.' : 'The route you opened does not match any available screen.', action: es ? 'Volver al inicio' : 'Back home' },
    skills: [
      { id: 'react', label: 'React' },
      { id: 'node', label: 'Node.js' },
      { id: 'express', label: 'Express' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'mongoose', label: 'Mongoose' },
      { id: 'rest', label: 'REST APIs' },
      { id: 'vite', label: 'Vite' },
      { id: 'html5', label: 'HTML5' },
      { id: 'css3', label: 'CSS3' },
      { id: 'javascript', label: 'JavaScript' },
      { id: 'github', label: 'GitHub' },
      { id: 'figma', label: 'Figma' },
      { id: 'ai', label: es ? 'Agentes de IA' : 'AI agents' },
      { id: 'jwt', label: 'JWT' },
      { id: 'testing', label: 'Testing' },
      { id: 'seo', label: es ? 'SEO técnico' : 'Technical SEO' },
      { id: 'accessibility', label: es ? 'Accesibilidad' : 'Accessibility' },
    ],
    projects: makeProjects(language),
    posts: makePosts(language),
    timeline: es ? [{ year: '2026', title: 'Portfolio fullstack y blog técnico', description: 'Plataforma propia para proyectos, artículos y contenido.' }, { year: '2025', title: 'Aplicaciones MERN orientadas a negocio', description: 'APIs, paneles y flujos claros.' }, { year: '2024', title: 'Base sólida en frontend moderno', description: 'React, formularios, CSS responsive y accesibilidad.' }] : [{ year: '2026', title: 'Fullstack portfolio and technical blog', description: 'A personal platform for projects, articles and content.' }, { year: '2025', title: 'Business-oriented MERN applications', description: 'APIs, dashboards and clear flows.' }, { year: '2024', title: 'Solid modern frontend foundation', description: 'React, forms, responsive CSS and accessibility.' }],
    admin: { nav: es ? ['Resumen', 'Proyectos', 'Posts', 'Categorías', 'Mensajes'] : ['Overview', 'Projects', 'Posts', 'Categories', 'Messages'], content: es ? 'Contenido' : 'Content', dashboard: 'Dashboard', dashboardTitle: es ? 'Resumen editorial' : 'Editorial overview', newContent: es ? 'Nuevo contenido' : 'New content', recentProjects: es ? 'Proyectos recientes' : 'Recent projects', recentPosts: es ? 'Posts recientes' : 'Recent posts', stats: es ? ['Proyectos', 'Posts', 'Mensajes', 'Borradores'] : ['Projects', 'Posts', 'Messages', 'Drafts'] },
  };
}

export const siteContent = { es: makeContent('es'), en: makeContent('en') };

export function getSiteContent(language) {
  return siteContent[language] ?? siteContent.es;
}
