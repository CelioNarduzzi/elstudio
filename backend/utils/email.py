import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.models import Organization
from jinja2 import Environment, FileSystemLoader
import os
import smtplib


# Config Jinja2 pour les templates
env = Environment(loader=FileSystemLoader("backend/utils/email_templates"))

async def send_invitation_email(db: AsyncSession, to_email: str, temp_password: str):
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one()

    template = env.get_template("invitation_email.html")
    html_content = template.render(temp_password=temp_password)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre accès à ElStudio"
    msg["From"] = org.default_from_email
    msg["To"] = to_email

    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if org.smtp_use_ssl:
            server = smtplib.SMTP_SSL(org.smtp_host, org.smtp_port)
        else:
            server = smtplib.SMTP(org.smtp_host, org.smtp_port)
            if org.smtp_use_tls:
                server.starttls()
        server.login(org.smtp_user, org.smtp_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("❌ Erreur d’envoi de mail:", e)


async def send_password_changed_email(db: AsyncSession, to_email: str, first_name: str):
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one()

    template = env.get_template("password_changed.html")
    html_content = template.render(first_name=first_name)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre mot de passe a été modifié"
    msg["From"] = org.default_from_email
    msg["To"] = to_email

    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if org.smtp_use_ssl:
            server = smtplib.SMTP_SSL(org.smtp_host, org.smtp_port)
        else:
            server = smtplib.SMTP(org.smtp_host, org.smtp_port)
            if org.smtp_use_tls:
                server.starttls()
        server.login(org.smtp_user, org.smtp_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("❌ Erreur d’envoi de mail:", e)

async def send_reset_password_email(db: AsyncSession, to_email: str, reset_token: str):
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one()

    template = env.get_template("reset_password.html")
    html_content = template.render(
        reset_link=f"http://localhost:5173/reset-password?token={reset_token}"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Réinitialisation de votre mot de passe"
    msg["From"] = org.default_from_email
    msg["To"] = to_email

    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if org.smtp_use_ssl:
            server = smtplib.SMTP_SSL(org.smtp_host, org.smtp_port)
        else:
            server = smtplib.SMTP(org.smtp_host, org.smtp_port)
            if org.smtp_use_tls:
                server.starttls()
        server.login(org.smtp_user, org.smtp_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("❌ Erreur d’envoi de mail:", e)
