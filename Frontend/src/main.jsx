import React from 'react'
// Version 1.1 - Auth Integration
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeModeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeModeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeModeProvider>
    </React.StrictMode>,
)
