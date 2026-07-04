"""
Verify production auth prerequisites on Hugging Face Space.

Usage:
  HF_TOKEN=... python scripts/verify_hf_auth_env.py

Checks which required secrets/variables are set (values are never printed).
"""
import os
import sys

HF_SPACE = "arrifection/nutrition-backend"

REQUIRED_SECRETS = [
    "MONGODB_URL",
    "SECRET_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "FRONTEND_URL",
    "ENVIRONMENT",
]

OPTIONAL = [
    "DATABASE_NAME",
    "MONGODB_SERVER_SELECTION_TIMEOUT_MS",
    "MONGODB_TLS_INSECURE",
]


def main():
    token = os.getenv("HF_TOKEN")
    if not token:
        print("Set HF_TOKEN to list Space secret/variable names.", file=sys.stderr)
        sys.exit(1)

    from huggingface_hub import HfApi

    api = HfApi(token=token)
    runtime = api.get_space_runtime(repo_id=HF_SPACE)
    print(f"Space: {HF_SPACE}")
    print(f"Stage: {getattr(runtime, 'stage', 'unknown')}")

    # HF Hub API exposes secret keys only, not values
    try:
        secrets = api.get_space_secrets(repo_id=HF_SPACE)
        secret_keys = {s.key for s in secrets}
    except Exception as exc:
        print(f"Could not fetch secrets: {exc}")
        secret_keys = set()

    try:
        variables = api.get_space_variables(repo_id=HF_SPACE)
        var_keys = {v.key for v in variables}
    except Exception as exc:
        print(f"Could not fetch variables: {exc}")
        var_keys = set()

    configured = secret_keys | var_keys
    missing = [k for k in REQUIRED_SECRETS if k not in configured]
    present = [k for k in REQUIRED_SECRETS if k in configured]

    print("\nRequired (present):", ", ".join(present) or "(none)")
    print("Required (MISSING):", ", ".join(missing) or "(none — good)")

    if missing:
        print("\nFix in HF Space → Settings → Variables and secrets:")
        for key in missing:
            if key == "FRONTEND_URL":
                print(f"  {key}=https://dietdesk.online")
            elif key == "ENVIRONMENT":
                print(f"  {key}=production")
            elif key == "RESEND_FROM_EMAIL":
                print(f"  {key}=noreply@dietdesk.online  (must match verified Resend domain)")
            else:
                print(f"  {key}=<set in HF dashboard>")

        print("\nMongoDB Atlas: Network Access must allow 0.0.0.0/0 (Hugging Face uses dynamic IPs).")
        sys.exit(2)

    print("\nAll required auth env keys are present.")
    print("If login still fails, check Atlas connectivity and Resend domain verification.")


if __name__ == "__main__":
    main()
