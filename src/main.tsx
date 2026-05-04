import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './amplify-config'
import './index.css'
import App from './App.tsx'
import { AuthGate } from './AuthGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)
