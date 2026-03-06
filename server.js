const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root directory
app.use(express.static(path.join(__dirname), {
    extensions: ['html', 'css', 'js']
}));

// ==================== CONTACT API ====================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Barcha maydonlarni toldiring' });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const data = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: process.env.RECEIVER_EMAIL || 'asrorqoshboqov1@gmail.com',
            subject: subject || `Yangi xabar: ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4da6ff;">Yangi xabar keldi!</h2>
                    <p><strong>Ism:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Mavzu:</strong> ${subject || "Mavzu ko'rsatilmagan"}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Xabar:</strong></p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        ${message}
                    </div>
                </div>
            `
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Xabar yuborishda xatolik yuz berdi' });
    }
});

// Fallback — serve index.html for any unmatched route
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
