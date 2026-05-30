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

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        const response = await fetch('https://opengateway.gitlawb.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ogw_live_337592af39a1c7ee974856efbf0c32e2'
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: 'mimo-v2.5-pro',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu asisten AI ramah. Jawab singkat dalam Bahasa Indonesia.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 200
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses pesan itu.';

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
