const https = require('https');

module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, senderId } = req.body;

        if (!message || !senderId) {
            return res.status(400).json({ error: 'Missing message or senderId' });
        }

        const payload = JSON.stringify({
            model: 'mimo-v2.5-pro',
            messages: [
                {
                    role: 'system',
                    content: 'Kamu asisten AI ramah bernama MiMo. Jawab singkat dalam Bahasa Indonesia.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 200
        });

        const reply = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'opengateway.gitlawb.com',
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ogw_live_337592af39a1c7ee974856efbf0c32e2'
                },
                timeout: 25000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json?.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses pesan itu.');
                    } catch (e) {
                        resolve('Maaf, terjadi kesalahan memproses response.');
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
            req.write(payload);
            req.end();
        });

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Chat API error:', error.message);
        return res.status(500).json({ error: 'Terjadi kesalahan, coba lagi nanti.' });
    }
};
