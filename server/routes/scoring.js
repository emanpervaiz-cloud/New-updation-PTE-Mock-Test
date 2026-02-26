const express = require('express');
const router = express.Router();
const scoringEngine = require('../services/scoringEngine');

// Handle speaking evaluation
router.post('/evaluate-speaking', async (req, res) => {
    const { prompt, transcript, questionType } = req.body;

    if (!prompt || !transcript) {
        return res.status(400).json({ error: 'Missing prompt or transcript' });
    }

    try {
        const result = await scoringEngine.evaluateSpeaking(prompt, transcript, questionType || 'speaking');
        res.json(result);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Evaluation failed' });
    }
});

// Placeholder for writing evaluation
router.post('/evaluate-writing', async (req, res) => {
    res.status(501).json({ message: 'Writing evaluation coming soon' });
});

module.exports = router;
