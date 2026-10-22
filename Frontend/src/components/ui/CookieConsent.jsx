import { useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'dd_cookie_consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(() => {
        try {
            return localStorage.getItem(CONSENT_KEY) !== 'true';
        } catch {
            return true;
        }
    });

    if (!visible) return null;

    function handleAccept() {
        try {
            localStorage.setItem(CONSENT_KEY, 'true');
        } catch {
            // ignore storage errors (private mode, etc.)
        }
        setVisible(false);
    }

    return (
        <div
            className="cookie-consent-banner"
            role="dialog"
            aria-live="polite"
            aria-label="Cookie notice"
        >
            <p className="cookie-consent-banner__text">
                DietDesk uses essential cookies to keep you signed in. By continuing, you agree to our{' '}
                <Link to="/privacy" className="cookie-consent-banner__link">
                    Privacy Policy
                </Link>
                .
            </p>
            <button type="button" className="cookie-consent-banner__button" onClick={handleAccept}>
                Got it
            </button>
        </div>
    );
}
