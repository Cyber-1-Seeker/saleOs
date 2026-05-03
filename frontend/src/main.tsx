import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/styles/globals.css'

// Apply saved theme before render to avoid flash
const saved = localStorage.getItem('theme') || 'dark'
document.documentElement.setAttribute('data-theme', saved)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
