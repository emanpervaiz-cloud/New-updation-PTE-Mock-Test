import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const SelectMissingWord = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionSelect = (option) => {
    if (isSubmitted) return;
    setSelectedOption(option);
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
      type: 'select_missing_word',
      response: selectedOption,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  const renderTranscriptWithBlank = () => {
    // Split the transcript by blank markers like ___1___
    const parts = question.transcript.split(/(___1___)/);

    return parts.map((part, index) => {
      if (part === '___1___') {
        return (
          <select
            key={`blank-1`}
            value={selectedOption || ''}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="blank-select"
          >
            <option value="">Select option</option>
            {question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className="select-missing-word-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the passage"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="transcript-section">
        <h3>Complete the passage:</h3>
        <div className="transcript-text">
          {renderTranscriptWithBlank()}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Select the most appropriate word to complete the passage.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedOption === null}
        >
          {isSubmitted ? 'Next Question' : 'Submit Answer'}
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
            <span style={{ fontSize: 20 }}>✅</span> Correct Answer
          </h4>
          <p style={{ color: '#15803d', fontWeight: 600, margin: 0, fontSize: 16 }}>
            {`The correct word is: ${question.correct}`}
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

export default SelectMissingWord;