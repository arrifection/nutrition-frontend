"""Sentry initialization — production only when SENTRY_DSN is set."""
import os

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from runtime_env import is_production, resolve_environment


def is_sentry_enabled() -> bool:
    dsn = os.getenv("SENTRY_DSN", "").strip()
    return is_production() and bool(dsn)


def init_sentry() -> None:
    if not is_sentry_enabled():
        return

    traces_sample_rate = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1"))
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=resolve_environment(),
        release=os.getenv("SENTRY_RELEASE"),
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=traces_sample_rate,
        send_default_pii=False,
        attach_stacktrace=True,
    )


def capture_message(message: str, level: str = "error", **tags) -> None:
    if not is_sentry_enabled():
        return
    with sentry_sdk.push_scope() as scope:
        for key, value in tags.items():
            scope.set_tag(key, value)
        sentry_sdk.capture_message(message, level=level)
