import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const WriteFromDictation = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [sentence, setSentence] = useState('');
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    if (isSubmitted) return;
    setSentence(e.target.value);
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      onNext();
      return;
    }

    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'write_from_dictation',
      response: sentence,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  return (
    <div className="write-from-dictation-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the sentence"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="answer-section">
        <h3>Type the sentence exactly as you hear it:</h3>
        <input
          type="text"
          className="response-input"
          value={sentence}
          onChange={handleChange}
          placeholder="Type the sentence here..."
        />
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Type the sentence exactly as you hear it.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={sentence.trim() === ''}
        >
          {isSubmitted ? 'Next Question' : 'Submit Sentence'}
        </button>
      </div>

      {isSubmitted && (
        <div style={{
          marginTop: 24,
          padding: '20px',
          background: '#f0fdf4',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h4 style={{ color: '#166534', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span> Correct Sentence
          </h4>
          <p style={{ color: '#15803d', fontWeight: 600, margin: 0, fontSize: 16 }}>
            {question.correctResponse || question.transcript}
          </p>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default WriteFromDictation;