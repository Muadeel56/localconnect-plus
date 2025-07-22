import secrets
from django.core.mail import send_mail
from django.conf import settings

def generate_token(length=48):
    return secrets.token_urlsafe(length)[:length]

def send_verification_email(user, token):
    subject = 'Verify your email address'
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    message = f"Hi {user.username},\n\nPlease verify your email by clicking the link below:\n{verification_url}\n\nIf you did not sign up, please ignore this email."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

def send_password_reset_email(user, token):
    subject = 'Reset your password'
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    message = f"Hi {user.username},\n\nYou requested a password reset. Click the link below to reset your password:\n{reset_url}\n\nIf you did not request this, please ignore this email."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email]) 