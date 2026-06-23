"""
Development settings — DEBUG on, loads .env from project root.
"""

from .base import *  # noqa: F403

DEBUG = True

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])  # noqa: F405

environ.Env.read_env(BASE_DIR / '.env', overwrite=True)  # noqa: F405

# Re-read secrets and DB after .env is loaded
SECRET_KEY = env('SECRET_KEY', default=SECRET_KEY)  # noqa: F405

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


BREVO_API_KEY = env('BREVO_API_KEY', default='')  # noqa: F405
BREVO_SENDER_EMAIL = env('BREVO_SENDER_EMAIL', default=BREVO_SENDER_EMAIL)  # noqa: F405
BREVO_SENDER_NAME = env('BREVO_SENDER_NAME', default=BREVO_SENDER_NAME)  # noqa: F405

OTP_EXPIRY_MINUTES = env.int('OTP_EXPIRY_MINUTES')  # noqa: F405
OTP_MAX_ATTEMPTS = env.int('OTP_MAX_ATTEMPTS')  # noqa: F405

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
