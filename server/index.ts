import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Analytics endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const { targetEmail, ...analyticsData } = req.body;

    // Format the email content
    const emailContent = `
      New Analytics Data Received
      
      File Information:
      - Name: ${analyticsData.fileName}
      - Type: ${analyticsData.fileType}
      - Size: ${analyticsData.fileSize} bytes
      
      Tool Usage:
      - Tool: ${analyticsData.toolUsed}
      - Timestamp: ${new Date(analyticsData.timestamp).toLocaleString()}
      
      User Information:
      - Browser: ${analyticsData.userAgent}
      - Screen Resolution: ${analyticsData.screenResolution}
      - Language: ${analyticsData.language}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: 'New Analytics Data - PDF Toolkit',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });

    res.status(200).json({ message: 'Analytics data forwarded successfully' });
  } catch (error) {
    console.error('Error forwarding analytics data:', error);
    res.status(500).json({ error: 'Failed to forward analytics data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 