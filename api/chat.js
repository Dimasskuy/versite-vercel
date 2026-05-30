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
                'Authorization': 'Bearer sk-9dllnoOMQMhMnxz0VjsAyjcJxyE2ujHpFI2Ho0h0qvNtia6SHe5re7d9laIipk1q'
            },
            body: JSON.stringify({
                model: 'mimo-v2.5-free',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu asisten AI ramah bernama MiMo. Jawab singkat dalam Bahasa Indonesia. Maksimal 2 paragraf.'
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
