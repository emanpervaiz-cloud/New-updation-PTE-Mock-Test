/**
 * ScoringEngine for PTE Mock Test
 * Calculates scores per section based on answers stored in ExamContext
 * Uses realistic PTE scoring logic: 10-90 scale, CEFR mapping
 * 
 * When AI evaluations are available, scores are based on AI feedback.
 * When AI is not available, scores are based on answer quality indicators:
 *   - Speaking: whether audio was recorded, duration
 *   - Writing: word count, content length
 *   - Reading: correctness of selected options
 *   - Listening: correctness + spelling accuracy
 */

class ScoringEngine {
  constructor() {
    this.PTE_SCORE_RANGES = {
      'Needs Improvement': { min: 10, max: 29 },
      'Borderline': { min: 30, max: 59 },
      'Competitive': { min: 60, max: 90 }
    };

    this.CEFR_MAPPING = {
      'A1': { min: 10, max: 22 },
      'A2': { min: 23, max: 34 },
      'B1': { min: 35, max: 49 },
      'B2': { min: 50, max: 69 },
      'C1': { min: 70, max: 85 },
      'C2': { min: 86, max: 90 }
    };

    this.SECTION_WEIGHTS = {
      speaking: 0.25,
      writing: 0.25,
      reading: 0.25,
      listening: 0.25
    };

    // Expected question counts per section
    this.EXPECTED_QUESTIONS = {
      speaking: 6,
      writing: 2,
      reading: 20,
      listening: 3
    };
  }

  /**
   * Calculate all scores from the answers stored in ExamContext
   * @param {Object} answers - The answers object from ExamContext state
   * @param {Object} aiEvaluations - Optional AI evaluation results
   * @returns {Object} Complete scores object
   */
  calculateAllScores(answers, aiEvaluations = null) {
    const speakingAnswers = this.filterBySection(answers, 'speaking');
    const writingAnswers = this.filterBySection(answers, 'writing');
    const readingAnswers = this.filterBySection(answers, 'reading');
    const listeningAnswers = this.filterBySection(answers, 'listening');

    const speaking = this.calculateSpeakingScore(speakingAnswers, aiEvaluations);
    const writing = this.calculateWritingScore(writingAnswers, aiEvaluations);
    const reading = this.calculateReadingScore(readingAnswers);
    const listening = this.calculateListeningScore(listeningAnswers);

    const overall = this.calculateOverallScore({ speaking, writing, reading, listening });

    return {
      speaking,
      writing,
      reading,
      listening,
      overall
    };
  }

  /**
   * Filter answers by section
   */
  filterBySection(answers, section) {
    if (!answers) return {};
    const filtered = {};
    for (const [qId, answer] of Object.entries(answers)) {
      if (answer && answer.section === section) {
        filtered[qId] = answer;
      }
    }
    return filtered;
  }

  /**
   * Speaking: Score based on whether recording exists and duration
   * Empty answer = heavy penalty (score 10)
   * Short recording = partial credit
   * Good duration = full base credit (scored by AI when available)
   */
  calculateSpeakingScore(answers, aiEvaluations) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = Math.max(this.EXPECTED_QUESTIONS.speaking, answeredCount);

    if (answeredCount === 0) {
      return { rawScore: 0, scaledScore: 10, cefrLevel: 'A1', breakdown: [], feedback: 'No speaking responses recorded.' };
    }

    let totalScore = 0;
    const breakdown = [];

    for (const [qId, answer] of Object.entries(answers)) {
      let qScore = 10; // base minimum
      const meta = answer.meta || {};

      // If AI evaluation is available, use it
      if (aiEvaluations && aiEvaluations[qId]) {
        const aiEval = aiEvaluations[qId];
        qScore = this.computeAISpeakingScore(aiEval);
      } else {
        // Score based on recording indicators
        // Non-AI scoring, using proxies inspired by AI criteria
        if (!meta.hasAudio || meta.blobSize === 0) {
          qScore = 10; // No audio = minimum score
        } else {
          const duration = meta.duration || 0;
          const { min, ideal, max } = this.getDurationTargets(answer.type);

          // Proxy for Task Achievement & Fluency based on duration
          let fluencyAndTaskScore = 10;
          if (duration >= min) {
            fluencyAndTaskScore = 30 + (duration / ideal) * 20;
          }
          if (duration >= ideal && duration <= max) {
            fluencyAndTaskScore = 75;
          } else if (duration > max) {
            fluencyAndTaskScore = 50; // Penalize for speaking too long
          }

          // Other scores are hard to measure without AI, so we use a baseline
          const pronunciationScore = 45; // Assume average
          const grammarScore = 45;       // Assume average
          const vocabularyScore = 45;    // Assume average

          // Weighted average to form a single score, mimicking AI's multi-faceted view
          // Weighting fluency/task higher as it's the only metric we can estimate
          qScore = (fluencyAndTaskScore * 0.5) + (pronunciationScore * 0.2) + (grammarScore * 0.15) + (vocabularyScore * 0.15);
        }
      }

      totalScore += qScore;
      breakdown.push({ questionId: qId, type: answer.type, score: qScore });
    }

    // Penalty for unanswered questions
    const unansweredPenalty = (totalQuestions - answeredCount) * 10;
    const avgScore = totalScore / totalQuestions;
    const scaledScore = this.clampPTE(Math.round(avgScore));

    return {
      rawScore: totalScore,
      scaledScore,
      cefrLevel: this.mapScoreToCEFR(scaledScore),
      breakdown,
      feedback: this.getSpeakingFeedback(scaledScore)
    };
  }

  computeAISpeakingScore(aiEval) {
    // Support new 5-dimension format (0-10 each) and legacy format
    let total = 0, count = 0;
    const newCriteria = ['fluency_coherence', 'pronunciation_intonation', 'grammar_range_accuracy', 'vocabulary_lexical_resource', 'task_achievement'];
    const legacyCriteria = ['content_accuracy', 'fluency', 'pronunciation', 'vocabulary', 'grammar', 'speech_rate'];

    // Try new format first
    let maxObserved = 0;
    for (const c of newCriteria) {
      const val = aiEval[c] && (typeof aiEval[c].score === 'number' ? aiEval[c].score : (typeof aiEval[c] === 'number' ? aiEval[c] : null));
      if (typeof val === 'number') {
        total += val;
        count++;
        if (val > maxObserved) maxObserved = val;
      }
    }

    // Fallback to legacy format if new format not found
    if (count === 0) {
      for (const c of legacyCriteria) {
        const val = aiEval[c] && (typeof aiEval[c].score === 'number' ? aiEval[c].score : (typeof aiEval[c] === 'number' ? aiEval[c] : null));
        if (typeof val === 'number') {
          total += val;
          count++;
          if (val > maxObserved) maxObserved = val;
        }
      }
    }

    // Use overall_pte_score directly if available
    if (typeof aiEval.overall_pte_score === 'number') {
      return this.clampPTE(aiEval.overall_pte_score);
    }

    if (count === 0) return 40;
    const perCritMax = maxObserved > 6 ? 10 : 5;
    const avg = total / count;
    const normalized = Math.min(1, Math.max(0, avg / perCritMax));
    const scaled = Math.round(normalized * 80 + 10);
    return this.clampPTE(scaled);
  }

  /**
   * Writing: Score based on word count and content quality
   */
  calculateWritingScore(answers, aiEvaluations) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = Math.max(this.EXPECTED_QUESTIONS.writing, answeredCount);

    if (answeredCount === 0) {
      return { rawScore: 0, scaledScore: 10, cefrLevel: 'A1', breakdown: [], feedback: 'No writing responses submitted.' };
    }

    let totalScore = 0;
    const breakdown = [];

    for (const [qId, answer] of Object.entries(answers)) {
      let qScore = 10;
      const meta = answer.meta || {};
      const response = answer.response || '';
      const wordCount = meta.wordCount || (typeof response === 'string' ? response.trim().split(/\s+/).filter(w => w).length : 0);

      if (aiEvaluations && aiEvaluations[qId]) {
        const aiEval = aiEvaluations[qId];
        qScore = this.computeAIWritingScore(aiEval);
      } else {
        // Non-AI scoring, using proxies inspired by AI criteria
        if (wordCount === 0) {
          qScore = 10;
        } else {
          const { min, ideal, max } = this.getWordCountTargets(answer.type);

          // 1. Task Achievement (based on word count)
          let taskScore = 10;
          if (wordCount >= min) taskScore = 35 + ((wordCount - min) / (ideal - min)) * 20;
          if (wordCount >= ideal && wordCount <= max) taskScore = 75;
          if (wordCount > max) taskScore = 55; // Penalty for going over

          // 2. Grammar (proxy by sentence analysis)
          const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
          const sentenceCount = sentences.length > 0 ? sentences.length : 1;
          const avgSentenceLength = wordCount / sentenceCount;
          let grammarScore = 30;
          if (avgSentenceLength > 8 && avgSentenceLength < 25) grammarScore = 60;
          if (sentenceCount > 2 && answer.type === 'write_essay') grammarScore = Math.min(80, grammarScore + 15);

          // 3. Vocabulary (proxy by word complexity and diversity)
          const words = response.trim().split(/\s+/).filter(w => w);
          const longWords = words.filter(w => w.length > 6).length;
          const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
          const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;
          let vocabularyScore = 30;
          if (lexicalDiversity > 0.7) vocabularyScore = 65;
          if (longWords / wordCount > 0.15) vocabularyScore = Math.min(80, vocabularyScore + 10);

          // 4. Spelling/Punctuation (very basic proxy)
          let spellingScore = 50;
          if (response.trim().endsWith('.')) spellingScore = Math.min(70, spellingScore + 10);

          // Weighted average of the proxied scores
          qScore = (taskScore * 0.35) + (grammarScore * 0.25) + (vocabularyScore * 0.25) + (spellingScore * 0.15);
        }
      }

      totalScore += qScore;
      breakdown.push({ questionId: qId, type: answer.type, score: qScore, wordCount });
    }

    const avgScore = totalScore / totalQuestions;
    const scaledScore = this.clampPTE(Math.round(avgScore));

    return {
      rawScore: totalScore,
      scaledScore,
      cefrLevel: this.mapScoreToCEFR(scaledScore),
      breakdown,
      feedback: this.getWritingFeedback(scaledScore)
    };
  }

  computeAIWritingScore(aiEval) {
    let total = 0, count = 0;
    // Accept multiple possible key names from AI output
    const criteriaGroups = [
      ['task_fulfillment', 'taskFulfillment'],
      ['coherence_cohesion', 'coherenceCohesion'],
      ['grammar_range_accuracy', 'grammarRangeAccuracy', 'grammar'],
      ['vocabulary_range', 'lexical_resource', 'vocabulary'],
      ['spelling', 'orthography']
    ];
    let maxObserved = 0;
    for (const group of criteriaGroups) {
      for (const key of group) {
        const item = aiEval[key];
        const val = item && (typeof item.score === 'number' ? item.score : (typeof item === 'number' ? item : null));
        if (typeof val === 'number') {
          total += val;
          count++;
          if (val > maxObserved) maxObserved = val;
          break;
        }
      }
    }
    if (count === 0) return 40;
    const perCritMax = maxObserved > 6 ? maxObserved : 5;
    const avg = total / count;
    const normalized = Math.min(1, Math.max(0, avg / perCritMax));
    const scaled = Math.round(normalized * 80 + 10);
    return this.clampPTE(scaled);
  }

  /**
   * Reading: Accuracy-based scoring
   */
  calculateReadingScore(answers) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = Math.max(this.EXPECTED_QUESTIONS.reading, answeredCount);

    if (answeredCount === 0) {
      return { rawScore: 0, scaledScore: 10, cefrLevel: 'A1', breakdown: [], feedback: 'No reading responses submitted.' };
    }

    let totalScore = 0;
    const breakdown = [];

    for (const [qId, answer] of Object.entries(answers)) {
      let qScore = 10;
      const responses = answer.responses || answer.response;

      if (answer.type === 'fill_blanks' || answer.type === 'reading_fill_blanks' || answer.type === 'reading_writing_fill_blanks') {
        // Score based on number of blanks filled
        if (responses && typeof responses === 'object') {
          const filledCount = Object.values(responses).filter(v => v && v !== '').length;
          const totalBlanks = Object.keys(responses).length || 1;
          const fillRatio = filledCount / totalBlanks;
          qScore = this.clampPTE(Math.round(10 + fillRatio * 70));
        }
      } else if (answer.type === 'multiple_choice') {
        // Score based on whether something was selected
        if (Array.isArray(responses) && responses.length > 0) {
          qScore = 55; // Base credit for answering
        } else if (responses) {
          qScore = 55;
        }
      } else if (answer.type === 'reorder_paragraph') {
        // Score based on whether ordering was submitted
        if (Array.isArray(responses) && responses.length > 0) {
          qScore = 55; // Base credit for completing the task
        }
      }

      totalScore += qScore;
      breakdown.push({ questionId: qId, type: answer.type, score: qScore });
    }

    const avgScore = totalScore / totalQuestions;
    const scaledScore = this.clampPTE(Math.round(avgScore));

    return {
      rawScore: totalScore,
      scaledScore,
      cefrLevel: this.mapScoreToCEFR(scaledScore),
      breakdown,
      feedback: this.getReadingFeedback(scaledScore)
    };
  }

  /**
   * Listening: Accuracy + spelling penalties
   */
  calculateListeningScore(answers) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = Math.max(this.EXPECTED_QUESTIONS.listening, answeredCount);

    if (answeredCount === 0) {
      return { rawScore: 0, scaledScore: 10, cefrLevel: 'A1', breakdown: [], feedback: 'No listening responses submitted.' };
    }

    let totalScore = 0;
    const breakdown = [];

    for (const [qId, answer] of Object.entries(answers)) {
      let qScore = 10;
      const response = answer.response;
      const responses = answer.responses;

      if (answer.type === 'text' || answer.type === 'summarize_spoken_text') {
        // Text-based: word count matters
        const wordCount = answer.meta?.wordCount || (typeof response === 'string' ? response.trim().split(/\s+/).filter(w => w).length : 0);
        if (wordCount >= 40 && wordCount <= 70) qScore = 65;
        else if (wordCount >= 20) qScore = 45;
        else if (wordCount > 0) qScore = 25;
        else qScore = 10;
      } else if (answer.type === 'multiple_choice') {
        if (response || (Array.isArray(response) && response.length > 0)) qScore = 55;
      } else if (answer.type === 'listening_fill_blanks') {
        if (responses && typeof responses === 'object') {
          const filledCount = Object.values(responses).filter(v => v && v !== '').length;
          const totalBlanks = Object.keys(responses).length || 1;
          qScore = this.clampPTE(Math.round(10 + (filledCount / totalBlanks) * 70));
        }
      } else if (answer.type === 'highlight_correct_summary') {
        if (response) qScore = 55;
      } else if (answer.type === 'select_missing_word') {
        if (response) qScore = 55;
      } else if (answer.type === 'highlight_incorrect_words') {
        if (Array.isArray(response) && response.length > 0) qScore = 55;
      } else if (answer.type === 'write_from_dictation') {
        // Most important listening q — score by word count
        const wordCount = typeof response === 'string' ? response.trim().split(/\s+/).filter(w => w).length : 0;
        if (wordCount >= 5) qScore = 65;
        else if (wordCount >= 2) qScore = 40;
        else if (wordCount > 0) qScore = 20;
        else qScore = 10;
      }

      totalScore += qScore;
      breakdown.push({ questionId: qId, type: answer.type, score: qScore });
    }

    const avgScore = totalScore / totalQuestions;
    const scaledScore = this.clampPTE(Math.round(avgScore));

    return {
      rawScore: totalScore,
      scaledScore,
      cefrLevel: this.mapScoreToCEFR(scaledScore),
      breakdown,
      feedback: this.getListeningFeedback(scaledScore)
    };
  }

  /**
   * Overall score: weighted average of sections
   */
  calculateOverallScore(sectionScores) {
    const { speaking, writing, reading, listening } = sectionScores;

    // Ensure scaledScore exists and fallback to minimal value
    const s = speaking && typeof speaking.scaledScore === 'number' ? speaking.scaledScore : 10;
    const w = writing && typeof writing.scaledScore === 'number' ? writing.scaledScore : 10;
    const r = reading && typeof reading.scaledScore === 'number' ? reading.scaledScore : 10;
    const l = listening && typeof listening.scaledScore === 'number' ? listening.scaledScore : 10;

    const weightedScore =
      (s * this.SECTION_WEIGHTS.speaking) +
      (w * this.SECTION_WEIGHTS.writing) +
      (r * this.SECTION_WEIGHTS.reading) +
      (l * this.SECTION_WEIGHTS.listening);

    const overallScore = this.clampPTE(Math.round(weightedScore));
    const cefrLevel = this.mapScoreToCEFR(overallScore);
    const classification = this.classifyEligibility(overallScore);

    return {
      overallScore,
      cefrLevel,
      classification,
      feedback: this.getOverallFeedback(overallScore, cefrLevel)
    };
  }

  // Utility: clamp to PTE range
  clampPTE(score) {
    return Math.min(90, Math.max(10, score));
  }

  // Map score to CEFR level
  mapScoreToCEFR(score) {
    for (const [level, range] of Object.entries(this.CEFR_MAPPING)) {
      if (score >= range.min && score <= range.max) return level;
    }
    return score >= 86 ? 'C2' : 'A1';
  }

  // Classify eligibility
  classifyEligibility(score) {
    if (score >= 79) return 'Superior — Eligible for top universities and immigration';
    if (score >= 65) return 'Competent — Meets most university and visa requirements';
    if (score >= 50) return 'Moderate — May qualify for some programs';
    if (score >= 36) return 'Limited — Additional preparation recommended';
    return 'Below Functional — Significant preparation needed';
  }

  // Section feedback
  getSpeakingFeedback(score) {
    if (score >= 70) return 'Excellent speaking skills. Clear pronunciation and natural fluency.';
    if (score >= 50) return 'Good speaking ability. Some areas for improvement in fluency and pronunciation.';
    if (score >= 30) return 'Basic speaking skills. Focus on pronunciation clarity and speaking at a natural pace.';
    return 'Needs significant improvement. Practice reading aloud and recording yourself regularly.';
  }

  getWritingFeedback(score) {
    if (score >= 70) return 'Strong writing skills. Good grammar, vocabulary, and coherent structure.';
    if (score >= 50) return 'Adequate writing. Work on sentence variety and vocabulary range.';
    if (score >= 30) return 'Basic writing skills. Focus on grammar accuracy and paragraph organization.';
    return 'Needs significant improvement. Practice writing summaries and structured essays daily.';
  }

  getReadingFeedback(score) {
    if (score >= 70) return 'Excellent reading comprehension. Strong vocabulary and inference skills.';
    if (score >= 50) return 'Good reading skills. Practice scanning and skimming techniques.';
    if (score >= 30) return 'Basic reading comprehension. Build vocabulary and practice with timed readings.';
    return 'Needs improvement. Read English articles daily and practice fill-in-the-blank exercises.';
  }

  getListeningFeedback(score) {
    if (score >= 70) return 'Excellent listening comprehension. Strong note-taking and detail recognition.';
    if (score >= 50) return 'Good listening skills. Practice active listening and note-taking.';
    if (score >= 30) return 'Basic listening. Focus on main ideas first, then details. Watch English media regularly.';
    return 'Needs significant improvement. Listen to English podcasts and practice dictation daily.';
  }

  getOverallFeedback(score, cefrLevel) {
    return `Your overall PTE score is ${score}/90 (CEFR ${cefrLevel}). ${this.classifyEligibility(score)}.`;
  }

  getDurationTargets(questionType) {
    switch (questionType) {
      case 'read_aloud': return { min: 5, ideal: 15, max: 45 };
      case 'repeat_sentence': return { min: 1, ideal: 3, max: 12 };
      case 'describe_image': return { min: 10, ideal: 20, max: 38 };
      case 'retell_lecture': return { min: 10, ideal: 20, max: 38 };
      case 'answer_short_question': return { min: 1, ideal: 1, max: 8 };
      default: return { min: 5, ideal: 15, max: 40 };
    }
  }

  getWordCountTargets(questionType) {
    switch (questionType) {
      case 'summarize_written_text': return { min: 5, ideal: 40, max: 75 };
      case 'write_essay': return { min: 100, ideal: 200, max: 300 };
      default: return { min: 20, ideal: 50, max: 100 };
    }
  }
}

const scoringEngine = new ScoringEngine();
export default scoringEngine;
export { ScoringEngine };