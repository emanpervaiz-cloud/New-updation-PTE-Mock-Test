const mongoose = require('mongoose');

const ListeningQuestionSchema = new mongoose.Schema({
    // Question identification
    questionNumber: {
        type: Number,
        required: true,
        unique: true
    },
    
    // Question type: summarize_spoken_text, listening_fill_blanks, etc.
    type: {
        type: String,
        required: true,
        enum: [
            'summarize_spoken_text',
            'listening_multiple_choice',
            'listening_fill_blanks',
            'highlight_correct_summary',
            'select_missing_word',
            'highlight_incorrect_words',
            'write_from_dictation'
        ]
    },
    
    // Audio file information
    audio: {
        filename: String,
        path: String,
        url: String,
        duration: Number, // in seconds
        transcript: String // For reference/evaluation
    },
    
    // Question content
    title: {
        type: String,
        required: true
    },
    instruction: {
        type: String,
        required: true
    },
    
    // For summarize_spoken_text
    minWords: {
        type: Number,
        default: 50
    },
    maxWords: {
        type: Number,
        default: 70
    },
    
    // For questions with options (MCQ, highlight_correct_summary, etc.)
    options: [{
        id: String,
        text: String,
        isCorrect: Boolean // For admin reference
    }],
    
    // For fill in the blanks
    blanks: [{
        blankId: Number,
        correctAnswer: String,
        options: [String] // Optional: for dropdown blanks
    }],
    
    // For highlight incorrect words
    textWithBlanks: String, // Text with marked incorrect words
    incorrectWords: [{
        word: String,
        position: Number // Character position in text
    }],
    
    // Correct answers for objective questions
    correctAnswers: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    
    // Evaluation criteria
    evaluationCriteria: {
        contentWeight: { type: Number, default: 0.4 },
        grammarWeight: { type: Number, default: 0.3 },
        vocabularyWeight: { type: Number, default: 0.3 }
    },
    
    // Key points for summarize_spoken_text evaluation
    keyPoints: [String],
    
    // Model answer for reference
    modelAnswer: String,
    
    // Difficulty level
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    // Soft delete
    isActive: {
        type: Boolean,
        default: true
    }
});

// Update timestamp on save
ListeningQuestionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
ListeningQuestionSchema.index({ type: 1, difficulty: 1 });
ListeningQuestionSchema.index({ questionNumber: 1 });

module.exports = mongoose.model('ListeningQuestion', ListeningQuestionSchema);
