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
            app: {
                id: "b3ekyuzy5sr1780108614855",
                time: Date.now(),
                data: {
                    sender: {
                        id: senderId
                    },
                    message: [
                        {
                            id: Math.random().toString(36).substring(2, 14) + Date.now().toString(36),
                            time: Date.now(),
                            type: "text",
                            value: message
                        }
                    ]
                }
            }
        });

        const botikaResponse = await fetch('https://webhook.botika.online/webhook/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer yvcmq8-6tqb-vrr5mwt1w383jq2u-5p2wzdsdpx-vxk25h2r'
            },
            body: payload
        });

        if (!botikaResponse.ok) {
            throw new Error(`Botika API error: ${botikaResponse.status}`);
        }

        const data = await botikaResponse.json();
        const reply = data?.app?.data?.message?.[0]?.value || 'Maaf, saya tidak bisa memproses pesan itu.';

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
