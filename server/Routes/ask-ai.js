const express = require('express');
const router = express.Router();
const axios = require('axios');

// API สำหรับถาม AI ผ่าน Ollama
router.post('/', async (req, res) => {
    const { prompt, language = "thai" } = req.body;

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000 ||
        typeof language !== 'string' || language.length > 30) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gemma', // ใช้โมเดล gemma
            prompt: `ตอบเป็น${language}เท่านั้น: ${prompt}`,
            stream: false
        }, { timeout: 60000 });

        if (typeof response.data.response !== 'string' || !response.data.response.trim()) {
            return res.status(502).json({ error: 'AI returned an invalid response' });
        }
        return res.json({ response: response.data.response });

    } catch (error) {
        console.error('Error calling Ollama API:', error.message);
        return res.status(500).json({ error: 'AI processing failed' });
    }
});

module.exports = router;
