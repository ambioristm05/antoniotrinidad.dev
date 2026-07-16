import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FormNotice({ children, type = 'success' }) {
  const isError = type === 'error';

  return (
    <div className={`form-notice form-notice--${isError ? 'error' : 'success'}`} role={isError ? 'alert' : 'status'}>
      {isError ? <AlertCircle aria-hidden="true" size={18} /> : <CheckCircle2 aria-hidden="true" size={18} />}
      <span>{children}</span>
    </div>
  );
}
