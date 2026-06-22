import {
  Accessibility,
  Atom,
  Bot,
  Database,
  FileCode2,
  FlaskConical,
  KeyRound,
  Network,
  Route,
  SearchCheck,
  ServerCog,
  Zap,
} from 'lucide-react';

const lucideIcons = {
  react: Atom,
  node: ServerCog,
  express: Route,
  mongodb: Database,
  mongoose: Database,
  rest: Network,
  vite: Zap,
  jwt: KeyRound,
  testing: FlaskConical,
  seo: SearchCheck,
  accessibility: Accessibility,
  ai: Bot,
};

export default function StackIcon({ id }) {
  if (id === 'github') return <GitHubMark />;
  if (id === 'html5') return <ShieldMark label="5" />;
  if (id === 'css3') return <ShieldMark label="3" />;
  if (id === 'javascript') return <JavaScriptMark />;
  if (id === 'figma') return <FigmaMark />;

  const Icon = lucideIcons[id] ?? FileCode2;
  return <Icon aria-hidden="true" size={34} strokeWidth={1.8} />;
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.19-3.37-1.19a2.65 2.65 0 0 0-1.11-1.46c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.14 2.14 0 0 1 .64-1.34c-2.22-.25-4.56-1.11-4.56-4.94a3.86 3.86 0 0 1 1.03-2.68 3.59 3.59 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.48 9.48 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.37.84.4 1.79.1 2.64a3.86 3.86 0 0 1 1.03 2.68c0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function ShieldMark({ label }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <path d="M7 4h34l-3.2 35L24 44 10.2 39 7 4Z" fill="currentColor" opacity=".22" />
      <path d="M12 9h24l-2.4 26.2L24 38.5l-9.6-3.3L12 9Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="24" y="30" fill="currentColor" fontSize="19" fontWeight="900" textAnchor="middle">{label}</text>
    </svg>
  );
}

function JavaScriptMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <rect x="6" y="6" width="36" height="36" rx="4" fill="currentColor" opacity=".2" />
      <text x="24" y="31" fill="currentColor" fontSize="17" fontWeight="900" textAnchor="middle">JS</text>
    </svg>
  );
}

function FigmaMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4">
      <path d="M16 5h8v13h-8a6.5 6.5 0 1 1 0-13Zm8 0h8a6.5 6.5 0 1 1 0 13h-8V5Z" />
      <path d="M16 18h8v13h-8a6.5 6.5 0 1 1 0-13Zm8 0h7a6.5 6.5 0 1 1-7 6.5V18Zm-8 13h8v6.5a6.5 6.5 0 1 1-8-6.5Z" />
    </svg>
  );
}
