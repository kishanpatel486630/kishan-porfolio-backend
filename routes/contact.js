import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

// POST /api/contact
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: name, email, message",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // Log the message for observability
    console.log("📩 New contact form submission:");
    console.log(`   Name:    ${name}`);
    console.log(`   Email:   ${email}`);
    console.log(`   Message: ${message.substring(0, 100)}...`);

    const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
    const missingVars = requiredVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        error: `Email service is not configured. Missing: ${missingVars.join(", ")}`,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 8px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    });

    console.log("   ✅ Email sent successfully");

    res.json({
      success: true,
      message: "Message received! I'll get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Contact form error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
});

export default router;
