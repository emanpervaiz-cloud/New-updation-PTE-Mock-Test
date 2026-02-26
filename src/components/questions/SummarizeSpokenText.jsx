import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';
import ScoreDisplay from '../common/ScoreDisplay';
import AIEvaluationService from '../../services/aiEvaluationService';

const SummarizeSpokenText = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [summary, setSummary] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // AI Evaluation State
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);

  // Calculate word count whenever summary changes
  useEffect(() => {
    const words = summary.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [summary]);

  const handleChange = (e) => {
    setSummary(e.target.value);
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSave = () => {
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'summarize_spoken_text',
      response: summary,
      meta: { wordCount: wordCount, audioPlayed: audioPlayed }
    });
    setIsSaved(true);
  };

  const handleGetScore = async () => {
    if (!isSaved) handleSave();

    setEvalLoading(true);
    setEvalError(null);
    try {
      const evaluator = new AIEvaluationService();
      // Use evaluateWriting for Summarize Spoken Text since the student's output is written text
      // We pass the transcript or instruction as the 'prompt' context for the LLM
      const result = await evaluator.evaluateWriting(
        `Audio Transcript Topic: ${question.transcript || question.title || question.instruction}`,
        summary,
        'summarize_spoken_text'
      );
      setEvaluation(result);
    } catch (err) {
      setEvalError(err.message || 'Failed to evaluate. Please try again.');
    }
    setEvalLoading(false);
  };

  const handleSubmit = () => {
    if (!isSaved) handleSave();
    onNext();
  };

  return (
    <div className="summarize-spoken-text-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the lecture"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="answer-section">
        <h3>Write your summary:</h3>
        <textarea
          className="response-textarea"
          value={summary}
          onChange={handleChange}
          placeholder={`Write your summary (${question.minWords}-${question.maxWords} words)...`}
          rows={6}
        />
        <div className="word-count">
          {wordCount}/{question.maxWords} words
          {wordCount < question.minWords && wordCount > 0 &&
            <span className="warning"> Minimum {question.minWords} words required</span>}
          {wordCount > question.maxWords &&
            <span className="error"> Maximum {question.maxWords} words exceeded</span>}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Write a summary of the lecture in {question.minWords}-{question.maxWords} words.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      {/* Score Display (AI Webhook payload) */}
      <ScoreDisplay
        evaluation={evaluation}
        loading={evalLoading}
        error={evalError}
        onGetScore={handleGetScore}
        hasResponse={wordCount >= 10 && audioPlayed}
        questionType="writing"
      />

      <div className="action-buttons" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button
          style={{ padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}
          onClick={handleSubmit}
          disabled={wordCount > question.maxWords || wordCount === 0}
        >
          Submit Summary →
        </button>
      </div>
    </div>
  );
};

export default SummarizeSpokenText;