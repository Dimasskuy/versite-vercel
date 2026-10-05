const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const MAX_MESSAGE_LENGTH = 2000;
const UPSTREAM_TIMEOUT_MS = 55000;

function isRateLimited(senderId) {
    const now = Date.now();
    const entry = rateLimitMap.get(senderId);
    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(senderId, { start: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan.' });
    }

    try {
        const { message, senderId } = req.body;

        if (!message || typeof message !== 'string' || !senderId || typeof senderId !== 'string') {
            return res.status(400).json({ error: 'Pesan tidak valid. Tulis pesan dulu ya.' });
        }

        const trimmed = message.trim();
        if (trimmed.length === 0) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        if (trimmed.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ error: 'Pesan terlalu panjang. Maksimal 2000 karakter ya.' });
        }

        if (isRateLimited(senderId)) {
            return res.status(429).json({ error: 'Terlalu banyak pesan. Tunggu 1 menit lalu coba lagi.' });
        }

        const apiKey = process.env.OPENCODE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Layanan AI belum dikonfigurasi. Coba lagi nanti.' });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

        let response;
        try {
            response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'big-pickle',
                    messages: [
                        {
                            role: 'system',
                            content: `Kamu adalah asisten AI bernama Rimuruassistant yang dibuat oleh Dimas (DimasAjaa), seorang pengembang bot WhatsApp dan Content Creator. Kamu ramah, sopan, dan menjawab dalam Bahasa Indonesia. Jawab singkat dan jelas, maksimal 2 paragraf.

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
                            content: trimmed
                        }
                    ],
                    max_tokens: 2000
                }),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({ error: 'Layanan AI sedang sibuk. Tunggu sebentar lalu coba lagi.' });
            }
            throw new Error(`API error: ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Invalid JSON from upstream');
        }

        const choice = data?.choices?.[0]?.message;
        const reply = choice?.content || choice?.reasoning_content || 'Maaf, saya tidak bisa memproses pesan itu.';

        return res.status(200).json({ reply });

    } catch (error) {
        if (error && error.name === 'AbortError') {
            return res.status(504).json({ error: 'Permintaan ke AI kehabisan waktu. Coba lagi ya.' });
        }
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan di server. Coba lagi sebentar lagi.' });
    }
};
