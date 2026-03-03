# AI Scoring Setup for PTE Mock Test

This document explains how to set up and use the AI scoring system with n8n and Python integration.

## Overview

The AI scoring system provides automated evaluation for all PTE test modules:
- Speaking (with audio transcription)
- Writing 
- Reading
- Listening

The system uses a priority chain for AI evaluation:
1. **n8n + Python Server** (Primary)
2. **Gemini API** (Secondary)
3. **Backend Server** (Fallback)

## Components

### 1. Frontend AI Evaluation Service
Located at `src/services/aiEvaluationService.js`, this service manages:
- Audio transcription
- AI evaluation prioritization
- Fallback mechanisms
- Integration with multiple AI providers

### 2. Python AI Scoring Service
Located at `scripts/ai_scoring_service.py`, this service:
- Provides comprehensive AI evaluation for all PTE modules
- Supports multiple AI providers (Gemini, OpenRouter, OpenAI)
- Offers structured scoring with detailed feedback

### 3. Python Scoring Server
Located at `scripts/ai_scoring_server.py`, this Flask server:
- Exposes webhook endpoints for n8n integration
- Handles requests from n8n workflows
- Processes AI scoring requests

### 4. Enhanced n8n Workflow
The enhanced workflow at `n8n-transcription-workflow.json` (updated) and `n8n-pte-full-workflow.json`:
- Handles all PTE module evaluations (Speaking, Writing, Reading, Listening)
- Includes comprehensive AI prompts for each module:
  - Speaking: Detailed evaluation of fluency, pronunciation, grammar, vocabulary and task achievement
  - Writing: Assessment of coherence, spelling/punctuation, grammar, vocabulary and task achievement
  - Reading: Evaluation of comprehension, detail recognition, inference skills, vocabulary and time management
  - Listening: Assessment of comprehension accuracy, detail recognition, contextual understanding, vocabulary and note-taking
- Routes to appropriate evaluation services
- Maintains backward compatibility with transcription

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Pip package manager

### Installation

1. **Run the setup script** (Windows):
   ```
   setup_ai_scoring.bat
   ```

2. **Or install manually**:

   Install Python dependencies:
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

   Install Node.js dependencies:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your API keys:
   ```bash
   # For AI evaluation
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key  
   VITE_OPENAI_API_KEY=your_openai_api_key
   
   # For n8n transcription
   VITE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/endpoint
   
   # For Python scoring server
   VITE_PYTHON_SERVER_URL=http://localhost:5001/webhook/pte-scoring
   ```

## Running the System

### 1. Start the Python Scoring Server
```bash
npm run start-python-server
```
Or directly:
```bash
cd scripts
python ai_scoring_server.py
```

### 2. Start the Main Application
```bash
npm run dev
```

### 3. Configure n8n
Import the `n8n-enhanced-workflow.json` file into your n8n instance, or use the existing workflow at `n8n-transcription-workflow.json`.

## Priority Chain Details

The system evaluates responses in this order:

### Speaking Evaluation
1. Transcribe audio using n8n workflow (if audio provided)
2. Send to Python scoring server via webhook
3. If Python server unavailable, use Gemini API
4. If Gemini unavailable, fall back to backend server
5. If all fail, use local fallback evaluation

### Writing Evaluation
1. Send to Python scoring server via webhook
2. If Python server unavailable, use Gemini API
3. If Gemini unavailable, fall back to backend server
4. If all fail, use local fallback evaluation

### Reading & Listening Evaluation
1. Send to Python scoring server via webhook
2. If Python server unavailable, fall back to backend server
3. If all fail, use local fallback evaluation

## API Endpoints

### Python Scoring Server
- `POST /webhook/pte-scoring` - Main webhook endpoint for n8n
- `POST /api/test-evaluation` - Direct evaluation endpoint
- `GET /health` - Health check

### Request Format
```json
{
  "action": "evaluate_speaking|evaluate_writing|evaluate_reading|evaluate_listening|transcribe_audio",
  "prompt": "Question prompt (for speaking/writing)",
  "transcript|response": "Student response",
  "questionType": "Question type identifier",
  "questions": "Array of questions (for reading/listening)"
}
```

### Response Format
```json
{
  "success": true|false,
  "result": { /* evaluation results */ },
  "score": numeric_score,
  "feedback": "detailed feedback"
}
```

## Troubleshooting

### Python Server Not Starting
- Ensure Python and required packages are installed
- Check firewall settings for port 5001
- Verify Python dependencies with `pip list`

### AI Evaluation Not Working
- Check API keys in `.env` file
- Verify connectivity to AI services
- Review browser console for error messages

### n8n Integration Issues
- Confirm webhook URLs match in both n8n and frontend
- Check n8n logs for errors
- Verify n8n workflow is active

## Customization

You can customize the evaluation criteria by modifying the system prompts in:
- `src/services/aiEvaluationService.js` (frontend)
- `scripts/ai_scoring_service.py` (Python)

The scoring algorithms can be adjusted in the Python service file to meet specific requirements.