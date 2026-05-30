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

        const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-WKrEx8SKt2D2CwYs6nN1dPqwLfgoUq4RHcpVe71KIsYsUoQIijazmorvl0i6QQHI'
            },
            body: JSON.stringify({
                model: 'mimo-v2.5-free',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu adalah asisten AI bernama DimBot yang dibuat oleh Dimas, seorang pengembang bot WhatsApp. Kamu ramah, sopan, dan menjawab dalam Bahasa Indonesia. Jawab singkat dan jelas, maksimal 2 paragraf. Jika ditanya siapa pembuatmu, jawab bahwa kamu dibuat oleh Dimas, seorang pengembang bot WhatsApp.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 200
            })
        });

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
