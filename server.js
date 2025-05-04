const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');

require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, EMAIL_SENDER_ADDRESS, EMAIL_RECEIVER_ADDRESS } = process.env;

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(message, name, contactInfo, questionType) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'tech@shipwithg3.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: EMAIL_SENDER_ADDRESS,
            to: EMAIL_RECEIVER_ADDRESS,
            subject: `Grocery Shop Question: ${questionType.charAt(0).toUpperCase() + questionType.slice(1)}`,
            text: `
New Question from Grocery Shop Website

From: ${name || "Anonymous"}
Contact: ${contactInfo || "Not provided"}
Question Type: ${questionType.charAt(0).toUpperCase() + questionType.slice(1)}

Message:
${message}

This message was sent from the Grocery Shop contact form.
    `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #2b8379;
            color: white;
            padding: 15px;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 120px;
        }
        .message-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #2b8379;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">New Question from Grocery Shop</h2>
        </div>
        
        <table class="info-table">
            <tr>
                <td>From:</td>
                <td>${name || "Anonymous"}</td>
            </tr>
            <tr>
                <td>Contact:</td>
                <td>${contactInfo || "Not provided"}</td>
            </tr>
            <tr>
                <td>Question Type:</td>
                <td>${questionType.charAt(0).toUpperCase() + questionType.slice(1)}</td>
            </tr>
        </table>
        
        <h3>Message:</h3>
        <div class="message-box">
            ${message.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
            <p>This message was sent from the Grocery Shop contact form.</p>
            <p>© ${new Date().getFullYear()} Grocery Shop. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

// Route to receive message
app.post('/submit-message', (req, res) => {
    const { message, name, contactInfo, questionType } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }
    console.log('Received message:', message);

    sendEmail(message, name, contactInfo, questionType)
        .then(result => console.log("Email sent...", result))
        .catch(error => console.log("Error sending email...", error.message));
    return res.status(200).json({ success: true });
});

app.get("/test", (req, res) => {
    return res.status(200).json({test: "testing complete"})
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
