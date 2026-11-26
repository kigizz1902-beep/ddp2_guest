import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './pretendard-light.css'
import './pretendard-bold.css'
import './pretendard-regular.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
