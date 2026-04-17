import React from 'react'
// Version 1.1 - Auth Integration
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const theme = createTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
