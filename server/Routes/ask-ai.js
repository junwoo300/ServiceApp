const express = require('express');
const router = express.Router();
const axios = require('axios');

// API สำหรับถาม AI ผ่าน Ollama
router.post('/', async (req, res) => {
    const { prompt, language = "thai" } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gemma', // ใช้โมเดล gemma
            prompt: `ตอบเป็น${language}เท่านั้น: ${prompt}`,
            stream: false
        });

        return res.json({ response: response.data.response });

    } catch (error) {
        console.error('Error calling Ollama API:', error.message);
        return res.status(500).json({ error: 'AI processing failed' });
    }
});

module.exports = router;
