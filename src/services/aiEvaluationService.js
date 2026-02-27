// AI Evaluation Service for PTE Mock Test
// Professional English Language Examiner — 30+ years experience
// Uses OpenRouter API with GPT-4o for evaluation

const EXAMINER_SYSTEM_PROMPT = `You are a certified English language examiner with 30+ years of experience in high-stakes spoken English assessment, including PTE Academic, IELTS Speaking, and TOEFL iBT evaluations.

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

const WRITING_EXAMINER_SYSTEM_PROMPT = `You are a certified English language examiner with 30+ years of experience in high-stakes written English assessment, including PTE Academic Writing, IELTS Writing Task, and TOEFL iBT Writing evaluations.

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
    // Default to the provided n8n webhook URL if env variable is missing
    this.webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://n8n.srv826531.hstgr.cloud/webhook-test/b225b16c-c602-450e-b858-f9bbe4ba5dd6';
    // Use environment variable for backend URL, fallback to localhost for development
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }

  // Direct AI evaluation using OpenRouter/OpenAI (no backend required)
  async evaluateSpeakingDirect(prompt, transcript, questionType) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('No API key found, using fallback evaluation');
      return null;
    }

    const isOpenRouter = !!import.meta.env.VITE_OPENROUTER_API_KEY;
    const apiUrl = isOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    const systemPrompt = `You are a certified PTE Academic examiner. Evaluate the following ${questionType} response.

PROMPT/TASK: "${prompt}"
STUDENT TRANSCRIPT: "${transcript}"

Evaluate the response using these dimensions (0-10 each):
1. Fluency & Coherence - flow, pacing, logical organization
2. Pronunciation & Intonation - clarity, stress, rhythm  
3. Grammatical Range & Accuracy - sentence variety, correctness
4. Vocabulary & Lexical Resource - word choice, range, precision
5. Task Achievement - how well the response addresses the prompt

Return ONLY a JSON object in this exact format:
{
  "fluency_coherence": { "score": 0-10, "feedback": "specific feedback" },
  "pronunciation_intonation": { "score": 0-10, "feedback": "specific feedback" },
  "grammar_range_accuracy": { "score": 0-10, "feedback": "specific feedback" },
  "vocabulary_lexical_resource": { "score": 0-10, "feedback": "specific feedback" },
  "task_achievement": { "score": 0-10, "feedback": "specific feedback" },
  "overall_pte_score": 10-90,
  "cefr_level": "A1-C2",
  "top_strength": "one sentence",
  "priority_improvement": "one sentence"
}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(isOpenRouter && { 'HTTP-Referer': window.location.origin })
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'system', content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          ...result,
          total_score: result.fluency_coherence.score + result.pronunciation_intonation.score + 
                      result.grammar_range_accuracy.score + result.vocabulary_lexical_resource.score + 
                      result.task_achievement.score,
          scaled_score: ((result.fluency_coherence.score + result.pronunciation_intonation.score + 
                         result.grammar_range_accuracy.score + result.vocabulary_lexical_resource.score + 
                         result.task_achievement.score) / 50 * 10).toFixed(1),
          band_descriptor: result.overall_pte_score >= 79 ? "Expert Communicator" : 
                          result.overall_pte_score >= 65 ? "Strong Communicator" : 
                          result.overall_pte_score >= 50 ? "Competent Communicator" : "Developing Communicator"
        };
      }
      
      return null;
    } catch (error) {
      console.error('Direct AI evaluation error:', error);
      return null;
    }
  }

  // Evaluate speaking responses with hybrid scoring engine (Backend)
  async evaluateSpeaking(prompt, audioBlobOrText, questionType) {
    let transcript = audioBlobOrText;

    // If it's a recorded audio blob, transcribe it first
    if (audioBlobOrText instanceof Blob) {
      transcript = await this.transcribeAudio(audioBlobOrText);
    }

    // First try direct AI evaluation (no backend needed)
    const directEval = await this.evaluateSpeakingDirect(prompt, transcript, questionType);
    if (directEval) {
      return {
        ...directEval,
        transcript: transcript,
        evaluation_method: 'ai_direct'
      };
    }

    // Fallback to backend if available
    try {
      const backendUrl = `${this.backendUrl}/api/scoring/evaluate-speaking`;
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
        ...this.getFallbackSpeakingEvaluation(transcript, prompt),
        transcript: transcript
      };
    }
  }

  // Transcribe audio using OpenAI Whisper API
  async transcribeAudio(audioBlob) {
    try {
      // Require OpenAI API Key for Whisper
      const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!openAiKey) {
        console.warn('VITE_OPENAI_API_KEY is not set. Cannot use Whisper API.');
        return "[Audio response recorded]";
      }

      const formData = new FormData();
      const extension = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
      formData.append('file', audioBlob, `audio.${extension}`);
      formData.append('model', 'whisper-1');
      formData.append('prompt', 'I have a voice note of a girl speaking. I want you to generate an accurate transcript of her voice only. Do not include any other existing transcript or text — only transcribe what she says in the voice note. Make sure the transcript is clear, correctly punctuated, and reflects her exact words.');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        console.error('Whisper API Error:', data.error);
        return `[Transcription failed: ${data.error.message}]`;
      }

      return data.text || "[No speech detected]";
    } catch (error) {
      console.error('Transcription error:', error);
      return "[Transcription error occurred]";
    }
  }

  // Direct AI evaluation for writing (no backend required)
  async evaluateWritingDirect(prompt, response, questionType) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('No API key found, using fallback evaluation');
      return null;
    }

    const isOpenRouter = !!import.meta.env.VITE_OPENROUTER_API_KEY;
    const apiUrl = isOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    const systemPrompt = `You are a certified PTE Academic writing examiner. Evaluate the following ${questionType} response.

TASK/PROMPT: "${prompt}"
STUDENT RESPONSE: "${response}"

Evaluate the response using these dimensions (0-10 each):
1. Fluency & Coherence - logical structure, paragraph organization, cohesive devices
2. Spelling & Punctuation - accuracy of writing conventions
3. Grammatical Range & Accuracy - sentence variety and correctness
4. Vocabulary & Lexical Resource - range and precision of academic language
5. Task Achievement - addressing the prompt, meeting word counts

Return ONLY a JSON object in this exact format:
{
  "fluency_coherence": { "score": 0-10, "feedback": "specific feedback" },
  "pronunciation_intonation": { "score": 0-10, "feedback": "spelling and punctuation feedback" },
  "grammar_range_accuracy": { "score": 0-10, "feedback": "specific feedback" },
  "vocabulary_lexical_resource": { "score": 0-10, "feedback": "specific feedback" },
  "task_achievement": { "score": 0-10, "feedback": "specific feedback" },
  "overall_pte_score": 10-90,
  "cefr_level": "A1-C2",
  "top_strength": "one sentence",
  "priority_improvement": "one sentence"
}`;

    try {
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(isOpenRouter && { 'HTTP-Referer': window.location.origin })
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'system', content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          ...result,
          total_score: result.fluency_coherence.score + result.pronunciation_intonation.score + 
                      result.grammar_range_accuracy.score + result.vocabulary_lexical_resource.score + 
                      result.task_achievement.score,
          scaled_score: ((result.fluency_coherence.score + result.pronunciation_intonation.score + 
                         result.grammar_range_accuracy.score + result.vocabulary_lexical_resource.score + 
                         result.task_achievement.score) / 50 * 10).toFixed(1),
          band_descriptor: result.overall_pte_score >= 79 ? "Expert Communicator" : 
                          result.overall_pte_score >= 65 ? "Strong Communicator" : 
                          result.overall_pte_score >= 50 ? "Competent Communicator" : "Developing Communicator",
          evaluation_method: 'ai_direct'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Direct AI writing evaluation error:', error);
      return null;
    }
  }

  // Evaluate writing responses with hybrid scoring engine (Backend)
  async evaluateWriting(prompt, response, questionType) {
    // First try direct AI evaluation (no backend needed)
    const directEval = await this.evaluateWritingDirect(prompt, response, questionType);
    if (directEval) {
      return directEval;
    }

    // Fallback to backend if available
    try {
      const backendUrl = `${this.backendUrl}/api/scoring/evaluate-writing`;
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
      return this.getFallbackWritingEvaluation(response, prompt);
    }
  }

  // Evaluate reading responses with hybrid scoring engine (Backend)
  async evaluateReading(questionsWithAnswers) {
    try {
      const backendUrl = `${this.backendUrl}/api/scoring/evaluate-reading`;
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
      const backendUrl = `${this.backendUrl}/api/scoring/evaluate-listening`;
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

  // Generate dynamic fallback evaluation based on response content
  getFallbackSpeakingEvaluation(transcript = '', prompt = '') {
    // Calculate dynamic scores based on response length and content
    const wordCount = transcript ? transcript.split(/\s+/).filter(w => w.length > 0).length : 0;
    const promptWordCount = prompt ? prompt.split(/\s+/).filter(w => w.length > 0).length : 0;
    
    // Base scores that vary based on response characteristics
    let fluencyScore = Math.min(10, Math.max(3, Math.floor(wordCount / 10)));
    let pronunciationScore = Math.min(10, Math.max(3, Math.floor(wordCount / 12)));
    let grammarScore = Math.min(10, Math.max(3, Math.floor(wordCount / 11)));
    let vocabularyScore = Math.min(10, Math.max(3, Math.floor(wordCount / 9)));
    let taskScore = Math.min(10, Math.max(3, Math.floor(wordCount / 8)));
    
    // Add some randomness to make scores different each time (but consistent for same response)
    const hash = transcript.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const variance = (hash % 3) - 1; // -1, 0, or 1
    
    fluencyScore = Math.min(10, Math.max(1, fluencyScore + variance));
    pronunciationScore = Math.min(10, Math.max(1, pronunciationScore - variance));
    grammarScore = Math.min(10, Math.max(1, grammarScore + variance));
    vocabularyScore = Math.min(10, Math.max(1, vocabularyScore - variance));
    taskScore = Math.min(10, Math.max(1, taskScore + variance));
    
    const totalScore = fluencyScore + pronunciationScore + grammarScore + vocabularyScore + taskScore;
    const scaledScore = (totalScore / 50) * 10;
    const pteScore = Math.round((totalScore / 50) * 80 + 10);
    
    // Determine band descriptor based on score
    let bandDescriptor = "Developing Communicator";
    if (scaledScore >= 8) bandDescriptor = "Expert Communicator";
    else if (scaledScore >= 6.5) bandDescriptor = "Strong Communicator";
    else if (scaledScore >= 5) bandDescriptor = "Competent Communicator";
    
    // Determine CEFR level
    let cefrLevel = "B1";
    if (pteScore >= 85) cefrLevel = "C2";
    else if (pteScore >= 76) cefrLevel = "C1";
    else if (pteScore >= 59) cefrLevel = "B2";
    else if (pteScore >= 43) cefrLevel = "B1";
    else if (pteScore >= 30) cefrLevel = "A2";
    
    return {
      fluency_coherence: { 
        score: fluencyScore, 
        feedback: wordCount > 20 
          ? "Your response shows good fluency with natural pacing. Continue practicing to reduce any hesitations."
          : "Your response was brief. Try to speak more fully to demonstrate your fluency."
      },
      pronunciation_intonation: { 
        score: pronunciationScore, 
        feedback: "Focus on clear articulation and natural stress patterns in your speech."
      },
      grammar_range_accuracy: { 
        score: grammarScore, 
        feedback: "Use a mix of simple and complex sentence structures to demonstrate grammatical range."
      },
      vocabulary_lexical_resource: { 
        score: vocabularyScore, 
        feedback: "Try incorporating more topic-specific vocabulary and avoid repeating common words."
      },
      task_achievement: { 
        score: taskScore, 
        feedback: wordCount > 15
          ? "You addressed the task appropriately. Ensure you cover all aspects of the prompt."
          : "Your response was quite short. Make sure to fully address the prompt in future attempts."
      },
      total_score: totalScore,
      scaled_score: Math.round(scaledScore * 10) / 10,
      band_descriptor: bandDescriptor,
      top_strength: wordCount > 20 ? "Good response length and fluency" : "Attempted the task within time limit",
      priority_improvement: wordCount < 15 ? "Focus on speaking more to fully address the prompt" : "Work on vocabulary variety and pronunciation clarity",
      overall_pte_score: Math.min(90, Math.max(10, pteScore)),
      cefr_level: cefrLevel,
      word_count: wordCount,
      note: "This is a simulated evaluation. Connect a backend server for AI-powered scoring."
    };
  }

  getFallbackWritingEvaluation(response = '', prompt = '') {
    // Calculate dynamic scores based on response length and content
    const wordCount = response ? response.split(/\s+/).filter(w => w.length > 0).length : 0;
    const promptWordCount = prompt ? prompt.split(/\s+/).filter(w => w.length > 0).length : 0;
    
    // Base scores that vary based on response characteristics
    let fluencyScore = Math.min(10, Math.max(3, Math.floor(wordCount / 20)));
    let spellingScore = Math.min(10, Math.max(3, 7 + Math.floor(wordCount / 50)));
    let grammarScore = Math.min(10, Math.max(3, Math.floor(wordCount / 18)));
    let vocabularyScore = Math.min(10, Math.max(3, Math.floor(wordCount / 15)));
    let taskScore = Math.min(10, Math.max(3, Math.floor(wordCount / 12)));
    
    // Add some randomness based on content hash
    const hash = response.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const variance = (hash % 3) - 1;
    
    fluencyScore = Math.min(10, Math.max(1, fluencyScore + variance));
    spellingScore = Math.min(10, Math.max(1, spellingScore - variance));
    grammarScore = Math.min(10, Math.max(1, grammarScore + variance));
    vocabularyScore = Math.min(10, Math.max(1, vocabularyScore - variance));
    taskScore = Math.min(10, Math.max(1, taskScore + variance));
    
    const totalScore = fluencyScore + spellingScore + grammarScore + vocabularyScore + taskScore;
    const scaledScore = (totalScore / 50) * 10;
    const pteScore = Math.round((totalScore / 50) * 80 + 10);
    
    // Determine band descriptor
    let bandDescriptor = "Developing Communicator";
    if (scaledScore >= 8) bandDescriptor = "Expert Communicator";
    else if (scaledScore >= 6.5) bandDescriptor = "Strong Communicator";
    else if (scaledScore >= 5) bandDescriptor = "Competent Communicator";
    
    // Determine CEFR level
    let cefrLevel = "B1";
    if (pteScore >= 85) cefrLevel = "C2";
    else if (pteScore >= 76) cefrLevel = "C1";
    else if (pteScore >= 59) cefrLevel = "B2";
    else if (pteScore >= 43) cefrLevel = "B1";
    else if (pteScore >= 30) cefrLevel = "A2";
    
    return {
      fluency_coherence: { 
        score: fluencyScore, 
        feedback: wordCount > 50
          ? "Your writing shows good organization with logical flow of ideas."
          : "Your response was brief. Develop your ideas more fully with supporting details."
      },
      pronunciation_intonation: { 
        score: spellingScore, 
        feedback: "Check your spelling and punctuation for accuracy."
      },
      grammar_range_accuracy: { 
        score: grammarScore, 
        feedback: "Use a variety of sentence structures to demonstrate grammatical range."
      },
      vocabulary_lexical_resource: { 
        score: vocabularyScore, 
        feedback: "Incorporate more academic vocabulary and avoid repetition."
      },
      task_achievement: { 
        score: taskScore, 
        feedback: wordCount > 30
          ? "You addressed the task requirements appropriately."
          : "Your response may be too short. Ensure you meet the word count requirements."
      },
      total_score: totalScore,
      scaled_score: Math.round(scaledScore * 10) / 10,
      band_descriptor: bandDescriptor,
      top_strength: wordCount > 50 ? "Good response length and organization" : "Attempted the writing task",
      priority_improvement: wordCount < 30 ? "Focus on meeting the word count requirement" : "Work on vocabulary variety and grammar accuracy",
      overall_pte_score: Math.min(90, Math.max(10, pteScore)),
      cefr_level: cefrLevel,
      word_count: wordCount,
      note: "This is a simulated evaluation. Connect a backend server for AI-powered scoring."
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