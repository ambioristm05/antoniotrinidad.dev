import { RefreshCw } from 'lucide-react';

export default function ContentFeedback({ error, loading, onRetry, copy }) {
  if (loading) return <p className="content-feedback">{copy.loading}</p>;

  return (
    <div className="content-feedback" role="alert">
      <p>{error?.message || copy.error}</p>
      <button className="button button--secondary" onClick={onRetry} type="button">
        <RefreshCw aria-hidden="true" size={17} />
        {copy.retry}
      </button>
    </div>
  );
}
