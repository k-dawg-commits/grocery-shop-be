const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google} = require('googleapis');
const { z } = require("zod");
const Stripe = require("stripe");

require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, EMAIL_SENDER_ADDRESS, EMAIL_RECEIVER_ADDRESS } = process.env;

const app = express();
const PORT = 2000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(formData) {
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
            subject: `RLSG Contact Form: ${formData.company ? formData.company : 'New Inquiry'}`,
            text: `
New Message from RLSG Website

From: ${formData.name || "Not provided"}
Company: ${formData.company || "Not provided"}
Email: ${formData.email || "Not provided"}
Phone: ${formData.phone || "Not provided"}

Message:
${formData.message}

This message was sent from the RLSG website contact form.
    `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #ffffff;
            color: black;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 120px;
        }
        .message-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #0a7c9e;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }
        .cta-button {
            display: inline-block;
            background-color: white;
            color: black;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 15px;
            transition: background-color 0.7s;
            border: 1px solid #0a7c9e;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .cta-button:hover {
            background-color: #d0eefa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%404x-tvd81p6BFPoCBv7YibCH7MZQWeYuvm.png" alt="RLSG Logo" width="150" height="50" class="logo">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        <hr>

        <table class="info-table">
            <tr>
                <td>Name:</td>
                <td>${formData.name || "Not provided"}</td>
            </tr>
            <tr>
                <td>Company:</td>
                <td>${formData.company || "Not provided"}</td>
            </tr>
            <tr>
                <td>Email:</td>
                <td>${formData.email || "Not provided"}</td>
            </tr>
            <tr>
                <td>Phone:</td>
                <td>${formData.phone || "Not provided"}</td>
            </tr>
        </table>

        <h3>Message:</h3>
        <div class="message-box">
            ${formData.message.replace(/\n/g, '<br>')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${formData.email}" class="cta-button">Reply to ${formData.name}</a>
        </div>

        <div class="footer">
            <p>This message was sent from the RLSG website contact form.</p>
            <p>© ${new Date().getFullYear()} Ramusevic Logistics Solutions Group. All rights reserved.</p>
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

async function sendEmailForCustomPricing(formData) {
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
            subject: `RLSG Contact Form: ${formData.name ? formData.name : 'Custom Pricing Plan'}`,
            text: `
New Message from RLSG Website

From: ${formData.name || "Not provided"}
Email: ${formData.email || "Not provided"}

Message:
${formData.details}

This message was sent from the RLSG website contact form.
    `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #ffffff;
            color: black;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 120px;
        }
        .message-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #0a7c9e;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }
        .cta-button {
            display: inline-block;
            background-color: white;
            color: black;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 15px;
            transition: background-color 0.7s;
            border: 1px solid #0a7c9e;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .cta-button:hover {
            background-color: #d0eefa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%404x-tvd81p6BFPoCBv7YibCH7MZQWeYuvm.png" alt="RLSG Logo" width="150" height="50" class="logo">
            <h2 style="margin: 0;">Custom Pricing Request</h2>
        </div>
        <hr>

        <table class="info-table">
            <tr>
                <td>Name:</td>
                <td>${formData.name || "Not provided"}</td>
            </tr>
            <tr>
                <td>Email:</td>
                <td>${formData.email || "Not provided"}</td>
            </tr>
        </table>

        <h3>Message:</h3>
        <div class="message-box">
            ${formData.details.replace(/\n/g, '<br>')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${formData.email}" class="cta-button">Reply to ${formData.name}</a>
        </div>

        <div class="footer">
            <p>This message was sent from the RLSG website contact form.</p>
            <p>© ${new Date().getFullYear()} Ramusevic Logistics Solutions Group. All rights reserved.</p>
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
});

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { packageType, packageName } = req.body;

        console.log("successful connection to backend")
        let priceId;
        if (packageType === "hourly") {
            priceId = process.env.STRIPE_HOURLY_PRICE_ID;
        } else if (packageType === "pack") {
            priceId = process.env.STRIPE_PACK_PRICE_ID;
        } else {
            return res.status(400).json({ error: "Invalid package type" });
        }

        if (!priceId) {
            return res.status(400).json({ error: "Price ID not configured" });
        }

        const origin = req.headers.origin || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/checkout/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout/cancel.html`,
            metadata: {
                packageName,
                packageType,
            },
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// Route to receive message
app.post('/submit-form', (req, res) => {
    const { formData } = req.body;

    if (!formData.name || !formData.email || !formData.message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    sendEmail(formData)
        .then(result => console.log("Email sent...", result))
        .catch(error => console.log("Error sending email...", error.message));
    return res.status(200).json({ success: true });
});

app.post("/submit-custom-pricing-form", (req, res) => {
    const { name, email, details } = req.body;
    const formData = { name, email, details };

    if (!formData.email || !formData.details) {
        return res.status(400).json({ error: 'Message and email are required.' });
    }

    sendEmailForCustomPricing(formData)
        .then(result => console.log("Email sent...", result))
        .catch(error => console.log("Error sending email...", error.message));
    return res.status(200).json({ success: true });
})

// Email validation schema
const emailSchema = z
    .string()
    .email("Please enter a valid email address")
    .refine((email) => {
        const fakePatterns = [
            /^test@/i,
            /^fake@/i,
            /^example@/i,
            /^demo@/i,
            /^sample@/i,
            /@test\./i,
            /@fake\./i,
            /@example\./i,
        ]
        return !fakePatterns.some((pattern) => pattern.test(email))
    }, "Please use a real email address, not a test email")

app.post("/subscribe", async (req, res) => {
    const email = req.body.email

    console.log(`Received subscription request for ${email}`)

    // Validate email
    const validatedEmail = emailSchema.safeParse(email)

    if (!validatedEmail.success) {
        return res.json({
            success: false,
            message: validatedEmail.error.errors[0].message,
        })
    }

    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !audienceId) {
        console.error("Mailchimp credentials are missing")
        return res.status(500).json({
            success: false,
            message: "Newsletter service configuration error. Please try again later.",
        })
    }

    const dataCenter = apiKey.split("-")[1]
    const data = {
        email_address: validatedEmail.data,
        status: "subscribed",
        merge_fields: {},
    }

    try {
        console.log(`Subscribing ${validatedEmail.data} to Mailchimp list ${audienceId}`)

        const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
            method: "POST",
            headers: {
                Authorization: `apikey ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        const responseData = await response.json()
        console.log(`Mailchimp API response status: ${response.status}`)

        if (!response.ok) {
            if (response.status === 400 && responseData.title === "Member Exists") {
                return res.json({
                    success: true,
                    message: "You're already subscribed! We'll send you the flyer again.",
                })
            }

            if (response.status === 400 && responseData.detail?.includes("looks fake or invalid")) {
                return res.json({
                    success: false,
                    message: "Please enter a real email address. Test or fake email addresses are not accepted.",
                })
            }

            if (response.status === 400 && responseData.title === "Invalid Resource") {
                return res.json({
                    success: false,
                    message: "Please enter a valid email address that you actively use.",
                })
            }

            console.error("Mailchimp API error:", responseData)
            return res.status(500).json({
                success: false,
                message: responseData.detail || "Failed to subscribe. Please try again later.",
            })
        }

        return res.json({
            success: true,
            message: "Thank you for subscribing! Check your email for our flyer.",
        })
    } catch (error) {
        console.error("Subscription error:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to subscribe. Please try again later.",
        })
    }
})

app.get("/test", (req, res) => {
    return res.status(200).json({ test: "testing complete" })
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
