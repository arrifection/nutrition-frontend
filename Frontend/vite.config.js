import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
        plugins: [react()],
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
