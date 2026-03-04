import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID =
  '114844774596-riiuivl9kbglsca3evs8ro611eeif7fk.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
