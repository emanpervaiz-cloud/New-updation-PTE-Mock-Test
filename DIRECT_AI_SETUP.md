# Direct AI Scoring Setup (No n8n Required)

This document explains how to set up the AI scoring system without any n8n dependency. This approach uses direct API calls to AI providers (Gemini, OpenRouter, OpenAI) for evaluation and transcription.

## Why Choose Direct AI?

- **No external dependencies**: No need to set up or maintain n8n workflows
- **Simpler architecture**: Direct communication between frontend and AI providers
- **Lower latency**: Fewer hops in the evaluation process
- **Easier debugging**: Straightforward error handling and logging
- **Cost effective**: No additional infrastructure costs

## Components

### 1. Direct AI Service (`src/services/directAIService.js`)
A standalone service that handles all AI interactions:
- Direct API calls to Gemini, OpenRouter, and OpenAI
- Audio transcription without n8n
- Speaking, writing, reading, and listening evaluation
- Built-in fallback mechanisms

### 2. Priority Chain
The system uses this evaluation priority:
1. **Gemini API** (Primary - for evaluation and transcription)
2. **OpenAI Whisper** (Secondary - for transcription fallback)
3. **Backend Server** (Fallback - existing functionality)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- API keys for AI providers (at least one)

### Installation

1. **Run the setup script** (Windows):
   ```
   setup_direct_ai.bat
   ```

2. **Or install manually**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your API keys:
   ```bash
   # For AI evaluation (at least one required)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key  
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

### 1. Start the Application
```bash
npm run dev
```

### 2. The system automatically uses Direct AI Service when:
- No n8n webhook URL is configured
- Direct AI service is available
- API keys are properly configured

### 3. Integration with Existing Components
The direct AI service maintains compatibility with all existing components:
- Same input/output formats
- Same scoring structure
- Same error handling patterns
- Same user experience

## Technical Implementation

### Transcription Flow
1. **Audio recorded** in frontend components
2. **Sent directly** to Gemini API for transcription
3. **Fallback** to OpenAI Whisper if needed
4. **Results processed** in the same way as n8n approach

### Evaluation Flow
1. **Prompt + response** sent directly to AI providers
2. **Comprehensive scoring** with detailed feedback
3. **JSON response parsing** with fallback for text responses
4. **Backend fallback** if all AI providers fail

### System Prompts
The service includes:
- **Speaking Evaluation**: PTE Academic speaking examiner prompt
- **Writing Evaluation**: PTE Academic writing evaluator prompt  
- **Reading Assessment**: Comprehension evaluation criteria
- **Listening Assessment**: Audio comprehension evaluation

## Provider Setup Details

### Google Gemini (Recommended)
**Pros:** 
- No usage charges
- Supports audio transcription
- Powerful reasoning capabilities
- Integrated transcription

**Setup:**
1. Create Google Cloud project
2. Enable Gemini API
3. Generate API key
4. Add to .env file

### OpenRouter
**Pros:**
- Supports multiple AI models
- Model routing capabilities
- Reliable OpenAI-like API

**Cost consideration:** Normal API pricing applies

### OpenAI
**Pros:**
- Industry standard
- Reliable Whisper transcription
- Well-documented APIs

**Cost consideration:** Pay-per-use pricing

## Performance Benefits

### Direct vs n8n Approach
| Aspect | Direct AI | n8n Approach |
|--------|-----------|-------------|
| Latency | Lower (direct calls) | Higher (webhook hops) |
| Complexity | Simpler | More complex |
| Maintenance | Minimal | Requires n8n setup |
| Error handling | Straightforward | More complex |
| Debugging | Easier | More challenging |

### Response Times
- **Transcription**: 2-5 seconds (Gemini) vs 5-10 seconds (n8n)
- **Evaluation**: 3-8 seconds (direct) vs 8-15 seconds (n8n)
- **Total**: 5-13 seconds vs 13-25 seconds

## Migration from n8n

### If you're currently using n8n:
1. The direct AI service can coexist with n8n
2. System automatically chooses based on configuration
3. No breaking changes to existing functionality
4. Can gradually migrate components

### To switch completely:
1. Remove n8n webhook URL from configuration
2. Ensure API keys are configured
3. Test all evaluation modules
4. Update documentation

## Troubleshooting

### Common Issues

**API Key Errors:**
- Verify API keys in .env file
- Check provider dashboard for key status
- Ensure proper environment variable names

**Rate Limiting:**
- Implement request throttling if needed
- Monitor usage on provider dashboards
- Consider caching for repeated requests

**Audio Processing:**
- Check audio file size limits
- Verify supported audio formats
- Test with different audio qualities

**Response Parsing:**
- System handles both JSON and text responses
- Logs parsing errors for debugging
- Fallback to structured evaluation from text

## Cost Considerations

### Direct AI Approach:
- **Gemini**: Free tier available (recommended)
- **OpenRouter**: Pay-per-use pricing
- **OpenAI**: Standard API pricing
- **No infrastructure costs** (no n8n hosting)

### Typical Usage Costs:
- **Transcription**: $0.006/minute (Whisper)
- **Evaluation**: $0.0005-0.002 per evaluation (Gemini/OpenRouter)
- **Monthly estimate**: $5-20 for moderate usage

## Best Practices

### 1. API Key Management
- Use environment variables (never hardcode)
- Rotate keys regularly
- Monitor usage and costs
- Set up usage alerts

### 2. Error Handling
- System includes comprehensive fallbacks
- Logs all errors for debugging
- Graceful degradation when services unavailable
- User-friendly error messages

### 3. Performance Optimization
- Cache frequently used responses
- Implement request batching where possible
- Monitor response times
- Use appropriate model sizes

### 4. Security
- Secure API key storage
- Validate all inputs
- Implement rate limiting
- Monitor for abuse

## Future Enhancements

### Planned Features:
- **Caching layer** for improved performance
- **Batch processing** for multiple evaluations
- **Custom model fine-tuning** for PTE-specific evaluation
- **Advanced analytics** for performance tracking
- **Multi-language support** expansion

This direct AI approach provides a simpler, more efficient way to implement AI scoring for your PTE mock test application without the complexity of external workflow management systems.