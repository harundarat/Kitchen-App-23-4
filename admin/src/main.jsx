// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Corrected import statement
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';  // Make sure to import CSS if it exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
