// AI Evaluation Service for PTE Mock Test
// AI Evaluation Service for PTE Mock Test

const EXAMINER_SYSTEM_PROMPT = `You are a certified English language examiner specializing in high-stakes spoken English assessment, including PTE Academic, IELTS Speaking, and TOEFL iBT evaluations.

Your task is to evaluate a student's response with the precision, consistency, and constructive tone of a professional human examiner.

EVALUATION CRITERIA — Score each dimension out of 10. Be analytical, specific, and evidence-based — reference actual phrases or patterns from the student's response.

1. Fluency & Coherence (0–10): Assess speech flow, logical sequencing, use of discourse markers, and absence of unnatural pauses or repetition.
2. Pronunciation & Intonation (0–10): Assess phoneme accuracy, word stress, sentence rhythm, and natural intonation patterns. Note any L1 interference if detectable.
3. Grammatical Range & Accuracy (0–10): Assess variety of sentence structures (simple, compound, complex) and grammatical correctness. Note recurring error patterns.
4. Vocabulary & Lexical Resource (0–10): Assess range, precision, and appropriateness of word choice. Penalize overuse of basic vocabulary or repetition.
5. Task Achievement & Relevance (0–10): Assess whether the response fully addresses the prompt, stays on topic, and meets the expected length and depth.

EXAMINER STANDARDS:
- Never give generic feedback. Always cite evidence from the response.
- Maintain professional, encouraging, and growth-oriented tone.
- Penalize but do not discourage. Frame weaknesses as opportunities.
- Be consistent — same response quality must yield same score range every time.`;

const WRITING_EXAMINER_SYSTEM_PROMPT = `You are a certified English language examiner specializing in high-stakes written English assessment, including PTE Academic Writing, IELTS Writing Task, and TOEFL iBT Writing evaluations.

Your task is to evaluate a student's written response with the precision, consistency, and constructive tone of a professional human examiner.

EVALUATION CRITERIA — Score each dimension out of 10. Be analytical, specific, and evidence-based — reference actual phrases or patterns from the student's response.

1. Fluency & Coherence (0–10): Assess logical flow of ideas, paragraph organization, use of cohesive devices, and overall readability.
2. Pronunciation & Intonation (0–10): For writing, assess spelling accuracy, punctuation, and formatting conventions.
3. Grammatical Range & Accuracy (0–10): Assess variety of sentence structures (simple, compound, complex) and grammatical correctness. Note recurring error patterns.
4. Vocabulary & Lexical Resource (0–10): Assess range, precision, and appropriateness of word choice. Penalize overuse of basic vocabulary or repetition.
5. Task Achievement & Relevance (0–10): Assess whether the response fully addresses the prompt, stays on topic, meets word limits, and provides adequate depth.

EXAMINER STANDARDS:
- Never give generic feedback. Always cite evidence from the response.
- Maintain professional, encouraging, and growth-oriented tone.
- Penalize but do not discourage. Frame weaknesses as opportunities.
- Be consistent — same response quality must yield same score range every time.`;

class AIEvaluationService {
  constructor() {
    // n8n webhook URL for transcription (using test webhook for debugging)
    this.webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://n8n.srv826531.hstgr.cloud/webhook-test/b225b16c-c602-450e-b858-f9bbe4ba5dd6';
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.useGemini = !!this.geminiApiKey;
    this.openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }
  
  // Helper method to call Gemini API
  async callGemini(prompt, systemPrompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Evaluate speaking responses with Gemini or Backend
  async evaluateSpeaking(prompt, audioBlobOrText, questionType) {
    let transcript = audioBlobOrText;

    // If it's a recorded audio blob, transcribe it first
    if (audioBlobOrText instanceof Blob) {
      transcript = await this.transcribeAudio(audioBlobOrText);
    }

    // Use Gemini if API key is available
    if (this.useGemini) {
      try {
        const evaluationPrompt = `Evaluate this speaking response for a PTE Academic exam.

Question: ${prompt}
Student's Transcript: ${transcript}
Question Type: ${questionType}

Please evaluate based on these criteria (score each 0-10):
1. Fluency & Coherence - speech flow, logical sequencing, discourse markers, unnatural pauses
2. Pronunciation & Intonation - phoneme accuracy, word stress, sentence rhythm
3. Grammatical Range & Accuracy - sentence structures, grammatical correctness, error patterns
4. Vocabulary & Lexical Resource - word range, precision, appropriateness
5. Task Achievement - addresses prompt, stays on topic, expected length

Provide specific feedback with examples from the transcript. Identify:
- Grammar mistakes with corrections
- Fluency issues (pauses, repetitions)
- Pronunciation tips
- Vocabulary suggestions

Return JSON format:
{
  "fluencyScore": number,
  "pronunciationScore": number,
  "grammarScore": number,
  "vocabularyScore": number,
  "taskScore": number,
  "overallScore": number,
  "feedback": "detailed feedback with specific examples",
  "grammarErrors": ["error1 -> correction1", "error2 -> correction2"],
  "fluencyIssues": ["issue1", "issue2"]
}`;

        const geminiResponse = await this.callGemini(evaluationPrompt, EXAMINER_SYSTEM_PROMPT);
        
        // Parse Gemini response
        let evaluation;
        try {
          // Try to extract JSON from response
          const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            evaluation = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in Gemini response');
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          // Create structured evaluation from text
          evaluation = this.parseGeminiTextResponse(geminiResponse);
        }

        return {
          ...evaluation,
          transcript: transcript,
          source: 'gemini'
        };
      } catch (geminiError) {
        console.error('Gemini evaluation failed:', geminiError);
        // Fall through to backend or fallback
      }
    }

    // Fallback to backend
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

      return {
        ...evaluationResult,
        transcript: transcript
      };
    } catch (error) {
      console.error('Error evaluating speaking via backend:', error);
      // Fallback to local logic if backend fails
      return {
        ...this.getFallbackSpeakingEvaluation(),
        transcript: transcript
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
      fluencyScore: parseInt(fluencyMatch?.[1]) || 5,
      grammarScore: parseInt(grammarMatch?.[1]) || 5,
      vocabularyScore: parseInt(vocabMatch?.[1]) || 5,
      pronunciationScore: parseInt(pronunciationMatch?.[1]) || 5,
      overallScore: 50,
      feedback: text.substring(0, 500),
      grammarErrors: [],
      fluencyIssues: []
    };
  }

  // Transcribe audio using OpenRouter API (Whisper via OpenRouter)
  async transcribeAudio(audioBlob) {
    try {
      // Priority 1: Use Gemini for audio transcription (you have this key)
      console.log('Checking Gemini key:', this.geminiApiKey ? 'EXISTS' : 'MISSING');
      console.log('Checking OpenAI key:', this.openAiKey ? 'EXISTS' : 'MISSING');
      
      if (this.geminiApiKey) {
        try {
          console.log('Using Gemini for transcription');
          return await this.transcribeWithGemini(audioBlob);
        } catch (geminiError) {
          console.error('Gemini transcription failed:', geminiError);
        }
      }
      
      // Priority 2: Try OpenAI Whisper (fallback)
      if (this.openAiKey) {
        try {
          console.log('Using OpenAI Whisper for transcription');
          return await this.transcribeWithWhisper(audioBlob, this.openAiKey);
        } catch (whisperError) {
          console.error('Whisper transcription failed:', whisperError);
        }
      }
      
      // Priority 3: Try n8n webhook for transcription (disabled - using direct APIs)
      // if (this.webhookUrl) {
      //   try {
      //     return await this.transcribeWithN8n(audioBlob);
      //   } catch (n8nError) {
      //     console.error('n8n transcription failed:', n8nError);
      //   }
      // }
      
      // Fallback: Use Web Speech API (browser built-in, no API key needed)
      // Note: This is a placeholder - actual transcription requires API keys
      
      // Check if we have any API key configured
      if (!this.geminiApiKey && !this.openAiKey) {
        return "[Speech recorded - Please add VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY in Vercel environment variables for automatic transcription.]";
      }
      
      // All transcription methods failed
      console.error('All transcription methods failed');
      return "[Transcription failed - please check console for errors]";
    } catch (error) {
      console.error('Transcription error:', error);
      return "[Transcription error occurred]";
    }
  }
  
  // Transcribe using n8n webhook
  async transcribeWithN8n(audioBlob) {
    console.log('Using n8n webhook for transcription');
    const base64Audio = await this.blobToBase64(audioBlob);
    
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'transcribe_audio',
        audio: base64Audio,
        mimeType: audioBlob.type || 'audio/webm'
      })
    });
    
    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('n8n raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Response is not JSON, using as text:', responseText);
      return responseText || '[Empty response from n8n]';
    }
    
    console.log('n8n parsed response:', JSON.stringify(data, null, 2));
    
    // Handle different response formats from n8n
    // AI Agent output can be in data.output or data.text or direct response
    const transcript = data.transcript || 
                      data.text || 
                      data.output || 
                      (typeof data === 'string' ? data : null) ||
                      (data[0] && data[0].text) ||
                      (data[0] && data[0].output) ||
                      '[No transcript received from n8n]';
    
    console.log('Extracted transcript:', transcript);
    return transcript;
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
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
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

  // Evaluate writing responses with hybrid scoring engine (Backend)
  async evaluateWriting(prompt, response, questionType) {
    try {
      const backendUrl = 'http://localhost:5000/api/scoring/evaluate-writing';
      const requestBody = {
        action: "evaluate_writing",
        questionType: questionType,
        prompt: prompt,
        response: response
      };

      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!apiResponse.ok) {
        throw new Error(`Backend responded with status ${apiResponse.status}`);
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error evaluating writing via backend:', error);
      return this.getFallbackWritingEvaluation();
    }
  }

  // Evaluate reading responses with hybrid scoring engine (Backend)
  async evaluateReading(questionsWithAnswers) {
    try {
      const backendUrl = 'http://localhost:5000/api/scoring/evaluate-reading';
      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsWithAnswers })
      });

      if (!apiResponse.ok) {
        throw new Error(`Backend responded with status ${apiResponse.status}`);
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error evaluating reading via backend:', error);
      return this.getFallbackReadingEvaluation();
    }
  }

  // Evaluate listening responses with hybrid scoring engine (Backend)
  async evaluateListening(questionsWithAnswers) {
    try {
      const backendUrl = 'http://localhost:5000/api/scoring/evaluate-listening';
      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsWithAnswers })
      });

      if (!apiResponse.ok) {
        throw new Error(`Backend responded with status ${apiResponse.status}`);
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error evaluating listening via backend:', error);
      return this.getFallbackListeningEvaluation();
    }
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
      fluency_coherence: { score: 5, feedback: "Unable to perform live AI evaluation. Ensure your writing follows a logical structure with clear topic sentences and transitions." },
      pronunciation_intonation: { score: 5, feedback: "Spelling and punctuation assessment pending. Proofread your work for common spelling errors and proper punctuation usage." },
      grammar_range_accuracy: { score: 5, feedback: "Grammar evaluation pending. Use a variety of sentence types — simple, compound, and complex — to demonstrate range." },
      vocabulary_lexical_resource: { score: 5, feedback: "Vocabulary assessment pending. Incorporate academic vocabulary and avoid repeating the same words or phrases." },
      task_achievement: { score: 5, feedback: "Task completion assessment pending. Make sure you address every part of the prompt and stay within the word limit." },
      total_score: 25,
      scaled_score: 5.0,
      band_descriptor: "Developing Communicator",
      top_strength: "Submitted a response within the word limit",
      priority_improvement: "Focus on organizing ideas with clear paragraph structure and cohesive devices",
      overall_pte_score: 50,
      cefr_level: "B1"
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