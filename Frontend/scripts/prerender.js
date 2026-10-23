import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "..");
const distDir = path.resolve(frontendDir, "dist");
const ssrDir = path.resolve(frontendDir, "dist-ssr");

async function prerender() {
    console.log("[prerender] Starting public page prerendering...");

    const templatePath = path.join(distDir, "index.html");
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}. Run vite build first.`);
    }
    const template = fs.readFileSync(templatePath, "utf-8");

    const serverEntryPath = path.join(ssrDir, "entry-server.js");
    if (!fs.existsSync(serverEntryPath)) {
        throw new Error(`SSR bundle not found at ${serverEntryPath}. Run vite build --ssr first.`);
    }

    const { renderRoute, ROUTES_CONFIG } = await import(`file://${serverEntryPath}`);

    const generated = [];

    for (const routePath of Object.keys(ROUTES_CONFIG)) {
        console.log(`[prerender] Rendering ${routePath}...`);
        const { html, meta } = renderRoute(routePath);

        let pageHtml = template;

        // 1. Update <title>
        pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);

        // 2. Update meta description
        pageHtml = pageHtml.replace(
            /<meta\s+name=["']description["'][^>]*>/i,
            `<meta name="description" content="${meta.description}" />`
        );

        // 3. Update OG title & description
        pageHtml = pageHtml.replace(
            /<meta\s+property=["']og:title["'][^>]*>/i,
            `<meta property="og:title" content="${meta.title}" />`
        );
        pageHtml = pageHtml.replace(
            /<meta\s+property=["']og:description["'][^>]*>/i,
            `<meta property="og:description" content="${meta.description}" />`
        );

        // 4. Update Twitter title & description
        pageHtml = pageHtml.replace(
            /<meta\s+name=["']twitter:title["'][^>]*>/i,
            `<meta name="twitter:title" content="${meta.title}" />`
        );
        pageHtml = pageHtml.replace(
            /<meta\s+name=["']twitter:description["'][^>]*>/i,
            `<meta name="twitter:description" content="${meta.description}" />`
        );

        // 5. Update canonical link & OG URL
        if (meta.canonical) {
            pageHtml = pageHtml.replace(
                /<meta\s+property=["']og:url["'][^>]*>/i,
                `<meta property="og:url" content="${meta.canonical}" />`
            );
            const canonicalTag = `<link rel="canonical" href="${meta.canonical}" />`;
            if (pageHtml.includes('rel="canonical"')) {
                pageHtml = pageHtml.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
            } else {
                pageHtml = pageHtml.replace("</head>", `    ${canonicalTag}\n  </head>`);
            }
        }

        // 6. Robots directive (noindex for /404, etc.)
        if (meta.noindex) {
            const noindexTag = '<meta name="robots" content="noindex, nofollow" />';
            if (pageHtml.includes('name="robots"')) {
                pageHtml = pageHtml.replace(/<meta\s+name=["']robots["'][^>]*>/i, noindexTag);
            } else {
                pageHtml = pageHtml.replace("</head>", `    ${noindexTag}\n  </head>`);
            }
        }

        // 7. Inject prerendered markup into #root
        pageHtml = pageHtml.replace(
            /<div\s+id=["']root["']>[\s\S]*?<\/div>/i,
            `<div id="root">${html}</div>`
        );

        // 8. Determine target output path
        let targetFilePath;
        if (routePath === "/") {
            targetFilePath = path.join(distDir, "index.html");
            fs.writeFileSync(targetFilePath, pageHtml, "utf-8");
        } else if (routePath === "/404") {
            targetFilePath = path.join(distDir, "404.html");
            fs.writeFileSync(targetFilePath, pageHtml, "utf-8");
        } else {
            const clean = routePath.replace(/^\//, "");
            const routeDir = path.join(distDir, clean);
            if (!fs.existsSync(routeDir)) {
                fs.mkdirSync(routeDir, { recursive: true });
            }
            targetFilePath = path.join(routeDir, "index.html");
            fs.writeFileSync(targetFilePath, pageHtml, "utf-8");
            const directHtml = path.join(distDir, `${clean}.html`);
            fs.writeFileSync(directHtml, pageHtml, "utf-8");
        }

        const stats = fs.statSync(targetFilePath);
        console.log(`[prerender] Wrote ${targetFilePath} (${stats.size} bytes)`);
        generated.push({ route: routePath, file: targetFilePath, bytes: stats.size });
    }

    // Clean up temporary SSR build directory
    if (fs.existsSync(ssrDir)) {
        fs.rmSync(ssrDir, { recursive: true, force: true });
        console.log("[prerender] Cleaned up temporary SSR bundle.");
    }

    console.log(`[prerender] Successfully prerendered ${generated.length} pages.`);
}

prerender().catch((err) => {
    console.error("[prerender] Error during prerendering:", err);
    process.exit(1);
});
