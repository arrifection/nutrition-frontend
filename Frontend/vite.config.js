import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function vercelPreviewEmulation() {
    return {
        name: 'vercel-preview-emulation',
        configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = new URL(req.url, 'http://localhost')
                const pathname = url.pathname

                // Pass-through for backend
                if (pathname.startsWith('/backend/')) {
                    return next()
                }

                // Private/app routes -> rewrite to /index.html with X-Robots-Tag: noindex, nofollow
                const privatePattern =
                    /^\/(dashboard|patients|settings|planner|create-plan|plans|progress|food-database|exchange-list|history|calculators|pdf-preview|verify-email|login|signup)(\/.*)?$/
                if (privatePattern.test(pathname)) {
                    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
                    const distDir = path.resolve(__dirname, 'dist')
                    const indexHtml = path.join(distDir, 'index.html')
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    res.end(fs.readFileSync(indexHtml))
                    return
                }

                const distDir = path.resolve(__dirname, 'dist')
                const cleanPath = pathname.replace(/\/$/, '')
                const directFile = path.join(distDir, pathname)
                const htmlFile = path.join(distDir, cleanPath + '.html')
                const dirIndex = path.join(distDir, cleanPath, 'index.html')

                if (cleanPath === '') {
                    return next()
                }

                if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
                    return next()
                }

                if (fs.existsSync(dirIndex)) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    res.end(fs.readFileSync(dirIndex))
                    return
                }

                if (fs.existsSync(htmlFile)) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    res.end(fs.readFileSync(htmlFile))
                    return
                }

                // Any unknown route -> serve 404.html with HTTP 404
                const notFoundPath = path.join(distDir, '404.html')
                if (fs.existsSync(notFoundPath)) {
                    res.statusCode = 404
                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    res.end(fs.readFileSync(notFoundPath))
                    return
                }

                res.statusCode = 404
                res.end('Not Found')
            })
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const sentryDsn = (env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN || '').trim()

    if (mode === 'production' && process.env.VERCEL === '1' && !sentryDsn) {
        console.warn(
            '[dietdesk] VITE_SENTRY_DSN is missing at build time — frontend Sentry will be disabled in this deployment.',
        )
    }

    return {
        plugins: [react(), vercelPreviewEmulation()],
        base: '/',
        build: {
            outDir: 'dist',
            emptyOutDir: true,
        },
        envPrefix: 'VITE_',
        define: {
            'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(sentryDsn),
            'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(
                (env.VITE_SENTRY_RELEASE || process.env.VITE_SENTRY_RELEASE || '').trim(),
            ),
            'import.meta.env.VITE_SENTRY_ENVIRONMENT': JSON.stringify(
                (env.VITE_SENTRY_ENVIRONMENT || process.env.VITE_SENTRY_ENVIRONMENT || 'production').trim(),
            ),
        },
    }
})
