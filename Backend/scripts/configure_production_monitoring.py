"""
Configure DietDesk production monitoring secrets (HF + optional Vercel instructions).

Usage (PowerShell):
  $env:HF_TOKEN = "<your-hf-token>"
  $env:SENTRY_DSN_BACKEND = "<backend-sentry-dsn>"
  $env:SENTRY_DSN_FRONTEND = "<frontend-sentry-dsn>"
  python scripts/configure_production_monitoring.py

Requires: pip install huggingface_hub
"""
import os
import sys

HF_SPACE = "arrifection/nutrition-backend"
RELEASE = os.getenv("SENTRY_RELEASE", "2db79807")


def configure_hf(api):
    secrets = {
        "ENVIRONMENT": "production",
        "SENTRY_DSN": os.environ["SENTRY_DSN_BACKEND"],
        "SENTRY_RELEASE": RELEASE,
        "ENABLE_SENTRY_TEST": "false",
    }
    if os.getenv("SECRET_KEY"):
        secrets["SECRET_KEY"] = os.environ["SECRET_KEY"]
    variables = {
        "ENVIRONMENT": "production",
        "SENTRY_RELEASE": RELEASE,
    }
    for key, value in secrets.items():
        api.add_space_secret(repo_id=HF_SPACE, key=key, value=value)
        print(f"HF secret set: {key}")
    for key, value in variables.items():
        try:
            api.add_space_variable(repo_id=HF_SPACE, key=key, value=value)
            print(f"HF variable set: {key}")
        except Exception as exc:
            print(f"HF variable {key} skipped: {exc}")
    try:
        api.restart_space(repo_id=HF_SPACE)
        print("HF Space restart requested")
    except Exception as exc:
        print(f"HF restart skipped (set manually in UI): {exc}")


def main():
    if not os.getenv("HF_TOKEN"):
        print("ERROR: Set HF_TOKEN environment variable.", file=sys.stderr)
        sys.exit(1)
    if not os.getenv("SENTRY_DSN_BACKEND"):
        print("ERROR: Set SENTRY_DSN_BACKEND environment variable.", file=sys.stderr)
        sys.exit(1)

    from huggingface_hub import HfApi

    api = HfApi(token=os.environ["HF_TOKEN"])
    configure_hf(api)

    print("\nVercel (run manually or via Vercel dashboard):")
    print("  VITE_SENTRY_DSN=<frontend-dsn>")
    print(f"  VITE_SENTRY_RELEASE={RELEASE}")
    print("  VITE_SENTRY_ENVIRONMENT=production")
    print("Then redeploy production from Vercel dashboard.")


if __name__ == "__main__":
    main()
