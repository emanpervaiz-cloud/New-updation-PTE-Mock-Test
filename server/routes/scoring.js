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
        console.error('Route error (speaking):', error);
        res.status(500).json({ error: 'Speaking evaluation failed' });
    }
});

// Handle writing evaluation
router.post('/evaluate-writing', async (req, res) => {
    const { prompt, response, questionType } = req.body;

    if (!prompt || !response) {
        return res.status(400).json({ error: 'Missing prompt or response' });
    }

    try {
        const result = await scoringEngine.evaluateWriting(prompt, response, questionType || 'writing');
        res.json(result);
    } catch (error) {
        console.error('Route error (writing):', error);
        res.status(500).json({ error: 'Writing evaluation failed' });
    }
});

// Handle listening evaluation
router.post('/evaluate-listening', async (req, res) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Missing questions array' });
    }

    try {
        const result = await scoringEngine.evaluateListening(questions);
        res.json(result);
    } catch (error) {
        console.error('Route error (listening):', error);
        res.status(500).json({ error: 'Listening evaluation failed' });
    }
});

// Handle reading evaluation
router.post('/evaluate-reading', async (req, res) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Missing questions array' });
    }

    try {
        const result = await scoringEngine.evaluateReading(questions);
        res.json(result);
    } catch (error) {
        console.error('Route error (reading):', error);
        res.status(500).json({ error: 'Reading evaluation failed' });
    }
});

module.exports = router;
