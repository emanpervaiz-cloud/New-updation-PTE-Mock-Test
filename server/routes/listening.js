const express = require('express');
const router = express.Router();
const ListeningQuestion = require('../models/ListeningQuestion');
const multer = require('multer');
const path = require('path');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'listening-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// @route   GET /api/listening/questions
// @desc    Get all listening questions (for students - excludes correct answers)
// @access  Public
router.get('/questions', async (req, res) => {
    try {
        const { type, difficulty, limit } = req.query;
        
        let query = { isActive: true };
        if (type) query.type = type;
        if (difficulty) query.difficulty = difficulty;
        
        let questions = await ListeningQuestion.find(query)
            .select('-correctAnswers -audio.transcript -keyPoints -modelAnswer -evaluationCriteria')
            .sort({ questionNumber: 1 });
        
        if (limit) {
            questions = questions.slice(0, parseInt(limit));
        }
        
        res.json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Error fetching listening questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch listening questions'
        });
    }
});

// @route   GET /api/listening/questions/:id
// @desc    Get single listening question by ID
// @access  Public
router.get('/questions/:id', async (req, res) => {
    try {
        const question = await ListeningQuestion.findById(req.params.id)
            .select('-correctAnswers -audio.transcript -keyPoints -modelAnswer -evaluationCriteria');
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Error fetching listening question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch listening question'
        });
    }
});

// @route   POST /api/listening/questions
// @desc    Create a new listening question (Admin only)
// @access  Private/Admin
router.post('/questions', upload.single('audio'), async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            options: req.body.options ? JSON.parse(req.body.options) : undefined,
            blanks: req.body.blanks ? JSON.parse(req.body.blanks) : undefined,
            incorrectWords: req.body.incorrectWords ? JSON.parse(req.body.incorrectWords) : undefined,
            keyPoints: req.body.keyPoints ? JSON.parse(req.body.keyPoints) : undefined,
            correctAnswers: req.body.correctAnswers ? JSON.parse(req.body.correctAnswers) : undefined,
            evaluationCriteria: req.body.evaluationCriteria ? JSON.parse(req.body.evaluationCriteria) : undefined
        };
        
        // Add audio file info if uploaded
        if (req.file) {
            questionData.audio = {
                filename: req.file.filename,
                path: req.file.path,
                url: `/uploads/audio/${req.file.filename}`
            };
        }
        
        const question = await ListeningQuestion.create(questionData);
        
        res.status(201).json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Error creating listening question:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/listening/questions/:id
// @desc    Update a listening question (Admin only)
// @access  Private/Admin
router.put('/questions/:id', upload.single('audio'), async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        // Parse JSON fields
        if (req.body.options) updateData.options = JSON.parse(req.body.options);
        if (req.body.blanks) updateData.blanks = JSON.parse(req.body.blanks);
        if (req.body.incorrectWords) updateData.incorrectWords = JSON.parse(req.body.incorrectWords);
        if (req.body.keyPoints) updateData.keyPoints = JSON.parse(req.body.keyPoints);
        if (req.body.correctAnswers) updateData.correctAnswers = JSON.parse(req.body.correctAnswers);
        if (req.body.evaluationCriteria) updateData.evaluationCriteria = JSON.parse(req.body.evaluationCriteria);
        
        // Update audio file if new one uploaded
        if (req.file) {
            updateData.audio = {
                filename: req.file.filename,
                path: req.file.path,
                url: `/uploads/audio/${req.file.filename}`
            };
        }
        
        const question = await ListeningQuestion.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Error updating listening question:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/listening/questions/:id
// @desc    Soft delete a listening question (Admin only)
// @access  Private/Admin
router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await ListeningQuestion.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting listening question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete listening question'
        });
    }
});

// @route   GET /api/listening/admin/questions
// @desc    Get all listening questions with answers (Admin only)
// @access  Private/Admin
router.get('/admin/questions', async (req, res) => {
    try {
        const questions = await ListeningQuestion.find()
            .sort({ questionNumber: 1 });
        
        res.json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Error fetching admin listening questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch listening questions'
        });
    }
});

// @route   POST /api/listening/seed
// @desc    Seed initial listening questions (for development)
// @access  Public (should be admin in production)
router.post('/seed', async (req, res) => {
    try {
        const sampleQuestions = [
            {
                questionNumber: 1,
                type: 'summarize_spoken_text',
                title: 'Climate Change Impact',
                instruction: 'Listen to the lecture and summarize the main points in 50-70 words.',
                audio: {
                    filename: 'sample1.mp3',
                    url: '/uploads/audio/sample1.mp3',
                    duration: 120
                },
                minWords: 50,
                maxWords: 70,
                keyPoints: [
                    'Global temperatures rising',
                    'Sea levels increasing',
                    'Impact on wildlife',
                    'Need for renewable energy'
                ],
                modelAnswer: 'Climate change is causing global temperatures to rise and sea levels to increase. This has significant impacts on wildlife and ecosystems. The speaker emphasizes the urgent need for renewable energy solutions.',
                difficulty: 'medium'
            },
            {
                questionNumber: 2,
                type: 'listening_fill_blanks',
                title: 'University Lecture',
                instruction: 'Listen to the recording and fill in the blanks.',
                audio: {
                    filename: 'sample2.mp3',
                    url: '/uploads/audio/sample2.mp3',
                    duration: 90
                },
                blanks: [
                    { blankId: 1, correctAnswer: 'research' },
                    { blankId: 2, correctAnswer: 'analysis' },
                    { blankId: 3, correctAnswer: 'conclusion' }
                ],
                difficulty: 'easy'
            }
        ];
        
        await ListeningQuestion.deleteMany({});
        await ListeningQuestion.insertMany(sampleQuestions);
        
        res.json({
            success: true,
            message: 'Sample listening questions seeded successfully',
            count: sampleQuestions.length
        });
    } catch (error) {
        console.error('Error seeding listening questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to seed listening questions'
        });
    }
});

module.exports = router;
