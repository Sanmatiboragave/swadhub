"""
Simple Flask API for sending emails
Install dependencies: pip install flask flask-cors python-dotenv
Set environment variables:
  FLASK_MAIL_SERVER=smtp.gmail.com
  FLASK_MAIL_PORT=587
  FLASK_MAIL_USERNAME=your-email@gmail.com
  FLASK_MAIL_PASSWORD=your-app-password
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Email configuration
MAIL_SERVER = os.getenv('FLASK_MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('FLASK_MAIL_PORT', 587))
MAIL_USERNAME = os.getenv('FLASK_MAIL_USERNAME', '')
MAIL_PASSWORD = os.getenv('FLASK_MAIL_PASSWORD', '')
MAIL_FROM = os.getenv('FLASK_MAIL_FROM', 'noreply@swadhub.com')

def send_email(to_email, subject, html_content):
    """Send email using SMTP"""
    try:
        if not MAIL_USERNAME or not MAIL_PASSWORD:
            print(f"Mock email sent to {to_email}: {subject}")
            return True
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = MAIL_FROM
        msg['To'] = to_email
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Email send error: {str(e)}")
        return False

@app.route('/api/send-email', methods=['POST'])
def send_email_handler():
    """Handle email sending requests"""
    try:
        data = request.json
        email_type = data.get('type')
        user_email = data.get('email')
        user_name = data.get('name', 'User')
        
        if email_type == 'signup':
            subject = 'Welcome to SwadHub! 🎉'
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0d8a5b;">Welcome to SwadHub, {user_name}! 🎉</h2>
                        <p>Thank you for signing up. Your account has been created successfully.</p>
                        <p>You can now log in and start ordering delicious food from your favorite restaurants in Bengaluru.</p>
                        <div style="background-color: #f4faf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Your Account Details:</strong></p>
                            <p>Email: {user_email}</p>
                        </div>
                        <p><strong>Quick Links:</strong></p>
                        <ul>
                            <li><a href="http://localhost:5173/login" style="color: #0d8a5b; text-decoration: none;">Log In</a></li>
                            <li><a href="http://localhost:5173/" style="color: #0d8a5b; text-decoration: none;">Browse Restaurants</a></li>
                        </ul>
                        <p style="margin-top: 30px; font-size: 12px; color: #999;">
                            If you did not create this account, please ignore this email.
                        </p>
                    </div>
                </body>
            </html>
            """
            
        elif email_type == 'login':
            subject = 'You just logged in to SwadHub 🔐'
            login_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0d8a5b;">Login Confirmation 🔐</h2>
                        <p>Hi {user_name},</p>
                        <p>You just logged in to your SwadHub account.</p>
                        <div style="background-color: #f4faf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Login Details:</strong></p>
                            <p>Email: {user_email}</p>
                            <p>Time: {login_time}</p>
                            <p>Location: Bengaluru</p>
                        </div>
                        <p>If this wasn't you, please change your password immediately:</p>
                        <a href="http://localhost:5173/forgot-password" style="color: #fff; background-color: #0d8a5b; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Change Password</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #999;">
                            Happy ordering! 🍽️
                        </p>
                    </div>
                </body>
            </html>
            """
            
        elif email_type == 'password_reset':
            subject = 'Reset Your SwadHub Password 🔑'
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0d8a5b;">Password Reset Request 🔑</h2>
                        <p>We received a request to reset your password.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/reset-password?token=xxx" style="color: #fff; background-color: #0d8a5b; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                        </div>
                        <p>This link will expire in 24 hours.</p>
                        <p style="margin-top: 30px; font-size: 12px; color: #999;">
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        else:
            return jsonify({'success': False, 'message': 'Unknown email type'}), 400
        
        # Send the email
        success = send_email(user_email, subject, html_content)
        
        if success:
            return jsonify({
                'success': True, 
                'message': f'Confirmation email sent to {user_email}'
            })
        else:
            return jsonify({
                'success': False, 
                'message': 'Failed to send email. Please try again.'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'SwadHub Email Service'})

if __name__ == '__main__':
    print("SwadHub Email Service Starting...")
    print(f"SMTP Server: {MAIL_SERVER}:{MAIL_PORT}")
    print(f"Using email: {MAIL_USERNAME if MAIL_USERNAME else 'Mock mode (no actual emails sent)'}")
    app.run(debug=True, port=5000)
