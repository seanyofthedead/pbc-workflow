import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Standalone demo entry: renders the real <App /> directly, with no Amplify
// config and no AuthGate, so the bundled single-file build runs offline with
// nothing to sign into. Everything in App is already backend-free (all
// integrations are simulated in-memory), so the demo is the real app minus auth.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
