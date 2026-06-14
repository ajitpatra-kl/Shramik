import React from 'react'
import ReactDOM from 'react-dom/client'

// Polyfill global variable for SockJS compatibility in Vite
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
