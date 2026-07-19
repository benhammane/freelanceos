import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Police Inter auto-hébergée (variable) : chargée localement, aucune requête
// externe, poids réduit grâce à la version variable.
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
