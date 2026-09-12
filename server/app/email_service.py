import os
from pathlib import Path

import resend
from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

# email_service.py
#       ↓
# app/
#       ↓
# server/
#       ↓
# .env

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# =========================================================
# EMAIL CONFIGURATION
# =========================================================

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "ZestHub <onboarding@resend.dev>"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


# Configure Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


# =========================================================
# CHECK EMAIL CONFIGURATION
# =========================================================

def email_is_configured() -> bool:
    """
    Check whether Resend API key is configured.
    """
    return bool(RESEND_API_KEY)


# =========================================================
# GENERIC EMAIL FUNCTION
# =========================================================

async def send_email(
    to_email: str,
    subject: str,
    html: str
):
    """
    Send an email using Resend.

    Returns:
        Resend response when successful.
        False when email configuration or sending fails.
    """

    if not RESEND_API_KEY:
        print(
            "EMAIL WARNING: RESEND_API_KEY is not configured."
        )
        return False

    try:
        params: resend.Emails.SendParams = {
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }

        result = await resend.Emails.send_async(params)

        print(
            f"EMAIL SENT: {subject} -> {to_email}"
        )

        return result

    except Exception as error:
        print(
            f"EMAIL ERROR: Failed to send email "
            f"to {to_email}: {error}"
        )

        return False


# =========================================================
# WELCOME EMAIL
# =========================================================

async def send_welcome_email(
    name: str,
    email: str
):
    """
    Send welcome email after successful registration.
    """

    subject = "Welcome to ZestHub 🍽️"

    html = f"""
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>Welcome to ZestHub</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #fff8f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 35px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">

            <h1 style="
                color: #e85d04;
                margin-bottom: 10px;
            ">
                Welcome to ZestHub! 🍽️
            </h1>

            <p style="
                font-size: 18px;
                color: #333333;
            ">
                Hi {name},
            </p>

            <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            ">
                Welcome to ZestHub!
                Your account has been created successfully.
            </p>

            <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            ">
                Discover restaurants, explore food,
                share reviews, rate your experiences,
                and find your next favourite place to eat.
            </p>

            <div style="
                text-align: center;
                margin: 30px 0;
            ">

                <a href="{FRONTEND_URL}"
                   style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #e85d04;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                ">
                    Explore ZestHub
                </a>

            </div>

            <p style="
                color: #888888;
                font-size: 13px;
                text-align: center;
            ">
                This is an automated email from ZestHub.
            </p>

        </div>

    </body>
    </html>
    """

    return await send_email(
        to_email=email,
        subject=subject,
        html=html
    )


# =========================================================
# EMAIL VERIFICATION
# =========================================================

async def send_verification_email(
    name: str,
    email: str,
    verification_token: str
):
    """
    Send account verification email.
    """

    verification_url = (
        f"{FRONTEND_URL}/verify-email"
        f"?token={verification_token}"
    )

    subject = "Verify your ZestHub account 🔐"

    html = f"""
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>Verify your ZestHub account</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #fff8f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 35px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">

            <h1 style="
                color: #e85d04;
            ">
                Verify your ZestHub account 🔐
            </h1>

            <p style="
                font-size: 18px;
                color: #333333;
            ">
                Hi {name},
            </p>

            <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            ">
                Thanks for joining ZestHub!
                Please verify your email address
                to activate your account.
            </p>

            <div style="
                text-align: center;
                margin: 30px 0;
            ">

                <a href="{verification_url}"
                   style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #e85d04;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                ">
                    Verify My Email
                </a>

            </div>

            <p style="
                font-size: 13px;
                color: #888888;
                line-height: 1.5;
            ">
                This verification link will expire after 24 hours.
            </p>

            <p style="
                font-size: 13px;
                color: #888888;
            ">
                If you did not create this account,
                you can safely ignore this email.
            </p>

        </div>

    </body>
    </html>
    """

    return await send_email(
        to_email=email,
        subject=subject,
        html=html
    )


# =========================================================
# LOGIN NOTIFICATION
# =========================================================

async def send_login_notification(
    name: str,
    email: str
):
    """
    Send login notification after successful login.
    """

    subject = "New login to your ZestHub account 🔔"

    html = f"""
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>ZestHub Login Notification</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #fff8f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 35px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">

            <h1 style="
                color: #e85d04;
            ">
                Login Successful 🔔
            </h1>

            <p style="
                font-size: 18px;
                color: #333333;
            ">
                Hi {name},
            </p>

            <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            ">
                Your ZestHub account was just used
                to sign in.
            </p>

            <div style="
                background-color: #fff3ed;
                border-radius: 10px;
                padding: 18px;
                margin: 25px 0;
            ">
                <strong>Account:</strong>
                {email}
            </div>

            <p style="
                font-size: 14px;
                color: #777777;
                line-height: 1.5;
            ">
                If this was you, no action is required.
            </p>

            <p style="
                font-size: 14px;
                color: #777777;
                line-height: 1.5;
            ">
                If you don't recognize this login,
                please change your password and
                secure your account.
            </p>

        </div>

    </body>
    </html>
    """

    return await send_email(
        to_email=email,
        subject=subject,
        html=html
    )