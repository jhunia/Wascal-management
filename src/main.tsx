/* ==========================================================================
   ENTRY POINT: the first file the browser runs.
   Loads fonts + global styles, then mounts <App/> into index.html's #root.
   ========================================================================== */
import React from 'react';
import ReactDOM from 'react-dom/client';

// Font (bundled locally, so they work offline and need no Google request)
import '@fontsource-variable/inter'; // the WASCAL website's typeface

import './styles/tokens.css';
import './styles/global.css';
import './i18n';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
