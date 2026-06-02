import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeModeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './index.css'
import './mobile-responsive.css'

const rootEl = document.getElementById('root')

function showBootError(message) {
    if (!rootEl) return
    rootEl.innerHTML = `
        <div class="app-error-fallback">
            <h1>Something went wrong</h1>
            <p>${message}</p>
            <button type="button" onclick="window.location.reload()">Reload page</button>
        </div>
    `
}

if (!rootEl) {
    throw new Error('Root element #root not found')
}

try {
    ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
            <ErrorBoundary>
                <ThemeModeProvider>
                    <AuthProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </AuthProvider>
                </ThemeModeProvider>
            </ErrorBoundary>
        </React.StrictMode>,
    )
} catch (error) {
    console.error('DietDesk boot error:', error)
    showBootError('DietDesk failed to start. Please refresh the page.')
}
