import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Email could not be sent. Missing SMTP environment configuration: ${missingVars.join(", ")}`
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Portfolio Alerts" <${process.env.SMTP_USER}>`,
      to: to || process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return false;
  }
}

export async function sendAdminSecurityAlert({ type, username, ip, userAgent }) {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  
  let subject = "";
  let html = "";

  if (type === "access") {
    subject = "⚠️ Portfolio Alert: Admin Login Page Accessed";
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #eab308; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Admin Login Page Access</h2>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p>This is to notify you that the admin login page (<code>/kishan-admin</code>) was accessed on your portfolio site.</p>
          <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />
          <p><strong>Details:</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 120px;">Timestamp:</td>
              <td style="padding: 8px 0;">${timestamp} IST</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">IP Address:</td>
              <td style="padding: 8px 0;"><code>${ip || "Unknown"}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Browser/Agent:</td>
              <td style="padding: 8px 0; font-size: 13px; line-height: 1.4;">${userAgent || "Unknown"}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  } else if (type === "login_success") {
    subject = "✅ Portfolio Alert: Successful Admin Login";
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #10b981; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">✅ Admin Login Successful</h2>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p>A user has successfully logged in to the admin panel of your portfolio.</p>
          <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />
          <p><strong>Session Details:</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 120px;">Username:</td>
              <td style="padding: 8px 0;"><code>${username}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px 0;">${timestamp} IST</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">IP Address:</td>
              <td style="padding: 8px 0;"><code>${ip || "Unknown"}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Browser/Agent:</td>
              <td style="padding: 8px 0; font-size: 13px; line-height: 1.4;">${userAgent || "Unknown"}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #ef4444;">* If this login was not authorized by you, please change your credentials in your server's .env file immediately and restart the server.</p>
        </div>
      </div>
    `;
  } else if (type === "login_failure") {
    subject = "❌ Portfolio Security Alert: Failed Admin Login Attempt";
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #ef4444; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ Failed Login Attempt Detected</h2>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p style="color: #ef4444; font-weight: bold;">A failed login attempt was made on your portfolio admin panel.</p>
          <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />
          <p><strong>Attempt Details:</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 120px;">Username Tried:</td>
              <td style="padding: 8px 0;"><code>${username || "Blank"}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px 0;">${timestamp} IST</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">IP Address:</td>
              <td style="padding: 8px 0;"><code>${ip || "Unknown"}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Browser/Agent:</td>
              <td style="padding: 8px 0; font-size: 13px; line-height: 1.4;">${userAgent || "Unknown"}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  const toEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  return sendEmail({
    to: toEmail,
    subject,
    text: subject,
    html,
  });
}


