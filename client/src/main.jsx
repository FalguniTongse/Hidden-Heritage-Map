import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';
import { GuideProvider } from './components/Guide.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GuideProvider>
          <App />
        </GuideProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
