// AI Evaluation Service for PTE Mock Test

const SPEAKING_EXAMINER_SYSTEM_PROMPT = `You are a certified English language examiner specializing in high-stakes spoken English assessment (PTE Academic).

Your task is to evaluate a student's response with extreme precision. Be rigorous.

EVALUATION CRITERIA — Score each 0-10:
1. Fluency & Coherence (0–10): Logical flow, no unnatural pauses, good use of discourse markers.
2. Pronunciation & Intonation (0–10): CLEAR articulation, correct word stress, natural rhythm.
3. Grammatical Range & Accuracy (0–10): Variety of structures, zero tolerance for basic errors in high scores.
4. Vocabulary & Lexical Resource (0–10): Precise academic word choice, no repetition.
5. Task Achievement & Relevance (0–10): Fully addresses the prompt.

CRITICAL: If the student just reads the prompt or copies the text without original input, or if the transcription is clearly nonsense/non-English, award an absolute 0 for ALL individual criteria. Reference specific evidence.`;

const WRITING_EXAMINER_SYSTEM_PROMPT = `You are an expert English writing evaluator for PTE Academic. 

CRITICAL - PLAGIARISM DETECTION:
Only award a score of 0 for plagiarism if the STUDENT RESPONSE is a direct verbatim copy (or near-direct copy) of large portions of the passage/prompt.
DO NOT flag as plagiarism if the response is simply short, uses common connectors, or contains some keywords from the prompt in an original context.
In actual plagiarism cases, the "feedback" field MUST start exactly with: "Paragraph copied — score awarded: 0." 

EVALUATION CRITERIA (0-10):
1. FLUENCY & COHERENCE: Logical flow and paragraph structure.
2. SPELLING & PUNCTUATION: Accurate spelling and standard punctuation.
3. GRAMMAR RANGE & ACCURACY: Complex sentence structures and correctness.
4. VOCABULARY & LEXICAL RESOURCE: Academic vocabulary and precision.
5. TASK ACHIEVEMENT: Addressing all parts of the prompt in own words.

CALCULATION:
The "overallScore" MUST be the average of all 5 criteria (score/10). 
If the input is NONSENSE, RANDOM CHARACTERS, or NON-ENGLISH, you MUST award 0 for EVERY single criterion without exception. Do not provide generic positive feedback for non-words.

REQUIRED OUTPUT FORMAT:
{
  "fluencyScore": number,
  "spellingScore": number,
  "grammarScore": number,
  "vocabularyScore": number,
  "taskScore": number,
  "overallScore": number,
  "feedback": "Detailed feedback. If plagiarized, must start with: Paragraph copied — score awarded: 0.",
  "grammarErrors": ["Error -> Correction"],
  "spellingErrors": ["misspelled -> correct"],
  "vocabularySuggestions": ["word -> alternative"]
}`;

class AIEvaluationService {
  constructor(apiKey = null, apiUrl = null, provider = null) {
    // n8n webhook URL for transcription
    this.webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    // Python scoring server URL
    this.pythonServerUrl = import.meta.env.VITE_PYTHON_SERVER_URL || 'http://localhost:5001/webhook/pte-scoring';

    // Load API Keys from Environment Variables or passed arguments (compatibility with components)
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openRouterKey = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
    this.openAiKey = (provider === 'openai' ? apiKey : null) || import.meta.env.VITE_OPENAI_API_KEY;

    // Direct endpoints
    this.openRouterUrl = (provider === 'openrouter' ? apiUrl : null) || 'https://openrouter.ai/api/v1/chat/completions';
    this.openAiUrl = (provider === 'openai' ? apiUrl : null) || 'https://api.openai.com/v1/chat/completions';

    console.warn('--- AI EVALUATION SERVICE DIAGNOSTICS ---');
    console.warn('Priority Provider:', this.openRouterKey ? 'OpenRouter' : (this.geminiApiKey ? 'Gemini' : 'None'));
    console.warn('OpenRouter Key:', !!this.openRouterKey);
    console.warn('Gemini Key:', !!this.geminiApiKey);
    console.warn('--- END DIAGNOSTICS ---');
  }

  /**
   * Helper to call Gemini API with model rotation and error handling
   */
  async callGemini(prompt, systemPrompt) {
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured');

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`Gemini ${model} failed (${response.status}): ${err.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error(`Empty response from Gemini ${model}`);
      } catch (e) {
        console.error(`Attempt with ${model} failed:`, e.message);
        lastError = e;
      }
    }
    throw lastError;
  }

  /**
   * Helper to call generic Chat Completion API (OpenRouter, OpenAI)
   */
  async callChatLLM(systemPrompt, userPrompt, apiKey, apiUrl, model) {
    const response = await fetch(apiUrl, {
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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LLM API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content in LLM response');
    return content;
  }

  /**
   * MAIN ENTRY POINT: Speaking Evaluation
   */
  async evaluateSpeaking(prompt, audioBlobOrText, questionType) {
    let transcript = audioBlobOrText;
    if (audioBlobOrText instanceof Blob) transcript = await this.transcribeAudio(audioBlobOrText);

    console.log('--- Speaking Evaluation Chain ---');

    // 1. OpenRouter (Primary as requested)
    if (this.openRouterKey) {
      try {
        console.log('🚀 Trying OpenRouter (Speaking)...');
        const result = await this.evaluateSpeakingWithLLM(prompt, transcript, questionType, this.openRouterKey, this.openRouterUrl, 'openai/gpt-4o');
        return { ...result, transcript, source: 'openrouter' };
      } catch (e) { console.error('OpenRouter Speaking Failed:', e.message); }
    }

    // 2. Gemini
    if (this.geminiApiKey) {
      try {
        console.log('🚀 Trying Gemini (Speaking)...');
        const userPrompt = `Evaluate this PTE speaking response.\nTRANSCRIPT: "${transcript}"\nQUESTION TYPE: ${questionType}`;
        const resp = await this.callGemini(userPrompt, SPEAKING_EXAMINER_SYSTEM_PROMPT);
        const parsed = this.parseLLMResponse(resp);
        return { ...parsed, transcript, source: 'gemini' };
      } catch (e) { console.error('Gemini Speaking Failed:', e.message); }
    }

    // 3. OpenAI Direct
    if (this.openAiKey) {
      try {
        console.log('🚀 Trying OpenAI (Speaking)...');
        const result = await this.evaluateSpeakingWithLLM(prompt, transcript, questionType, this.openAiKey, this.openAiUrl, 'gpt-4o');
        return { ...result, transcript, source: 'openai' };
      } catch (e) { console.error('OpenAI Speaking Failed:', e.message); }
    }

    // 4. Python Server / Final Fallback
    try {
      const res = await this.evaluateWithPythonServer(prompt, transcript, 'speaking', questionType);
      if (res.success) return { ...res.result, transcript, source: 'python-server' };
    } catch (e) { console.error('Python Server Failed:', e.message); }

    return { ...this.getFallbackSpeakingEvaluation(), transcript, source: 'fallback-final' };
  }

  async evaluateSpeakingWithLLM(prompt, transcript, questionType, apiKey, apiUrl, model) {
    const userPrompt = `TASK: "${prompt}"\nSTUDENT TRANSCRIPT: "${transcript}"\nQUESTION TYPE: ${questionType}`;
    const resp = await this.callChatLLM(SPEAKING_EXAMINER_SYSTEM_PROMPT, userPrompt, apiKey, apiUrl, model);
    return this.parseLLMResponse(resp);
  }

  /**
   * MAIN ENTRY POINT: Writing Evaluation
   */
  async evaluateWriting(prompt, response, questionType) {
    console.log('--- Writing Evaluation Chain ---');

    // 1. OpenRouter (Primary)
    if (this.openRouterKey) {
      try {
        console.log('🚀 Trying OpenRouter (Writing)...');
        const result = await this.evaluateWritingWithLLM(prompt, response, questionType, this.openRouterKey, this.openRouterUrl, 'openai/gpt-4o');
        return { ...result, source: 'openrouter' };
      } catch (e) { console.error('OpenRouter Writing Failed:', e.message); }
    }

    // 2. Gemini
    if (this.geminiApiKey) {
      try {
        console.log('🚀 Trying Gemini (Writing)...');
        const userPrompt = `Evaluate this PTE writing response.\nRESPONSE: "${response}"\nQUESTION TYPE: ${questionType}\n\nPROMPT: ${prompt}`;
        const resp = await this.callGemini(userPrompt, WRITING_EXAMINER_SYSTEM_PROMPT);
        const parsed = this.parseLLMResponse(resp);
        return { ...parsed, source: 'gemini' };
      } catch (e) { console.error('Gemini Writing Failed:', e.message); }
    }

    // 3. OpenAI Direct
    if (this.openAiKey) {
      try {
        console.log('🚀 Trying OpenAI (Writing)...');
        const result = await this.evaluateWritingWithLLM(prompt, response, questionType, this.openAiKey, this.openAiUrl, 'gpt-4o');
        return { ...result, source: 'openai' };
      } catch (e) { console.error('OpenAI Writing Failed:', e.message); }
    }

    // 4. Python Server
    try {
      const res = await this.evaluateWithPythonServer(prompt, response, 'writing', questionType);
      if (res.success) return { ...res.result, source: 'python-server' };
    } catch (e) { console.error('Python Server Failed:', e.message); }

    return { ...this.getFallbackWritingEvaluation(), source: 'fallback-final' };
  }

  async evaluateWritingWithLLM(prompt, response, questionType, apiKey, apiUrl, model) {
    const userPrompt = `TASK: "${prompt}"\nSTUDENT RESPONSE: "${response}"\nQUESTION TYPE: ${questionType}`;
    const resp = await this.callChatLLM(WRITING_EXAMINER_SYSTEM_PROMPT, userPrompt, apiKey, apiUrl, model);
    return this.parseLLMResponse(resp);
  }

  /**
   * Objective Evaluation (Reading/Listening)
   */
  async evaluateReading(questions) { return this.evaluateObjectiveSection('reading', questions); }
  async evaluateListening(questions) { return this.evaluateObjectiveSection('listening', questions); }

  async evaluateObjectiveSection(section, questions) {
    const objective = this.calculateObjectiveOnlyScore(questions);
    try {
      const result = await this.evaluateObjectiveWithAI(section, objective);
      return { ...objective, ...result, source: result.source || 'ai' };
    } catch (e) {
      return { ...objective, feedback: 'Objective scoring complete. AI qualitative feedback unavailable.', source: 'objective-only' };
    }
  }

  async evaluateObjectiveWithAI(section, objective) {
    const systemPrompt = `Analyze these PTE ${section} results. Provide feedback and suggestions in JSON format.`;
    const userPrompt = `Points Earned: ${objective.correct_points}/${objective.total_points}\nAccuracy: ${objective.accuracy_percentage}%\nDetails: ${JSON.stringify(objective.detailed_results)}`;

    // Try OpenRouter -> Gemini
    if (this.openRouterKey) {
      try {
        const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: The student has achieved ${objective.correct_points}/${objective.total_points} total points (${objective.accuracy_percentage}% Accuracy). 
Please provide a JSON response including:
1. "total_score": A score out of 50 based on accuracy.
2. "scaled_score": A score out of 10 based on accuracy.
3. "band_descriptor": A brief descriptor (e.g., Expert, Competent).
4. "feedback": Qualitative feedback on performance.
5. "cefr_level": Estimated CEFR level.`;
        const resp = await this.callChatLLM(enhancedSystemPrompt, userPrompt, this.openRouterKey, this.openRouterUrl, 'openai/gpt-4o');
        const parsed = JSON.parse(resp.match(/\{[\s\S]*\}/)?.[0] || '{}');
        return { ...parsed, source: 'openrouter' };
      } catch (e) { }
    }

    if (this.geminiApiKey) {
      const resp = await this.callGemini(userPrompt, systemPrompt);
      const parsed = JSON.parse(resp.match(/\{[\s\S]*\}/)?.[0] || '{}');
      return { ...parsed, source: 'gemini' };
    }

    throw new Error('No AI provider for objective feedback');
  }

  /**
   * Transcription Logic
   */
  async transcribeAudio(blob) {
    // n8n -> Gemini -> OpenAI Whisper
    if (this.webhookUrl) {
      try {
        return await this.transcribeWithN8n(blob);
      } catch (e) { console.error('n8n Transcription Failed'); }
    }

    if (this.geminiApiKey) {
      try {
        return await this.transcribeWithGemini(blob);
      } catch (e) { console.error('Gemini Transcription Failed'); }
    }

    if (this.openAiKey) {
      try {
        return await this.transcribeWithWhisper(blob, this.openAiKey);
      } catch (e) { console.error('Whisper Transcription Failed'); }
    }

    return "[Transcription unavailable]";
  }

  async transcribeWithN8n(blob) {
    const base64 = await this.blobToBase64(blob);
    const resp = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transcribe_audio', audio: base64, mimeType: blob.type })
    });
    const data = await resp.json();
    return data.transcript || data.text || data.result || '[No transcript]';
  }

  async transcribeWithGemini(blob) {
    const base64 = await this.blobToBase64(blob);
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Transcribe this audio accurately. Return only text.' },
            { inline_data: { mime_type: blob.type || 'audio/webm', data: base64 } }
          ]
        }]
      })
    });
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '[No speech]';
  }

  async transcribeWithWhisper(blob, key) {
    const fd = new FormData();
    fd.append('file', blob, 'audio.webm');
    fd.append('model', 'whisper-1');
    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}` },
      body: fd
    });
    const data = await resp.json();
    return data.text || '[No speech]';
  }

  /**
   * Generic Parsers and Helpers
   */
  parseLLMResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Force consistency: If overall is 0, all components must be 0
        if (parsed.overallScore === 0) {
          return {
            ...parsed,
            fluencyScore: 0,
            grammarScore: 0,
            spellingScore: 0,
            vocabularyScore: 0,
            taskScore: 0,
            pronunciationScore: 0
          };
        }
        return parsed;
      }
    } catch (e) { console.warn('Regex JSON parse failed, using rough parser'); }

    // Rough parser for non-JSON or partial JSON - Default to 0 instead of 5
    const scores = { fluencyScore: 0, grammarScore: 0, spellingScore: 0, vocabularyScore: 0, taskScore: 0, overallScore: 0, feedback: content };
    const matches = content.match(/(\w+)Score":\s*(\d+)/g);
    if (matches) {
      matches.forEach(m => {
        const [k, v] = m.split('":').map(s => s.trim().replace(/"/g, ''));
        scores[k] = parseInt(v);
      });
    }
    return scores;
  }

  async evaluateWithPythonServer(prompt, response, action, questionType) {
    try {
      const resp = await fetch(this.pythonServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `evaluate_${action}`, prompt, response, questionType })
      });
      return await resp.json();
    } catch (e) { return { success: false, error: e.message }; }
  }

  calculateObjectiveOnlyScore(questions) {
    let totalPoints = 0;
    let earnedPoints = 0;

    const items = questions.map(q => {
      const points = this.calculateQuestionPoints(q);
      earnedPoints += points.earned;
      totalPoints += points.total;
      return {
        type: q.type,
        earned: points.earned,
        total: points.total,
        is_fully_correct: points.earned === points.total
      };
    });

    return {
      correct_points: earnedPoints,
      total_points: totalPoints,
      accuracy_percentage: totalPoints ? (earnedPoints / totalPoints * 100).toFixed(1) : 0,
      detailed_results: items
    };
  }

  calculateQuestionPoints(q) {
    const student = q.response || q.responses;
    const correct = q.correct_answer || q.correct;

    if (!student || !correct) return { earned: 0, total: 1 };

    // 1. Multi-blank types (Reading FIB, Listening FIB, etc.)
    if ((q.type?.includes('fill_blanks')) && typeof correct === 'object' && !Array.isArray(correct)) {
      const blanks = Object.keys(correct);
      let earned = 0;
      blanks.forEach(b => {
        if (this.compareAnswers(correct[b], student[b])) earned++;
      });
      return { earned, total: blanks.length };
    }

    // 2. Multiple Choice (Multiple Answers)
    if (q.type === 'multiple_choice' && Array.isArray(correct)) {
      const studentArr = Array.isArray(student) ? student : [student];
      let earned = 0;
      // Correct selections: +1
      studentArr.forEach(ans => {
        if (correct.includes(ans)) earned++;
        else earned--; // Incorrect selection: -1
      });
      // Correct choices NOT selected: Penalty? No, just +1 for each correct one found.
      // Standard PTE: +1 for correct, -1 for incorrect, min 0.
      return { earned: Math.max(0, earned), total: correct.length };
    }

    // 3. Highlight Incorrect Words
    if (q.type === 'highlight_incorrect_words' && Array.isArray(correct)) {
      const studentArr = Array.isArray(student) ? student : [];
      let earned = 0;
      studentArr.forEach(ans => {
        if (correct.includes(ans)) earned++;
        else earned--;
      });
      return { earned: Math.max(0, earned), total: correct.length };
    }

    // 4. Write From Dictation
    if (q.type === 'write_from_dictation' && typeof correct === 'string') {
      const correctWords = correct.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
      const studentWords = (typeof student === 'string' ? student : "").toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
      let earned = 0;
      correctWords.forEach(w => {
        if (studentWords.includes(w)) earned++;
      });
      return { earned, total: correctWords.length };
    }

    // 5. Reorder Paragraph (Adjacent Pairs)
    if (q.type === 'reorder_paragraph' && Array.isArray(correct) && Array.isArray(student)) {
      let earned = 0;
      for (let i = 0; i < student.length - 1; i++) {
        const studentPair = `${student[i]}-${student[i + 1]}`;
        // Check if this pair exists in correct order
        for (let j = 0; j < correct.length - 1; j++) {
          const correctPair = `${correct[j]}-${correct[j + 1]}`;
          if (studentPair === correctPair) {
            earned++;
            break;
          }
        }
      }
      return { earned, total: correct.length - 1 };
    }

    // Default: Strict comparison (1 point)
    const isCorrect = this.compareAnswers(correct, student);
    return { earned: isCorrect ? 1 : 0, total: 1 };
  }

  compareAnswers(correct, student) {
    if (correct === undefined || correct === null) return false;
    if (student === undefined || student === null) return false;

    // String Comparison
    if (typeof correct === 'string' && typeof student === 'string') {
      return correct.trim().toLowerCase() === student.trim().toLowerCase();
    }

    // Array Comparison (Order independent)
    if (Array.isArray(correct) && Array.isArray(student)) {
      if (correct.length !== student.length) return false;
      const cSorted = [...correct].sort();
      const sSorted = [...student].sort();
      return JSON.stringify(cSorted) === JSON.stringify(sSorted);
    }

    // Object Comparison (e.g., FIB blanks)
    if (typeof correct === 'object' && typeof student === 'object') {
      const cKeys = Object.keys(correct);
      const sKeys = Object.keys(student);
      if (cKeys.length !== sKeys.length) return false;
      return cKeys.every(k => this.compareAnswers(correct[k], student[k]));
    }

    return correct === student;
  }

  blobToBase64(blob) {
    return new Promise((r, j) => {
      const fr = new FileReader();
      fr.onloadend = () => r(fr.result.split(',')[1]);
      fr.onerror = j;
      fr.readAsDataURL(blob);
    });
  }

  getFallbackSpeakingEvaluation() {
    return { overallScore: 40, feedback: "Evaluation completed with fallback scoring. Please check your transcript for manual review." };
  }

  getFallbackWritingEvaluation() {
    return { grammarScore: 0, spellingScore: 0, vocabularyScore: 0, taskScore: 0, overallScore: 0, feedback: "AI evaluation unavailable. Response could not be safely scored." };
  }
}

export default AIEvaluationService;