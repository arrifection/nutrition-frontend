import { useEffect } from "react";

const SITE_NAME = "DietDesk";
const DEFAULT_DESCRIPTION =
    "Clinical nutrition software for dietitians — patient management, meal planning, macro calculations, and PDF exports.";

function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

export default function PageMeta({ title, description = DEFAULT_DESCRIPTION }) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    useEffect(() => {
        document.title = fullTitle;
        upsertMeta("name", "description", description);
        upsertMeta("property", "og:title", fullTitle);
        upsertMeta("property", "og:description", description);
        upsertMeta("name", "twitter:title", fullTitle);
        upsertMeta("name", "twitter:description", description);
    }, [fullTitle, description]);

    return null;
}
