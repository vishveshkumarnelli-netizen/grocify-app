import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500 },
          success: { iconTheme: { primary: '#1b4332', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
