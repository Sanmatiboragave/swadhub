# Email Configuration Guide for SwadHub

This guide explains how to set up email sending for login and signup confirmations.

## Option 1: Backend Email Service (Recommended for Production)

### Setup Steps:

1. **Install Dependencies**
   ```bash
   pip install flask flask-cors python-dotenv
   ```

2. **Get Gmail App Password** (if using Gmail)
   - Enable 2-Factor Authentication on your Google Account
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password

3. **Create `.env` file** in the project root:
   ```
   FLASK_MAIL_SERVER=smtp.gmail.com
   FLASK_MAIL_PORT=587
   FLASK_MAIL_USERNAME=your-email@gmail.com
   FLASK_MAIL_PASSWORD=your-16-char-app-password
   FLASK_MAIL_FROM=noreply@swadhub.com
   ```

4. **Start the Email Service**
   ```bash
   python email_service.py
   ```
   The service will run on `http://localhost:5000`

5. **Update Frontend Proxy** (if needed)
   - In `webapp/vite.config.js`, add proxy config:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
       }
     }
   }
   ```

### Email Providers:

- **Gmail**: Follow steps above (free, reliable)
- **SendGrid**: Get API key from https://sendgrid.com (free tier: 100 emails/day)
- **Mailgun**: Free tier at https://mailgun.com
- **AWS SES**: Scalable option at https://aws.amazon.com/ses/

---

## Option 2: EmailJS (Client-Side, No Backend Needed)

### Setup Steps:

1. **Sign up at** https://www.emailjs.com
2. **Install EmailJS**
   ```bash
   npm install @emailjs/browser
   ```

3. **Create Email Templates** in EmailJS Dashboard:
   - Template for Sign Up
   - Template for Login
   - Template for Password Reset

4. **Update `.env` file**:
   ```
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_SIGNUP=your_signup_template_id
   REACT_APP_EMAILJS_TEMPLATE_LOGIN=your_login_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
   ```

5. **Update `emailService.js`**:
   Uncomment the EmailJS code block and remove the backend API call.

---

## Option 3: Mock Mode (Development)

Currently, the app runs in **mock mode** - emails are logged to console without actually sending.

This is perfect for development and testing. To enable real emails, follow Option 1 or Option 2.

---

## Email Templates Included

### 1. Sign Up Email
- Confirmation of account creation
- Account details
- Quick links to log in and browse

### 2. Login Email
- Login confirmation with timestamp
- Security warning
- Password reset link

### 3. Password Reset Email
- Reset link (24-hour expiration)
- Security notice

---

## Testing Emails

### Test Email 1: Sign Up
1. Go to http://localhost:5173/signup
2. Fill form and submit
3. Check browser console or email inbox

### Test Email 2: Login
1. Go to http://localhost:5173/login
2. Enter credentials and log in
3. Check browser console or email inbox

---

## Troubleshooting

**Issue**: "Email send error: connection refused"
- **Solution**: Make sure email service is running (`python email_service.py`)

**Issue**: "Failed to send email" in production
- **Solution**: Check SMTP credentials in `.env`
- Verify firewall isn't blocking port 587

**Issue**: Emails going to spam
- **Solution**: Add SPF and DKIM records to domain DNS
- Use professional email service like SendGrid

---

## Next Steps

1. Choose your preferred email provider (Gmail, SendGrid, etc.)
2. Update `.env` with credentials
3. Restart both frontend and backend
4. Test by signing up and logging in
5. Emails will now be sent to users!

---

## File Structure

```
├── email_service.py              # Flask backend for sending emails
├── webapp/src/
│   ├── utils/
│   │   └── emailService.js       # Frontend email service (calls backend)
│   └── pages/
│       ├── Login.jsx             # Login with email notification
│       └── SignUp.jsx            # Sign up with email confirmation
└── .env                          # Email configuration (not in git)
```

---

## Security Notes

- Never commit `.env` with real credentials to git
- Use environment variables in production
- Implement rate limiting to prevent email spam
- Add email verification for new accounts
- Consider using JWT tokens for password reset links
