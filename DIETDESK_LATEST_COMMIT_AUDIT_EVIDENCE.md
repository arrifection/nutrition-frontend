# DietDesk — External Audit Evidence Package

**Generated:** 2026-06-10  
**Primary security anchor commit:** `49c94c73`  
**Follow-up product commit (clinical/allergen/UX):** `42560ad5`  
**Branch:** `main`  
**Production URLs:** https://dietdesk.online · https://dietdesk.online/backend

> This document contains code excerpts and test outputs only. No secrets, API keys, database URLs, tokens, or passwords are included.

---

## 1. Latest Commit Info

### Security hardening commit (audit anchor)

| Field | Value |
|-------|-------|
| **Hash** | `49c94c736484b0b7d0bf249aec94da72d964a968` |
| **Message** | `security: harden auth sessions and production headers` |
| **Branch** | `main` |
| **Author date** | 2026-06-09 |

**Files changed (18):**

```
Backend/app.py
Backend/auth_router.py
Backend/auth_utils.py
Backend/database.py
Backend/login_throttle.py
Backend/password_policy.py
Backend/rate_limit.py
Backend/refresh_token_service.py
Backend/security_middleware.py
Frontend/src/components/Signup.jsx
Frontend/src/context/AuthContext.jsx
Frontend/src/mobile-responsive.css
Frontend/src/services/api.js
Frontend/src/services/pdfExport.js
Frontend/src/utils/apiErrors.js
Frontend/src/utils/passwordPolicy.js
Frontend/vercel.json
SECURITY_REPORT.md
```

### Follow-up commit (clinical / allergen / UX — deployed after security)

| Field | Value |
|-------|-------|
| **Hash** | `42560ad5` |
| **Message** | `feat: add allergen safety, clinical fields, and UX reliability` |
| **Files changed** | 36 (+2245 / −157 lines) |

---

## 2. Auth / Security Evidence (commit `49c94c73`)

### 2.1 Signup password validation

**`Backend/password_policy.py`**

```python
MIN_PASSWORD_LENGTH = 10
MAX_PASSWORD_LENGTH = 128

def validate_password_strength(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    missing = [label for pattern, label in _PASSWORD_RULES if not re.search(pattern, password)]
    if missing:
        raise ValueError("Password must include " + ", ".join(missing) + ".")
```

**`Backend/auth_router.py` — Pydantic validator + register**

```python
class UserRegister(BaseModel):
    password: str
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        validate_password_strength(v)
        return v

@router.post("/register")
async def register(user_data: UserRegister, request: Request, ...):
    check_rate_limit(request)
    # duplicate email/username checks, bcrypt hash, verification token hash
```

### 2.2 Login throttling (5 failures → 15 min lockout)

**`Backend/login_throttle.py`**

```python
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

async def check_login_allowed(email: str) -> None:
    locked_until = user.get("login_locked_until")
    if locked_until and locked_until > datetime.utcnow():
        raise HTTPException(status_code=429, detail=f"Too many failed login attempts...")

async def record_failed_login(email: str) -> None:
    attempts = int(user.get("failed_login_attempts") or 0) + 1
    if attempts >= MAX_FAILED_ATTEMPTS:
        update["login_locked_until"] = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
```

**`Backend/auth_router.py` — login integration**

```python
@router.post("/login")
async def login(user_data: UserLogin, request: Request, response: Response):
    check_rate_limit(request)
    await check_login_allowed(user_data.email)
    if not user or not verify_password(...):
        await record_failed_login(user_data.email)
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    await clear_failed_logins(user_data.email)
```

### 2.3 IP rate limiting

**`Backend/rate_limit.py`**

```python
ROUTE_LIMITS = {
    "/auth/login": (10, 60),
    "/auth/register": (5, 300),
    "/auth/request-verification-email": (3, 300),
    "/auth/refresh": (20, 60),
}

def check_rate_limit(request: Request) -> None:
    if len(hits) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests...", headers={"Retry-After": str(window)})
```

**`Backend/app.py` — middleware returns 429 (not 500)**

```python
@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    try:
        check_rate_limit(request)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=...)
    return await add_security_headers(request, call_next)
```

### 2.4 Short-lived access tokens + refresh rotation

**`Backend/auth_utils.py`**

```python
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
```

**`Backend/refresh_token_service.py` — rotation + family revocation**

```python
async def rotate_refresh_token(refresh_plain: str) -> dict:
    session = await refresh_sessions_collection.find_one({"token_hash": token_hash})
    if not session or session.get("revoked"):
        if session and session.get("family_id"):
            await refresh_sessions_collection.update_many({"family_id": session["family_id"]}, {"$set": {"revoked": True}})
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    await refresh_sessions_collection.update_one({"_id": session["_id"]}, {"$set": {"revoked": True}})
    # issue new refresh token in same family_id
```

**`Backend/database.py`**

```python
refresh_sessions_collection = _get_coll("refresh_sessions")
```

### 2.5 Logout revocation + secure refresh cookie

**`Backend/auth_router.py`**

```python
def _set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME, value=refresh_token,
        httponly=True, secure=IS_PRODUCTION, samesite="lax",
        max_age=7 * 24 * 3600, path=REFRESH_COOKIE_PATH,
    )

@router.post("/refresh")
async def refresh_session(...):
    tokens = await rotate_refresh_token(refresh_plain)
    _set_refresh_cookie(response, tokens["refresh_token"])

@router.post("/logout")
async def logout(request, response):
    await revoke_refresh_token(request.cookies.get(REFRESH_COOKIE_NAME))
    _clear_refresh_cookie(response)
```

### 2.6 Dev route protection

**`Backend/auth_router.py`**

```python
ENABLE_DEV_AUTH = os.getenv("ENABLE_DEV_AUTH", "false").lower() in {"1", "true", "yes"}

if ENABLE_DEV_AUTH:
    @router.get("/dev-delete-user", tags=["Development Only"])
    async def dev_delete_user(...): ...
```

When `ENABLE_DEV_AUTH` is unset/false (production), dev routes are not registered → **404**.

### 2.7 Production secret validation

**`Backend/security_middleware.py`**

```python
INSECURE_SECRET_PLACEHOLDER = "your-super-secret-key-change-this-in-production"

def validate_secret_key() -> None:
    secret = os.getenv("SECRET_KEY", "").strip()
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    if env in {"production", "prod"} and (not secret or secret == INSECURE_SECRET_PLACEHOLDER):
        raise RuntimeError("SECRET_KEY must be set to a strong value in production.")
```

**`Backend/app.py`**

```python
load_dotenv()
validate_secret_key()  # fails fast on insecure production config
```

### 2.8 Security headers

**`Backend/security_middleware.py`**

```python
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; ... frame-ancestors 'none'; ...",
}
```

---

## 3. Frontend Auth / Session Evidence (commit `49c94c73`)

### 3.1 Password checklist

**`Frontend/src/utils/passwordPolicy.js`**

```javascript
export const PASSWORD_MIN_LENGTH = 10;
export function passwordRequirements(password = "") {
    return [
        { key: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: password.length >= PASSWORD_MIN_LENGTH },
        { key: "lower", label: "One lowercase letter", met: /[a-z]/.test(password) },
        { key: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { key: "digit", label: "One number", met: /\d/.test(password) },
        { key: "special", label: "One special character", met: /[^\w\s]/.test(password) },
    ];
}
```

**`Frontend/src/components/Signup.jsx`**

```jsx
const requirements = useMemo(() => passwordRequirements(password), [password]);
const passwordReady = isPasswordStrong(password);
// ...
{password && (
    <ul className="password-requirements" aria-live="polite">
        {requirements.map((req) => (
            <li key={req.key} className={req.met ? "met" : ""}>{req.met ? "✓" : "○"} {req.label}</li>
        ))}
    </ul>
)}
<button disabled={loading || !passwordReady}>Create Account</button>
```

### 3.2 Refresh before expiry + auth-expired handling

**`Frontend/src/context/AuthContext.jsx`**

```javascript
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

const scheduleTokenRefresh = useCallback((expiresAtMs) => {
    const delay = Math.max(expiresAtMs - Date.now() - REFRESH_BUFFER_MS, 5000);
    refreshTimerRef.current = setTimeout(async () => {
        const result = await refreshSession();
        if (result.success) {
            storeAuthTokens(result.data);
            scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
        } else {
            clearSession();
            window.dispatchEvent(new Event("dietdesk:auth-expired"));
        }
    }, delay);
}, [clearSession]);

useEffect(() => {
    window.addEventListener("dietdesk:auth-expired", () => clearSession());
}, [clearSession]);
```

**`Frontend/src/pages/AuthenticatedApp.jsx`**

```javascript
useEffect(() => {
    const onAuthExpired = () => {
        showToast("Your session expired. Please sign in again.", "error");
        logout();
        navigate("/login", { replace: true });
    };
    window.addEventListener("dietdesk:auth-expired", onAuthExpired);
}, [logout, navigate, showToast]);
```

### 3.3 Axios 401 retry + withCredentials

**`Frontend/src/services/api.js`**

```javascript
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true, timeout: 60000 });

async function refreshAccessToken() {
    refreshInFlight = axios.post(`${API_BASE_URL}/auth/refresh`,
        { refresh_token: sessionStorage.getItem(REFRESH_KEY) },
        { withCredentials: true, timeout: 30000 });
}

api.interceptors.response.use(null, async (error) => {
    const isExpiredToken = status === 401 && detail.includes('invalid or expired token');
    if (isExpiredToken && original && !original._retried) {
        original._retried = true;
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
    }
    window.dispatchEvent(new Event('dietdesk:auth-expired'));
});
```

### 3.4 Secure API base routing (production proxy)

**`Frontend/src/utils/apiBaseUrl.js`**

```javascript
export function getApiBaseUrl() {
    const isProductionHost = host === "dietdesk.online" || host === "www.dietdesk.online" || host.endsWith(".vercel.app");
    if (isProductionHost) {
        return `${window.location.origin}/backend`;  // same-origin Vercel proxy
    }
    return import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
}
```

### 3.5 Vercel headers + `/backend` proxy

**`Frontend/vercel.json`**

```json
{
  "rewrites": [
    { "source": "/backend/:path*", "destination": "https://arrifection-nutrition-backend.hf.space/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 3.6 Friendly auth error mapping

**`Frontend/src/utils/apiErrors.js`**

```javascript
{ match: /failed login attempts/i, text: "Too many failed login attempts. Please wait and try again." },
{ match: /invalid or expired token/i, text: "Your session expired. Please sign in again." },
{ match: /password must include/i, text: null },  // pass through server validation detail
429: "Too many attempts. Please wait a minute and try again.",
```

---

## 4. Clinical Workflow Evidence (commit `42560ad5`)

### 4.1 Patient allergy / restriction / notes fields

**`Backend/patient.py`**

```python
class PatientProfile(BaseModel):
    allergens: Optional[PatientAllergens] = None
    allergies: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    medical_notes: Optional[str] = None
```

**`Frontend/src/components/steps/desktop/Step1PatientInfo.jsx`**

```jsx
<textarea name="allergies" value={profile.allergies} placeholder="e.g. milk, wheat, peanut, shellfish" />
<textarea name="dietary_restrictions" value={profile.dietary_restrictions} placeholder="e.g. vegetarian, gluten-free" />
<textarea name="medical_notes" value={profile.medical_notes} />
```

(Mobile `Step1PatientInfo.jsx` mirrors the same fields.)

### 4.2 Food allergen tags on exchange list

**`Backend/exchange_list_data.py`**

```python
def _item(..., allergens=None, dietary_flags=None):
    return {
        ...
        "allergens": list(allergens or []),
        "dietary_flags": list(dietary_flags or []),
    }
```

**`Backend/exchange_list.py`**

```python
missing_allergens = sample and "allergens" not in sample
needs_reseed = count < _FULL_SEED_THRESHOLD or is_old_schema or missing_allergens
```

### 4.3 Allergen conflict detection (backend + frontend)

**`Backend/allergen_utils.py`**

```python
def detect_food_allergens(food) -> list[str]:
    tagged = food.get("allergens")
    if isinstance(tagged, list) and tagged:
        return sorted({str(a).lower() for a in tagged})
    return _detect_food_allergens_from_text(food)

def scan_meal_plan_conflicts(..., allergies_text=None) -> list[dict]:
    active = resolve_patient_allergens(patient) or get_active_patient_allergens(...)
    # match detected food allergens against patient allergies → conflict records
```

**`Frontend/src/utils/allergenScan.js`**

```javascript
export function getFoodAllergens(food) {
    if (Array.isArray(food?.allergens) && food.allergens.length > 0) return [...new Set(...)];
    return detectFoodAllergensFromText(food);
}

export function scanMealPlanAllergenConflicts(patientData, weekPlan) {
    const activeAllergens = getActivePatientAllergens(patientData);
    // iterate days/meals/foods, emit { day, meal_type, food_name, allergen, allergen_label }
}
```

**`Backend/allergen_router.py`**

```python
router = APIRouter(prefix="/api/v1/allergens", tags=["Allergens"])

@router.post("/scan")
async def scan_allergens(body: AllergenScanRequest):
    conflicts = scan_meal_plan_conflicts(patient=body.patient, week_plan=body.week_plan, ...)
    return {"conflicts": conflicts, "count": len(conflicts)}
```

### 4.4 Step4 override modal (add food with conflict)

**`Frontend/src/components/steps/desktop/Step4MealPlanner.jsx`**

```javascript
import AllergenAddFoodModal from "../../AllergenAddFoodModal";
import { getFoodAllergenConflicts } from "../../../utils/allergenScan";

const conflicts = getFoodAllergenConflicts(patientData, food);
if (conflicts.length) {
    setPendingFood(food);
    setPendingConflicts(conflicts);
    setAllergenModalOpen(true);
    return;
}
```

### 4.5 Step5 save/export gate

**`Frontend/src/hooks/useAllergenExportGate.js`**

```javascript
const runOrPrompt = (action) => {
    if (!conflicts.length || acknowledged) { action(); return; }
    pendingActionRef.current = action;
    setModalOpen(true);
};

const allergenSafetyNote = acknowledged && conflicts.length > 0
    ? "Allergen conflicts were reviewed and clinically acknowledged before plan export."
    : null;
```

**`Frontend/src/components/steps/desktop/Step5WeeklyPlan.jsx`**

```javascript
const { conflicts, runOrPrompt, beforeExport, allergenSafetyNote } = useAllergenExportGate(patientData, weekPlan);
const handleSave = () => runOrPrompt(performSave);
// PdfExportButton receives beforeExport + allergenSafetyNote in exportPayload
```

### 4.6 PDF allergy / restriction / notes output

**`Backend/pdf_export_router.py`**

```python
for label, key in [("Allergies", "allergies"), ("Dietary Restrictions", "dietary_restrictions"), ("Medical Notes", "medical_notes")]:
    if value and str(value).strip():
        pdf.multi_cell(0, 6, _safe_text(value))
if body.allergenSafetyNote:
    pdf.multi_cell(0, 6, _safe_text(body.allergenSafetyNote))
```

**`Frontend/src/utils/pdfGenerator.js`**

```javascript
if (patientData.allergies) { doc.text("Allergies"); doc.text(patientData.allergies); }
if (patientData.dietary_restrictions) { ... }
if (patientData.medical_notes) { ... }
if (allergenSafetyNote) { doc.text("Allergen Safety Acknowledgement"); doc.text(allergenSafetyNote); }
```

### 4.7 Nutrition assessment calculators

**`Backend/assessment_router.py`**

```python
@router.post("/calculate")
async def calculate_assessment(data: AssessmentInput):
    result = compute_full_assessment(
        weight_kg=data.weight_kg, height_cm=data.height_cm, age=data.age,
        gender=data.gender, activity_level=data.activity_level, goal=data.goal,
        protein_factor_g_per_kg=data.protein_factor_g_per_kg,
    )
    return result
```

Input validation: weight 5–300 kg, height 50–250 cm, age 1–120, protein factor 0.6–2.5 g/kg.

---

## 5. UX Reliability Evidence (commit `42560ad5`)

### 5.1 Error boundary

**`Frontend/src/components/ui/ErrorBoundary.jsx`**

```jsx
static getDerivedStateFromError(error) { return { hasError: true, error }; }
// Renders "Something went wrong" with Try again + Reload page buttons
```

### 5.2 Toast notifications

**`Frontend/src/components/ui/Toast.jsx`**

```jsx
export default function Toast({ message, type = "info", isVisible, onClose }) {
    const typeStyles = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-gray-800" };
}
```

Used in `AuthenticatedApp.jsx` for login success, session expiry, save confirmations, and errors.

### 5.3 Offline banner

**`Frontend/src/components/ui/OfflineBanner.jsx`**

```jsx
export default function OfflineBanner({ visible }) {
    return visible ? <div className="dd-offline-banner">You are offline. Changes will not save...</div> : null;
}
```

**`Frontend/src/hooks/useNetworkStatus.js`** — listens to `online`/`offline` events.

**`AuthenticatedApp.jsx`:** `<OfflineBanner visible={offline} />`

### 5.4 Empty states + API error helper

**`Frontend/src/components/ui/EmptyState.jsx`** — reusable icon/title/description/action pattern.

**`Frontend/src/components/ui/ApiErrorState.jsx`** — retry button + offline variant.

**`Frontend/src/utils/apiErrors.js`** — `toFriendlyApiError()` maps timeouts, offline, 429, 5xx to calm user copy.

### 5.5 Dashboard / Patients / History empty states

**Dashboard:** `EmptyState title="No patients yet" actionLabel="Add patient"`

**Patients:** `EmptyState title="No patients yet" / "No patients found"` + `ApiErrorState onRetry={fetchPatients} offline={offline}`

**History:** `EmptyState title="No activity yet"` + `ApiErrorState onRetry={fetchHistory}`

---

## 6. Trust Pages Evidence (pre-existing, live on `main`)

**`Frontend/src/App.jsx` routes**

```jsx
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
<Route path="/contact" element={<ContactUs />} />
<Route path="/security" element={<SecurityPage />} />
```

**`Frontend/src/components/PublicFooter.jsx`**

```javascript
const FOOTER_LINKS = [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/security", label: "Security" },
    { to: "/contact", label: "Contact Us" },
];
```

Components: `PrivacyPolicy.jsx`, `TermsOfService.jsx`, `SecurityPage.jsx`, `ContactUs.jsx`, `TrustDocument.jsx` (shared layout).

---

## 7. Test Evidence

### 7.1 `npm run build` (2026-06-10)

```
vite v5.4.21 building for production...
✓ 3213 modules transformed.
✓ built in 39.92s
dist/index.html                              3.25 kB
dist/assets/index-Ck6SPUii.css             164.12 kB
dist/assets/index-UY_YRWJa.js            1,267.80 kB
```

### 7.2 Backend startup / import check

```
python -c "from app import app"
→ BACKEND_IMPORT_OK
INFO: Application startup complete.
```

### 7.3 Local security smoke tests (prior session, `Backend/scratch/security_smoke_test.py`)

| Test | Result |
|------|--------|
| Signup rejects weak password | **422** |
| Signup accepts strong password | **200** |
| Login with correct credentials | **200** + `expires_in` |
| 5 wrong passwords → lockout | **429** |
| Rapid login attempts → rate limit | **429** (after middleware fix) |
| Refresh endpoint | **200** + new tokens |
| Logout clears session | **200** + cookie cleared |
| Dev routes when `ENABLE_DEV_AUTH=false` | **404** |

### 7.4 Production URLs tested (2026-06-10)

```
GET https://dietdesk.online/backend/                          → 200
GET https://dietdesk.online/backend/auth/dev-delete-user      → 404
POST https://dietdesk.online/backend/auth/register (weak pw)  → 422
```

**Live security headers observed:**

```
Strict-Transport-Security: max-age=63072000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 7.5 Known gaps / not tested live

- Full live signup with strong password (avoids leaving prod test accounts; dev-delete disabled in prod)
- Live login / logout / refresh session persistence (not run against production in this pass)
- Mobile signup visual at 375px (requires manual browser check)
- Allergen integration smoke (`Backend/scratch/allergen_smoke_test.py`) — local only, not in commit

---

## 8. Remaining Risk Notes (honest)

| Area | Status |
|------|--------|
| **MFA / 2FA** | Not implemented |
| **Redis-backed rate limiting** | In-memory per-process limiter only; resets on HF restart; not shared across replicas |
| **Sentry / APM** | Not integrated; errors logged to stdout + optional `/client-log` |
| **Database backups** | Relies on MongoDB Atlas / operator policy; no app-level backup automation |
| **Product analytics** | No analytics SDK (e.g. PostHog, GA) |
| **Strict CSP** | CSP allows `'unsafe-inline'` and `'unsafe-eval'` for Vite bundle compatibility |
| **Testimonials on landing** | Marketing copy present; not independently verified as real clinical users |
| **Allergen router registration** | `allergen_router.py` exists; verify it is mounted in `app.py` before relying on `/api/v1/allergens` API (frontend uses client-side scan) |
| **HF cold start** | Free-tier wake-up can cause 20–60s delays; mitigated by `wakeBackend()` and retries |
| **Refresh token storage** | HttpOnly cookie + sessionStorage fallback; XSS on access token in localStorage remains a residual risk |

### Production environment requirements (Hugging Face Space)

Must be set (values redacted here):

- `ENVIRONMENT=production`
- `SECRET_KEY` — strong, non-default
- `ENABLE_DEV_AUTH` — unset or `false`
- `MONGODB_URL` — present
- `FRONTEND_URL=https://dietdesk.online`

---

## Appendix: Related Documentation

- `SECURITY_REPORT.md` — full security audit written at commit `49c94c73`
- GitHub repo: `arrifection/nutrition-frontend` (monorepo: Backend + Frontend)
