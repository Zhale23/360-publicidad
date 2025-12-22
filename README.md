# 360-PUBLICIDAD — Local dev server for contact form

This repository contains a static front-end and a small Flask server to handle the contact form and send emails.

Quick start (Windows PowerShell):

1. Copy the example env and set your SMTP credentials (or leave empty to print emails to console):

   cp .env.example .env
   # then edit .env in a text editor and fill SMTP_HOST, SMTP_USER, SMTP_PASS, etc.

2. Create a virtual environment and install dependencies:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Run the server:

```powershell
$env:FLASK_ENV = 'development'
python server.py
```

SMTP2GO quick setup
1. Copy `.env.example` to `.env` and open it in a text editor.
2. Fill these values from your SMTP2GO account:

   - SMTP_HOST=smtp.smtp2go.com
   - SMTP_PORT=587
   - SMTP_USER=your_smtp2go_username
   - SMTP_PASS=your_smtp2go_password
   - FROM_EMAIL=no-reply@yourdomain.com  (opcional)
   - TARGET_EMAIL=example@example.com  (donde recibirás los mensajes)

3. Save `.env`, then start the server as above. The server uses STARTTLS and will authenticate with your SMTP2GO credentials.

If you don't provide SMTP settings the server will print outgoing emails to the console (safe for development).

4. Open `index.html` in your browser (or serve the static files via a simple HTTP server). The contact form will POST to `http://localhost:5000/api/contact`.

Notes
- If SMTP settings are not provided, the server will print the email to the console (useful for development).
- For production, configure a proper SMTP relay or transactional email service (SendGrid, Mailgun, etc.).
- The recipient is controlled by the `TARGET_EMAIL` environment variable (defaults to `example@example.com`).

Security
- Do not commit your real credentials. Use environment variables or a secrets manager for production.
