import { useEffect } from "react";

const SITE_NAME = "DietDesk";
const DEFAULT_DESCRIPTION =
    "Clinical nutrition software for dietitians — patient management, meal planning, macro calculations, and PDF exports.";

function upsertMeta(attr, key, content) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!content) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function upsertLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!href) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

export default function PageMeta({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    noindex = false,
}) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    useEffect(() => {
        document.title = fullTitle;
        upsertMeta("name", "description", description);
        upsertMeta("property", "og:title", fullTitle);
        upsertMeta("property", "og:description", description);
        upsertMeta("name", "twitter:title", fullTitle);
        upsertMeta("name", "twitter:description", description);

        // Canonical URL: only set on public, indexable pages
        if (canonical && !noindex) {
            upsertLink("canonical", canonical);
            upsertMeta("property", "og:url", canonical);
        } else {
            upsertLink("canonical", null);
        }

        // Robots directive: noindex for private/utility/error routes; remove noindex for indexable routes
        if (noindex) {
            upsertMeta("name", "robots", "noindex, nofollow");
        } else {
            upsertMeta("name", "robots", null);
        }
    }, [fullTitle, description, canonical, noindex]);

    return null;
}
