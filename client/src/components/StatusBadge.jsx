const toneByStatus = {
  planned: 'neutral',
  'in-progress': 'info',
  completed: 'success',
  archived: 'muted',
  draft: 'warning',
  published: 'success',
  hidden: 'warning',
  visible: 'success',
  unread: 'warning',
  read: 'info',
};

export default function StatusBadge({ children, status }) {
  const tone = toneByStatus[status] ?? 'neutral';

  return <span className={`status status--${tone}`}>{children}</span>;
}
