import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Your main app component
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';  // This line is for performance monitoring

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App component with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Optional: This is used for measuring app performance
reportWebVitals();
