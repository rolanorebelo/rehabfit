package com.rehabfit.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@rehabfit.com}")
    private String fromEmail;

    @Value("${app.frontend.url:https://rehabfit.vercel.app}")
    private String frontendUrl;

    @Value("${spring.mail.enabled:false}")
    private boolean emailEnabled;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (!emailEnabled || mailSender == null) {
            // Fallback to console logging for development
            System.out.println("=".repeat(80));
            System.out.println("EMAIL SERVICE DISABLED - Password Reset Email (Development Mode)");
            System.out.println("=".repeat(80));
            System.out.println("To: " + toEmail);
            System.out.println("Reset Token: " + resetToken);
            System.out.println("Reset Link: " + frontendUrl + "/reset-password?token=" + resetToken);
            System.out.println("=".repeat(80));
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("RehabFit - Password Reset Request");

            String htmlContent = buildPasswordResetEmailHtml(resetToken);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            // Log to console as fallback
            System.out.println("=".repeat(80));
            System.out.println("EMAIL SEND FAILED - Password Reset Link (Fallback)");
            System.out.println("=".repeat(80));
            System.out.println("To: " + toEmail);
            System.out.println("Reset Link: " + frontendUrl + "/reset-password?token=" + resetToken);
            System.out.println("=".repeat(80));
        }
    }

    private String buildPasswordResetEmailHtml(String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background-color: white;
                        border-radius: 10px;
                        padding: 40px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        color: #10b981;
                        margin-bottom: 10px;
                    }
                    .title {
                        font-size: 24px;
                        color: #1f2937;
                        margin-bottom: 10px;
                    }
                    .content {
                        color: #4b5563;
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        padding: 14px 32px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .button:hover {
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    }
                    .link-box {
                        background-color: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        padding: 15px;
                        margin: 20px 0;
                        word-break: break-all;
                        font-size: 12px;
                        color: #6b7280;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        color: #9ca3af;
                        font-size: 14px;
                        text-align: center;
                    }
                    .warning {
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 12px;
                        margin: 20px 0;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">💪 RehabFit</div>
                        <h1 class="title">Reset Your Password</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your RehabFit account. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <div class="link-box">%s</div>
                        
                        <div class="warning">
                            ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
                        </div>
                        
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message from RehabFit.</p>
                        <p>© 2025 RehabFit. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetLink, resetLink);
    }
}
