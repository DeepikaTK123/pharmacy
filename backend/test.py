import smtplib
from email.message import EmailMessage

# SMTP configurations
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = 'venkateshmurthy4747@gmail.com'
SMTP_PASSWORD = 'larkldrago'  # Consider using a more secure way to store your password
FROM_EMAIL = SMTP_USERNAME
TO_EMAILS = ['venki@life9sys.com']

def send_email(subject, body):
    try:
        # Setup server connection
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        # Send the email to each recipient
        for to_email in TO_EMAILS:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            msg['From'] = FROM_EMAIL
            msg['To'] = to_email
            server.send_message(msg)
        
        print(f"Email sent successfully to {TO_EMAILS}")
    
    except smtplib.SMTPException as e:
        # Handle any SMTP-specific errors
        print(f"Failed to send email due to SMTP error: {e}")
    
    except Exception as e:
        # Handle any other potential errors
        print(f"An error occurred: {e}")
    
    finally:
        # Ensure the server connection is closed
        server.quit()

# Example usage
subject = "Test Email"
body = "This is a test email sent using Python."

send_email(subject, body)
