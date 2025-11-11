from django.core.mail import send_mail
from django.conf import settings
from authentication.models import EmailVerificationToken
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user):
    """Send verification email to user"""
    try:
        # Create verification token
        token = EmailVerificationToken.create_token(user)

        # Build verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"

        # Email subject
        subject = 'Verify Your Email Address - Shataya Global'

        # Email body (plain text)
        message = f"""
Hi {user.first_name},

Thank you for signing up with Shataya Global!

Please verify your email address by clicking the link below:
{verification_url}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The Shataya Global Team
        """

        # HTML email body
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Shataya Global!</h1>
        </div>
        <div class="content">
            <h2>Hi {user.first_name},</h2>
            <p>Thank you for signing up! We're excited to have you on board.</p>
            <p>Please verify your email address to activate your account:</p>
            <p style="text-align: center;">
                <a href="{verification_url}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">{verification_url}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2024 Shataya Global. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

        #logger.info(f"Verification email sent successfully to {user.email}")
        return True

    except Exception as e:
        #logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        return False
