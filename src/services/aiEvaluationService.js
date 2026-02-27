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
  }

  // Evaluate speaking responses with hybrid scoring engine (Backend)
  async evaluateSpeaking(prompt, audioBlobOrText, questionType) {
    let transcript = audioBlobOrText;

    // If it's a recorded audio blob, transcribe it first
    if (audioBlobOrText instanceof Blob) {
      transcript = await this.transcribeAudio(audioBlobOrText);
    }

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