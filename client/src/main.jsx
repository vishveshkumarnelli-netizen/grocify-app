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
        position="bottom-center"
        toastOptions={{
          style: { background:'#1b4332', color:'#fff', fontFamily:'Outfit,sans-serif', fontWeight:600 },
          success: { iconTheme: { primary:'#b7e4c7', secondary:'#1b4332' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
