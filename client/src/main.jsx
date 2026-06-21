import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PreferencesProvider } from './contexts/PreferencesContext.jsx';
import './styles/main.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PreferencesProvider>
  </StrictMode>,
);
