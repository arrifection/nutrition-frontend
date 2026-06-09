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

export function isPasswordStrong(password = "") {
    return passwordRequirements(password).every((r) => r.met) && password.trim() === password;
}

export function passwordValidationMessage(password = "") {
    if (!password) return "Password is required.";
    if (password.trim() !== password) return "Password cannot start or end with spaces.";
    const unmet = passwordRequirements(password).filter((r) => !r.met);
    if (!unmet.length) return null;
    return `Password must include ${unmet.map((r) => r.label.toLowerCase()).join(", ")}.`;
}
