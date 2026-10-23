import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";
import SecurityPage from "./pages/SecurityPage";
import SiteIndex from "./pages/SiteIndex";
import NotFound from "./pages/NotFound";

export const ROUTES_CONFIG = {
    "/": {
        component: Landing,
        title: "DietDesk — Clinical diet planning software for dietitians",
        description: "DietDesk — modern clinical nutrition software for dietitians and students. Patient management, meal planning, macro calculations, and PDF exports.",
        canonical: "https://dietdesk.online/",
        noindex: false,
        lastmod: "2026-10-22",
    },
    "/privacy": {
        component: PrivacyPolicy,
        title: "Privacy Policy | DietDesk",
        description: "DietDesk privacy policy: how we protect your personal information, client records, and clinical nutrition data.",
        canonical: "https://dietdesk.online/privacy",
        noindex: false,
        lastmod: "2026-10-22",
    },
    "/terms": {
        component: TermsOfService,
        title: "Terms of Service | DietDesk",
        description: "DietDesk terms of service: user agreements, clinical usage disclaimers, and subscription terms.",
        canonical: "https://dietdesk.online/terms",
        noindex: false,
        lastmod: "2026-10-22",
    },
    "/contact": {
        component: ContactUs,
        title: "Contact Us | DietDesk",
        description: "Contact the DietDesk clinical nutrition software support team for inquiries, clinical feedback, and technical support.",
        canonical: "https://dietdesk.online/contact",
        noindex: false,
        lastmod: "2026-10-22",
    },
    "/security": {
        component: SecurityPage,
        title: "Security | DietDesk",
        description: "DietDesk security overview: HIPAA/GDPR alignment, encryption standards, access controls, and patient data safeguards.",
        canonical: "https://dietdesk.online/security",
        noindex: false,
        lastmod: "2026-10-22",
    },
    "/site-index": {
        component: SiteIndex,
        title: "Site Index | DietDesk",
        description: "Directory and index of all public pages, tools, and legal documentation for DietDesk.",
        canonical: "https://dietdesk.online/site-index",
        noindex: false,
        lastmod: "2026-10-23",
    },
    "/404": {
        component: NotFound,
        title: "Page Not Found | DietDesk",
        description: "The requested page could not be found on DietDesk.",
        canonical: null,
        noindex: true,
        lastmod: null,
    },
};

export function renderRoute(routePath) {
    const config = ROUTES_CONFIG[routePath];
    if (!config) {
        throw new Error(`Unknown route path: ${routePath}`);
    }

    const PageComponent = config.component;
    const html = ReactDOMServer.renderToString(
        React.createElement(
            StaticRouter,
            { location: routePath },
            React.createElement(PageComponent)
        )
    );

    return {
        html,
        meta: {
            title: config.title,
            description: config.description,
            canonical: config.canonical,
            noindex: config.noindex,
            lastmod: config.lastmod,
        },
    };
}
