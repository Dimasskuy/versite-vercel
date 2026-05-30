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
                        content: `Kamu adalah asisten AI bernama DimBot yang dibuat oleh Dimas (DimasAjaa), seorang pengembang bot WhatsApp dan Content Creator. Kamu ramah, sopan, dan menjawab dalam Bahasa Indonesia. Jawab singkat dan jelas, maksimal 2 paragraf.

INFORMASI TENTANG PEMBUAT DAN WEBSITE:
- Nama: DimasAjaa
- Nomor WhatsApp: +6282257529886 (wa.me/6282257529886)
- WhatsApp Channel: https://whatsapp.com/channel/0029VaCvaNgBPzjcfrTixA1U
- Grup Bot WhatsApp: https://chat.whatsapp.com/DXPU5F2cePXEaysvcImdUy
- GitHub: https://github.com/dimasskuy
- YouTube: https://youtube.com/@felizmunzz
- Replit: https://replit.com/@dimaszkuy
- Website: https://felizmunzz.vercel.app

TUGAS KAMU:
- Jika ditanya siapa pembuatmu, jawab bahwa kamu dibuat oleh Dimas, pengembang bot WhatsApp.
- Jika ada yang ingin menghubungi owner, berikan nomor WhatsApp: +6282257529886.
- Jika ada yang ingin bergabung dengan grup atau channel, berikan link yang sesuai.
- Jika ada yang bertanya tentang bot WhatsApp, arahkan ke grup WhatsApp atau hubungi owner langsung.
- Jika ada yang bertanya tentang sosial media, berikan link yang sesuai dari informasi di atas.`
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
