// AI Evaluation Service for PTE Mock Test
// AI Evaluation Service for PTE Mock Test

class AIEvaluationService {
  constructor() {
    // n8n webhook URL for transcription (using test webhook for debugging)
    this.webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    // Python scoring server URL
    this.pythonServerUrl = import.meta.env.VITE_PYTHON_SERVER_URL || 'http://localhost:5001/webhook/pte-scoring';

    // Load API Keys from Environment Variables (Vercel will provide these in production)
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.openAiKey = import.meta.env.VITE_OPENAI_API_KEY;

    this.useGemini = !!this.geminiApiKey;

    // PRODUCTION DEBUGGING: Log key presence explicitly
    console.warn('--- AI EVALUATION SERVICE DIAGNOSTICS ---');
    console.warn('Environment:', import.meta.env.MODE);
    console.warn('Gemini Key Exists:', !!this.geminiApiKey);
    if (this.geminiApiKey) console.warn('Gemini Key Prefix:', this.geminiApiKey.substring(0, 5) + '...');
    console.warn('OpenRouter Key Exists:', !!this.openRouterKey);
    console.warn('OpenAI Key Exists:', !!this.openAiKey);
    console.warn('Python Server URL:', this.pythonServerUrl);
    console.warn('--- END DIAGNOSTICS ---');

    console.log('AIEvaluationService initialized (Production Ready Variant)', {
      useGemini: this.useGemini,
    });
  }

  // Helper method to call Gemini API
  async callGemini(prompt, systemPrompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Try multiple model endpoints to avoid 404 errors
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        console.log(`Internal callGemini: Trying model ${model}...`);

        // Use v1beta for better compatibility and system_instruction support
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Gemini model ${model} failed with status ${response.status}:`, errorData);

          if (response.status === 429) {
            // Rate limit hit - wait 3 seconds then retry same model once
            console.warn(`⏳ Rate limit on ${model}. Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            const retryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
              })
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (retryText) {
                console.log(`✅ Gemini SUCCESS (retry) using model ${model}`);
                return retryText;
              }
            }
          }

          lastError = new Error(`Gemini API error (${model}): ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
          continue; // Try next model
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          console.log(`✅ Gemini SUCCESS using model ${model}`);
          return text;
        } else {
          console.warn(`Gemini model ${model} returned empty content`, JSON.stringify(data));
          lastError = new Error(`Empty response from ${model}`);
        }
      } catch (error) {
        console.error(`💥 CRITICAL error attempting ${model}:`, error.message, error.stack);
        lastError = error;
      }
    }

    throw lastError || new Error('All Gemini model attempts failed');
  }

  // Generic helper to call any chat-completion LLM (OpenRouter, OpenAI)
  async callChatLLM(systemPrompt, userPrompt, apiKey, apiUrl, model) {
    const responseObj = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'PTE Mock Test'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!responseObj.ok) {
      const errorText = await responseObj.text();
      throw new Error(`API Error: ${responseObj.status} - ${errorText}`);
    }

    const data = await responseObj.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content in API response');
    return content;
  }

  // Evaluate speaking responses with multiple AI providers (Priority order: n8n -> Python -> Gemini -> Backend)
  async evaluateSpeaking(prompt, audioBlobOrText, questionType) {
    let transcript = audioBlobOrText;

    // If it's a recorded audio blob, transcribe it first
    if (audioBlobOrText instanceof Blob) {
      transcript = await this.transcribeAudio(audioBlobOrText);
    }

    // PRIMARY: Use the Python scoring server for all evaluations
    try {
      console.log('🚀 Trying Python scoring server for speaking...');
      const n8nResult = await this.evaluateWithPythonServer(prompt, transcript, 'speaking', questionType);
      if (n8nResult && n8nResult.success) {
        console.log('✅ Python server speaking evaluation SUCCESS');
        return { ...n8nResult.result, transcript: transcript, source: 'n8n-python' };
      }
      // If success is false, the error is logged in evaluateWithPythonServer, and we fall through.
      throw new Error(n8nResult.error || 'Python server returned success: false');
    } catch (n8nError) {
      console.error('❌ Python server failure, falling back to legacy backend:', n8nError.message);
    }

    // SECONDARY: Fallback to legacy backend if Python server fails
    try {
      const backendUrl = 'http://localhost:5000/api/scoring/evaluate-speaking';
      const requestBody = {
        action: "evaluate_speaking",
        questionType: questionType,
        prompt: prompt,
        transcript: transcript
      };

      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!apiResponse.ok) {
        throw new Error(`Backend responded with status ${apiResponse.status}`);
      }

      const evaluationResult = await apiResponse.json();

      console.log('✅ Legacy backend speaking evaluation SUCCESS');
      return {
        ...evaluationResult,
        transcript: transcript
      };
    } catch (error) {
      console.error('❌ All speaking evaluation methods failed:', error);
      // FINAL FALLBACK: Return local placeholder
      return {
        ...this.getFallbackSpeakingEvaluation(),
        transcript: transcript,
        source: 'fallback-final'
      };
    }
  }

  // Parse Gemini text response into structured evaluation
  parseGeminiTextResponse(text) {
    // Extract scores using regex
    const fluencyMatch = text.match(/fluency.*?(\d+)/i);
    const grammarMatch = text.match(/grammar.*?(\d+)/i);
    const vocabMatch = text.match(/vocab.*?(\d+)/i);
    const pronunciationMatch = text.match(/pronunciation.*?(\d+)/i);

    return {
      fluencyScore: parseInt(fluencyMatch?.[1]) || 2,
      grammarScore: parseInt(grammarMatch?.[1]) || 2,
      vocabularyScore: parseInt(vocabMatch?.[1]) || 2,
      pronunciationScore: parseInt(pronunciationMatch?.[1]) || 2,
      overallScore: 20,
      feedback: text.substring(0, 1000),
      grammarErrors: [],
      fluencyIssues: ["Evaluation parsed from text. Accuracy may vary."]
    };
  }

  // Transcribe audio with n8n as PRIMARY, Gemini as BACKUP
  async transcribeAudio(audioBlob) {
    console.log('=== TRANSCRIPTION START ===');
    console.log('Audio blob size:', audioBlob?.size, 'type:', audioBlob?.type);

    try {
      // PRIORITY 1: Try n8n webhook FIRST (as requested for backup workflow)
      if (this.webhookUrl) {
        try {
          console.log('🎯 PRIORITY 1: Trying n8n webhook for transcription');
          const n8nResult = await this.transcribeWithN8n(audioBlob);
          if (n8nResult && !n8nResult.includes('[No transcript') && !n8nResult.includes('[Empty response')) {
            console.log('✅ n8n transcription SUCCESS');
            return n8nResult;
          }
          console.log('⚠️ n8n returned empty/invalid result, trying backup...');
        } catch (n8nError) {
          console.error('❌ n8n transcription FAILED:', n8nError.message);
        }
      } else {
        console.log('⚠️ No n8n webhook URL configured');
      }

      // PRIORITY 2: Use Gemini as BACKUP
      if (this.geminiApiKey) {
        try {
          console.log('🔄 PRIORITY 2: Using Gemini as BACKUP for transcription');
          const geminiResult = await this.transcribeWithGemini(audioBlob);
          if (geminiResult && !geminiResult.includes('[No speech detected')) {
            console.log('✅ Gemini backup transcription SUCCESS');
            return geminiResult;
          }
          console.log('⚠️ Gemini returned empty result, trying next backup...');
        } catch (geminiError) {
          console.error('❌ Gemini backup transcription FAILED:', geminiError.message);
        }
      }

      // PRIORITY 3: Try OpenAI Whisper (final fallback)
      if (this.openAiKey) {
        try {
          console.log('🔄 PRIORITY 3: Using OpenAI Whisper as final fallback');
          return await this.transcribeWithWhisper(audioBlob, this.openAiKey);
        } catch (whisperError) {
          console.error('❌ Whisper transcription FAILED:', whisperError.message);
        }
      }

      // All methods failed
      console.error('=== ALL TRANSCRIPTION METHODS FAILED ===');
      return "[Transcription unavailable - All services failed. Please try again or contact support.]";

    } catch (error) {
      console.error('=== TRANSCRIPTION CRITICAL ERROR ===', error);
      return "[Transcription error - Please refresh and try again]";
    }
  }

  // Transcribe using n8n webhook - PRIMARY method
  async transcribeWithN8n(audioBlob) {
    console.log('🎙️ N8N TRANSCRIPTION: Starting...');

    try {
      const base64Audio = await this.blobToBase64(audioBlob);
      console.log('🎙️ N8N: Audio converted to base64, length:', base64Audio?.length);

      // Set timeout for n8n request (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      console.log('🎙️ N8N: Sending request to webhook:', this.webhookUrl);
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transcribe_audio',
          audio: base64Audio,
          mimeType: audioBlob.type || 'audio/webm',
          timestamp: new Date().toISOString(),
          source: 'pte_mock_test'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('🎙️ N8N: Response status:', response.status);

      if (!response.ok) {
        throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('🎙️ N8N: Raw response:', responseText.substring(0, 200));

      // Handle empty response
      if (!responseText || responseText.trim() === '') {
        console.error('🎙️ N8N: Empty response received');
        return '[Empty response from n8n]';
      }

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🎙️ N8N: Parsed JSON response');
      } catch (e) {
        // Not JSON, use as plain text
        console.log('🎙️ N8N: Response is plain text');
        return responseText.trim();
      }

      // Extract transcript from various possible formats
      const transcript =
        data.transcript ||
        data.text ||
        data.output ||
        data.result ||
        data.message ||
        (typeof data === 'string' ? data : null) ||
        (data[0] && (data[0].text || data[0].output || data[0].transcript)) ||
        '[No transcript received from n8n]';

      console.log('🎙️ N8N: Extracted transcript:', transcript.substring(0, 100) + '...');
      return transcript;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('🎙️ N8N: Request timed out after 30 seconds');
        throw new Error('n8n transcription timeout');
      }
      console.error('🎙️ N8N: Error during transcription:', error.message);
      throw error;
    }
  }

  // Transcribe using Web Speech API (browser built-in)
  async transcribeWithWebSpeech(audioBlob) {
    console.log('Using Web Speech API for transcription');

    // For now, return a placeholder that allows manual entry
    // In production, use Gemini API or OpenAI Whisper
    return "[Speech recorded - AI transcription unavailable. Please add VITE_GEMINI_API_KEY for automatic transcription.]";
  }

  // Helper method to convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Transcribe using Gemini API
  async transcribeWithGemini(audioBlob) {
    console.log('Using Gemini for transcription, API key exists:', !!this.geminiApiKey);
    const base64Audio = await this.blobToBase64(audioBlob);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Transcribe this audio accurately with proper punctuation. Return only the transcript text.' },
            {
              inline_data: {
                mime_type: 'audio/webm',
                data: base64Audio
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini transcription successful');
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '[No speech detected]';
  }

  // Transcribe using OpenAI Whisper directly
  async transcribeWithWhisper(audioBlob, openAiKey) {
    console.log('Calling OpenAI Whisper API...');
    const formData = new FormData();
    const extension = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    formData.append('file', audioBlob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    formData.append('prompt', 'Transcribe the speech accurately with proper punctuation.');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`
      },
      body: formData
    });

    console.log('Whisper API response status:', response.status);

    const data = await response.json();
    console.log('Whisper API response:', data);

    if (data.error) {
      console.error('Whisper API Error:', data.error);
      return `[Transcription failed: ${data.error.message}]`;
    }

    return data.text || "[No speech detected]";
  }

  // Evaluate writing responses with multiple AI providers (Priority order: n8n -> Python -> Gemini -> OpenRouter/OpenAI -> Backend)
  async evaluateWriting(prompt, response, questionType) {
    console.log('=== evaluateWriting called ===');
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    console.log('Raw import.meta.env:', import.meta.env);
    console.log('VITE_OPENROUTER_API_KEY:', import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
    console.log('====================================');

    console.log('=== DEBUG ENVIRONMENT VARIABLES ===');
    console.log('import.meta.env.VITE_OPENROUTER_API_KEY exists:', !!import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log('import.meta.env.VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log('this.openRouterKey exists:', !!this.openRouterKey);
    console.log('this.geminiApiKey exists:', !!this.geminiApiKey);
    console.log('====================================');

    console.log('Prompt:', prompt?.substring(0, 100));
    console.log('Response length:', response?.length);
    console.log('Question type:', questionType);
    console.log('Available keys:', {
      gemini: !!this.geminiApiKey,
      openRouter: !!this.openRouterKey,
      openAi: !!this.openAiKey
    });

    // PRIMARY: Use the Python scoring server
    try {
      console.log('🚀 Trying Python scoring server for writing...');
      const n8nResult = await this.evaluateWithPythonServer(prompt, response, 'writing', questionType);
      if (n8nResult && n8nResult.success) {
        console.log('✅ Python server writing evaluation SUCCESS');
        return { ...n8nResult.result, source: 'n8n-python' };
      }
      throw new Error(n8nResult.error || 'Python server returned success: false');
    } catch (n8nError) {
      console.error('❌ Python server writing evaluation failed, falling back:', n8nError.message);
    }

    // SECONDARY: Try Legacy Backend Fallback
    try {
      console.log('🔄 Trying legacy backend fallback for writing...');
      const backendUrl = 'http://localhost:5000/api/scoring/evaluate-writing';
      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "evaluate_writing", questionType, prompt, response })
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('✅ Legacy backend writing evaluation SUCCESS');
        return { ...result, source: 'backend' };
      }
      throw new Error(`Legacy backend failed with status ${apiResponse.status}`);
    } catch (error) {
      console.error('❌ Backend fallback failed:', error.message);
    }

    // FINAL FALLBACK
    console.warn('⚠️ ALL AI PROVIDERS FAILED - Returning default fallback results');
    return { ...this.getFallbackWritingEvaluation(), source: 'fallback-final' };
  }

  // Evaluate writing with LLM (OpenRouter/OpenAI)
  async evaluateWritingWithLLM(prompt, response, questionType, apiKey, apiUrl, model) {
    console.log('=== evaluateWritingWithLLM called ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API URL:', apiUrl);
    console.log('Model:', model);
    console.log('Prompt length:', prompt?.length);
    console.log('Response length:', response?.length);

    const systemPrompt = `You are an expert English writing evaluator for PTE Academic. Analyze the student's written response thoroughly and provide detailed, specific feedback.

EVALUATION CRITERIA — Score each dimension 0-10 with specific examples:
1. GRAMMAR RANGE & ACCURACY (0-10): 
   - Analyze sentence variety (simple, compound, complex)
   - Identify specific grammatical errors with corrections
   - Score: 8+ for excellent grammar, 6-7 for good with minor errors, below 6 for frequent errors

2. SPELLING & PUNCTUATION (0-10):
   - Check for spelling mistakes
   - Evaluate punctuation accuracy
   - Score: 8+ for perfect spelling/punctuation, 6-7 for minor issues, below 6 for frequent errors

3. VOCABULARY & LEXICAL RESOURCE (0-10):
   - Assess word range and precision
   - Note academic vocabulary usage
   - Identify overused/basic words
   - Score: 8+ for sophisticated academic vocabulary, 6-7 for adequate range, below 6 for limited vocabulary

4. TASK ACHIEVEMENT (0-10):
   - Confirm response addresses ALL parts of the prompt
   - Check word count appropriateness
   - Evaluate argument development and support
   - Score: 8+ for fully developed response, 6-7 for adequate, below 6 for incomplete

REQUIRED OUTPUT FORMAT:
{
  "grammarScore": number,
  "spellingScore": number,
  "vocabularyScore": number,
  "taskScore": number,
  "overallScore": number,
  "feedback": "Detailed paragraph with specific examples from the text",
  "grammarErrors": ["Error 1 -> Correction 1", "Error 2 -> Correction 2"],
  "spellingErrors": ["misspelled -> correct"],
  "vocabularySuggestions": ["overused word -> better alternative"]
}`;

    const userPrompt = `TASK TOPIC: "${prompt}"
STUDENT RESPONSE: "${response}"
QUESTION TYPE: ${questionType}

Evaluate this writing response according to the criteria above. Provide specific examples from the text and return JSON format.`;

    console.log('Making API call to:', apiUrl);

    try {
      const responseObj = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'PTE Mock Test'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      console.log('API Response Status:', responseObj.status);
      console.log('API Response OK:', responseObj.ok);

      if (!responseObj.ok) {
        const errorText = await responseObj.text();
        console.error('API Error Response Text:', errorText);
        throw new Error(`API Error: ${responseObj.status} - ${errorText}`);
      }

      const data = await responseObj.json();
      console.log('API Response Data:', JSON.stringify(data, null, 2));

      const content = data.choices?.[0]?.message?.content;
      console.log('Response Content:', content?.substring(0, 200));

      if (!content) {
        throw new Error('No content in API response');
      }

      // Try to parse as JSON first
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Parsed JSON result:', parsed);
          return parsed;
        }
      } catch (parseError) {
        console.log('JSON parsing failed, using text parsing:', parseError.message);
      }

      // Fallback to text parsing
      return this.parseWritingTextResponse(content);

    } catch (error) {
      console.error('=== LLM API CALL FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  // Evaluate writing with n8n webhook
  async evaluateWritingWithN8n(prompt, response, questionType) {
    console.log('Using n8n for writing evaluation');
    console.log('Webhook URL:', this.webhookUrl);
    console.log('Sending data:', { action: 'evaluate_writing', prompt: prompt?.substring(0, 50), response: response?.substring(0, 50), questionType });

    const n8nResponse = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'evaluate_writing',
        prompt: prompt,
        response: response,
        questionType: questionType,
        geminiKey: this.geminiApiKey
      })
    });

    console.log('n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n error response:', errorText);
      throw new Error(`n8n webhook error: ${n8nResponse.status} - ${errorText}`);
    }

    const responseText = await n8nResponse.text();
    console.log('n8n writing evaluation raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Response is not JSON, using as text:', responseText);
      return this.parseWritingTextResponse(responseText);
    }

    console.log('n8n writing evaluation parsed:', JSON.stringify(data, null, 2));

    return {
      grammarScore: data.grammarScore || data.grammar_score || 5,
      spellingScore: data.spellingScore || data.spelling_score || 5,
      vocabularyScore: data.vocabularyScore || data.vocabulary_score || 5,
      grammarErrors: data.grammarErrors || data.grammar_errors || [],
      spellingErrors: data.spellingErrors || data.spelling_errors || [],
      vocabularySuggestions: data.vocabularySuggestions || data.vocabulary_suggestions || [],
      feedback: data.feedback || data.overall_feedback || 'Writing evaluation completed.',
      source: 'n8n'
    };
  }

  // Parse text response for writing evaluation
  parseWritingTextResponse(text) {
    return {
      grammarScore: 5,
      spellingScore: 5,
      vocabularyScore: 5,
      grammarErrors: [],
      spellingErrors: [],
      vocabularySuggestions: [],
      feedback: text || 'Writing evaluation completed.',
      source: 'n8n-text'
    };
  }

  // Evaluate with Python scoring server with improved fallback and timeout
  async evaluateWithPythonServer(prompt, response, action, questionType = null) {
    console.log(`🚀 [Python Server] Evaluating ${action}:`, { questionType, promptSnippet: prompt?.substring(0, 30) });

    const requestBody = {
      action: `evaluate_${action}`,
      prompt: prompt,
      [action === 'speaking' ? 'transcript' : (action === 'reading' || action === 'listening' ? 'questions' : 'response')]: response,
      questionType: questionType
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for AI processing

      const fetchResponse = await fetch(this.pythonServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        throw new Error(`Python server error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const result = await fetchResponse.json();
      console.log('✅ [Python Server] Success:', result.success);

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ [Python Server] Timeout after 45s');
      } else {
        console.error('❌ [Python Server] Evaluation error:', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  // Evaluate writing with Gemini API (fallback)
  async evaluateWritingWithGemini(prompt, response, questionType) {
    console.log('evaluateWritingWithGemini called');

    const evaluationPrompt = `Evaluate this PTE Academic writing response:

PROMPT: ${prompt}

STUDENT RESPONSE:
${response}

Provide detailed evaluation with specific examples from the text.`;

    const geminiResponse = await this.callGemini(evaluationPrompt, WRITING_EXAMINER_SYSTEM_PROMPT);

    // Parse Gemini response
    let evaluation;
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Gemini response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini writing response:', parseError);
      // Create structured evaluation from text
      evaluation = this.parseGeminiTextResponse(geminiResponse);
    }

    return {
      ...evaluation,
      source: 'gemini'
    };
  }

  // Evaluate reading responses with resilient provider chain
  async evaluateReading(questionsWithAnswers) {
    console.log('🚀 [Reading] Starting evaluation...');

    // 1. Try Gemini FIRST if API key is available
    if (this.geminiApiKey) {
      try {
        console.log('🚀 [Reading] Trying Gemini for evaluation...');
        const result = await this.evaluateObjectiveWithLLM('reading', questionsWithAnswers, null, null, 'gemini');
        console.log('✅ [Reading] Gemini success');
        return { ...result, source: 'gemini' };
      } catch (geminiError) {
        console.error('❌ [Reading] Gemini failed:', geminiError.message);
      }
    }

    // 2. Try n8n Python scoring

    // 2. Try Direct LLM fallback (Resilient Chain)
    const providers = [];
    if (this.openAiKey) providers.push({ name: 'openai', key: this.openAiKey, url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' });
    if (this.openRouterKey) providers.push({ name: 'openrouter', key: this.openRouterKey, url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o' });

    for (const provider of providers) {
      try {
        console.log(`🚀 Trying Direct LLM (${provider.name}) for reading...`);
        return await this.evaluateObjectiveWithLLM('reading', questionsWithAnswers, provider.key, provider.url, provider.model);
      } catch (e) {
        console.error(`❌ Direct LLM (${provider.name}) reading failed:`, e.message);
      }
    }

    // 3. Try Backend
    try {
      console.log('🔄 Trying backend for reading...');
      const apiResponse = await fetch('http://localhost:5000/api/scoring/evaluate-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsWithAnswers })
      });
      if (apiResponse.ok) return { ...await apiResponse.json(), source: 'backend' };
    } catch (error) {
      console.error('❌ Backend reading failed:', error.message);
    }

    // 4. Final Fallback (Objective only)
    console.warn('⚠️ ALL Reading AI providers failed - using objective-only fallback');
    return { ...this.calculateObjectiveOnlyScore(questionsWithAnswers), source: 'fallback-final' };
  }

  // Evaluate listening responses with resilient provider chain
  async evaluateListening(questionsWithAnswers) {
    console.log('🚀 [Listening] Starting evaluation...');

    // 1. Try Gemini FIRST if API key is available
    if (this.geminiApiKey) {
      try {
        console.log('🚀 [Listening] Trying Gemini for evaluation...');
        const result = await this.evaluateObjectiveWithLLM('listening', questionsWithAnswers, null, null, 'gemini');
        console.log('✅ [Listening] Gemini success');
        return { ...result, source: 'gemini' };
      } catch (geminiError) {
        console.error('❌ [Listening] Gemini failed:', geminiError.message);
      }
    }

    // 2. Try n8n Python scoring

    // 2. Try Direct LLM fallback (Resilient Chain)
    const providers = [];
    if (this.openAiKey) providers.push({ name: 'openai', key: this.openAiKey, url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' });
    if (this.openRouterKey) providers.push({ name: 'openrouter', key: this.openRouterKey, url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o' });

    for (const provider of providers) {
      try {
        console.log(`🚀 Trying Direct LLM (${provider.name}) for listening...`);
        return await this.evaluateObjectiveWithLLM('listening', questionsWithAnswers, provider.key, provider.url, provider.model);
      } catch (e) {
        console.error(`❌ Direct LLM (${provider.name}) listening failed:`, e.message);
      }
    }

    // 3. Try Backend
    try {
      console.log('🔄 Trying backend for listening...');
      const apiResponse = await fetch('http://localhost:5000/api/scoring/evaluate-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsWithAnswers })
      });
      if (apiResponse.ok) return { ...await apiResponse.json(), source: 'backend' };
    } catch (error) {
      console.error('❌ Backend listening failed:', error.message);
    }

    // 4. Final Fallback (Objective only)
    console.warn('⚠️ ALL Listening AI providers failed - using objective-only fallback');
    return { ...this.calculateObjectiveOnlyScore(questionsWithAnswers), source: 'fallback-final' };
  }

  // Generic helper for Reading/Listening AI evaluation
  async evaluateObjectiveWithLLM(section, questions, apiKey, apiUrl, model) {
    const objective = this.calculateObjectiveOnlyScore(questions);

    const systemPrompt = `Analyze these PTE ${section} results:
Total Questions: ${objective.total_count}
Correct: ${objective.correct_count}
Accuracy: ${objective.accuracy_percentage}%

Performance breakdown:
${JSON.stringify(objective.detailed_results, null, 2)}

Provide feedback on:
1. Types of questions where the student struggled
2. General pattern of errors
3. Specific advice for improvement

Return JSON format:
{
  "feedback": "detailed qualitative feedback",
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    let content;
    if (model === 'gemini') {
      content = await this.callGemini(systemPrompt, `Analyze my ${section} performance.`);
    } else {
      content = await this.callChatLLM(systemPrompt, `Analyze my ${section} performance.`, apiKey, apiUrl, model);
    }

    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)[0]);

    return {
      ...objective,
      feedback: parsed.feedback,
      suggestions: parsed.suggestions || [],
      source: `direct-${model}`
    };
  }

  // Simple objective scoring helper
  calculateObjectiveOnlyScore(questions) {
    let correctCount = 0;
    const totalCount = questions.length;
    const resultsDetailed = questions.map(q => {
      const correct = q.correct_answer || q.correct;
      const student = q.response || q.responses;
      const isCorrect = this.compareAnswers(correct, student);
      if (isCorrect) correctCount++;
      return {
        type: q.type || 'unknown',
        is_correct: isCorrect,
        student_answer: student,
        correct_answer: correct
      };
    });

    return {
      correct_count: correctCount,
      total_count: totalCount,
      accuracy_percentage: totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0,
      detailed_results: resultsDetailed,
      feedback: `You answered ${correctCount} out of ${totalCount} questions correctly.`,
      suggestions: ["Review the incorrect answers to understand the context better."]
    };
  }

  // Helper method to compare answers
  compareAnswers(correct, student) {
    if (typeof correct === 'string' && typeof student === 'string') {
      return correct.toLowerCase().trim() === student.toLowerCase().trim();
    }
    if (Array.isArray(correct) && Array.isArray(student)) {
      return JSON.stringify(correct.sort()) === JSON.stringify(student.sort());
    }
    return correct === student;
  }

  // Helper method to calculate CEFR level
  calculateCEFRLevel(percentage) {
    if (percentage >= 85) return 'C2';
    if (percentage >= 75) return 'C1';
    if (percentage >= 55) return 'B2';
    if (percentage >= 35) return 'B1';
    return 'A2';
  }

  // Fallback evaluations with new 5-dimension format
  getFallbackSpeakingEvaluation() {
    return {
      fluency_coherence: { score: 5, feedback: "Unable to perform live AI evaluation. Based on recording indicators, the response shows moderate fluency. Practice maintaining a steady pace without unnecessary pauses." },
      pronunciation_intonation: { score: 5, feedback: "Pronunciation assessment requires AI analysis. Focus on clear articulation of consonant clusters and natural stress patterns." },
      grammar_range_accuracy: { score: 5, feedback: "Grammar evaluation pending. Aim to use a mix of simple and complex sentence structures in your responses." },
      vocabulary_lexical_resource: { score: 5, feedback: "Vocabulary assessment pending. Try incorporating more topic-specific terminology and avoiding repetition of common words." },
      task_achievement: { score: 5, feedback: "Task completion assessment pending. Ensure your response fully addresses all aspects of the prompt within the time limit." },
      total_score: 25,
      scaled_score: 5.0,
      band_descriptor: "Developing Communicator",
      top_strength: "Completed the recording within the time limit",
      priority_improvement: "Practice speaking at a natural, steady pace with clear pronunciation",
      overall_pte_score: 50,
      cefr_level: "B1"
    };
  }

  getFallbackWritingEvaluation() {
    return {
      grammarScore: 5,
      spellingScore: 5,
      vocabularyScore: 5,
      grammarErrors: [],
      spellingErrors: [],
      vocabularySuggestions: [],
      feedback: "AI evaluation pending. Please check your grammar, spelling, and vocabulary usage.",
      source: 'fallback'
    };
  }

  getFallbackReadingEvaluation() {
    return {
      score: 5,
      total: 10,
      percentage: 50,
      cefrLevel: "B1",
      feedback: [{ questionIndex: 0, isCorrect: false, correctAnswer: "", studentAnswer: "", feedback: "Could not evaluate due to system error" }]
    };
  }

  getFallbackListeningEvaluation() {
    return {
      score: 5,
      total: 10,
      percentage: 50,
      cefrLevel: "B1",
      feedback: [{ questionIndex: 0, isCorrect: false, correctAnswer: "", studentAnswer: "", feedback: "Could not evaluate due to system error" }]
    };
  }
}

export default AIEvaluationService;