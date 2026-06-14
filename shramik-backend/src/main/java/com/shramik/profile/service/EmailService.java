package com.shramik.profile.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * EmailService — Sends OTP verification emails via Gmail SMTP.
 *
 * Configuration is driven by spring.mail.* in application.properties.
 * Set spring.mail.username and spring.mail.password (16-char Google App Password).
 *
 * The email is a rich HTML template with the OTP code prominently displayed.
 */
@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String recipientEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipientEmail);
            helper.setSubject("Your Shramik Verification Code — " + otpCode);
            helper.setText(buildHtmlEmail(recipientEmail, otpCode), true);

            mailSender.send(message);
            log.info("✅ OTP email sent successfully to: {}", recipientEmail);

        } catch (MailException e) {
            // MailAuthenticationException (bad credentials), MailSendException (SMTP down), etc.
            // These are Spring RuntimeExceptions — must be caught explicitly here.
            logOtpFallback(recipientEmail, otpCode,
                "SMTP delivery failed (" + e.getClass().getSimpleName() + "): " + e.getMessage());

        } catch (MessagingException e) {
            // Jakarta Mail checked exceptions (e.g. bad address format)
            logOtpFallback(recipientEmail, otpCode,
                "Message construction failed: " + e.getMessage());

        } catch (Exception e) {
            // Safety net for any unexpected runtime issue
            logOtpFallback(recipientEmail, otpCode,
                "Unexpected error: " + e.getMessage());
        }
        // NOTE: Exceptions are NEVER rethrown — email failure must not break the auth flow.
        // The OTP is saved in MongoDB and printed to console, so login works without SMTP.
    }

    /**
     * Prominently logs the OTP to the backend console when email delivery fails.
     * This acts as the development-mode fallback — copy the code from server logs.
     */
    private void logOtpFallback(String email, String otp, String reason) {
        log.warn("╔══════════════════════════════════════════════════╗");
        log.warn("║          ⚠  OTP EMAIL DELIVERY FAILED            ║");
        log.warn("╠══════════════════════════════════════════════════╣");
        log.warn("║  Reason  : {}", reason);
        log.warn("║  Email   : {}", email);
        log.warn("║  OTP     : {}  ← USE THIS CODE", otp);
        log.warn("╠══════════════════════════════════════════════════╣");
        log.warn("║  To fix: add a valid Google App Password to      ║");
        log.warn("║  application.properties (spring.mail.password)   ║");
        log.warn("╚══════════════════════════════════════════════════╝");
    }

    private String buildHtmlEmail(String email, String otpCode) {
        // Split OTP digits for individual boxes in the HTML template
        String[] digits = otpCode.split("");
        StringBuilder digitBoxes = new StringBuilder();
        for (String digit : digits) {
            digitBoxes.append(
                "<span style=\"display:inline-block;width:48px;height:56px;line-height:56px;" +
                "background:#1e293b;border:2px solid #6366f1;border-radius:12px;" +
                "font-size:28px;font-weight:900;color:#ffffff;text-align:center;margin:0 4px;\">" +
                digit + "</span>"
            );
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </head>
            <body style="margin:0;padding:0;background-color:#030712;font-family:'Inter',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" border="0" bgcolor="#030712">
                <tr><td align="center" style="padding:40px 16px;">
                  
                  <table width="480" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:480px;background:#0f172a;border:1px solid #1e293b;border-radius:24px;overflow:hidden;">
                    
                    <!-- Header Brand -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1e1b4b 0%%,#0f172a 100%%);padding:36px 40px 28px;text-align:center;border-bottom:1px solid #1e293b;">
                        <div style="display:inline-block;background:#6366f1;width:48px;height:48px;border-radius:14px;line-height:48px;font-size:24px;font-weight:900;color:#fff;margin-bottom:16px;">S</div>
                        <h1 style="margin:0;font-size:24px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
                          Shramik <span style="color:#818cf8;">Profile</span>
                        </h1>
                        <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Hyperlocal On-Demand Skill Marketplace</p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#f1f5f9;">Verify Your Account</h2>
                        <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6;">
                          Enter the code below to complete your sign-in to <strong style="color:#c7d2fe;">%s</strong>.
                          This code expires in <strong style="color:#c7d2fe;">5 minutes</strong>.
                        </p>
                        
                        <!-- OTP Code Display -->
                        <div style="text-align:center;margin:0 0 32px;background:#0a0f1e;border:1px solid #1e293b;border-radius:16px;padding:28px 16px;">
                          <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:#6366f1;text-transform:uppercase;">Your Verification Code</p>
                          <div>%s</div>
                        </div>
                        
                        <!-- Security Note -->
                        <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                            🔒 <strong style="color:#94a3b8;">Security Notice:</strong> 
                            Never share this code with anyone. Shramik will never ask for your OTP via phone or chat.
                            If you didn't request this, you can safely ignore this email.
                          </p>
                        </div>
                        
                        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                          Having trouble? Contact us at <a href="mailto:support@shramik.app" style="color:#6366f1;text-decoration:none;">support@shramik.app</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background:#0a0f1e;border-top:1px solid #1e293b;padding:20px 40px;text-align:center;">
                        <p style="margin:0;font-size:11px;color:#334155;">
                          © 2025 Shramik Profile · Hyperlocal Skill Marketplace · India
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(email, digitBoxes.toString());
    }
}
