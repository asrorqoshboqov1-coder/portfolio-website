const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Barcha maydonlarni toldiring' });
        }

        const data = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: process.env.RECEIVER_EMAIL || 'asrorqoshboqov1@gmail.com',
            subject: subject || `Yangi xabar: ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4da6ff;">Yangi xabar keldi!</h2>
                    <p><strong>Ism:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Mavzu:</strong> ${subject || 'Mavzu ko\'rsatilmagan'}</p>
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
};
