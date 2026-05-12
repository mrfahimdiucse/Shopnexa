import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Email Configuration
// User provided credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mr.fahim.diu.cse@gmail.com",
    pass: "krjb ffxd bfvz iezi",
  },
});

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const mailOptions = {
    from: email,
    to: "mr.fahim.diu.cse@gmail.com",
    subject: `Shopnexa Contact: ${subject || "New Inquiry"}`,
    text: `From: ${name} (${email})\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #00C853;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">Sent from Shopnexa Digital Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ message: "Failed to send message. Technical interference detected." });
  }
});

export default router;
