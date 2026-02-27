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

    // Show answer first, then user clicks Next to proceed
    setIsSubmitted(true);
  };

  const renderTranscriptWithBlank = () => {
    // Use context if available, otherwise use transcript
    const text = question.context || question.transcript || '';
    
    // Replace ... or ___ with a blank marker
    const blankPattern = /(\.\.\.|___+|\[blank\])/i;
    const parts = text.split(blankPattern);

    return parts.map((part, index) => {
      if (part && (part === '...' || part === '___' || part.match(/^___+$/))) {
        return (
          <select
            key={`blank-${index}`}
            value={selectedOption || ''}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="blank-select"
            disabled={isSubmitted}
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #673ab7',
              backgroundColor: '#fff',
              color: selectedOption ? '#1e293b' : '#64748b',
              cursor: isSubmitted ? 'not-allowed' : 'pointer',
              margin: '0 4px'
            }}
          >
            <option value="">Select...</option>
            {question.options && question.options.map(option => (
              <option key={option.id || option} value={option.id || option}>
                {option.id ? `${option.id}) ${option.text}` : option}
              </option>
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

      <div className="question-section" style={{ 
        padding: '24px', 
        background: '#f8f9fe', 
        borderRadius: '16px', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Select the missing word:</h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Listen to the audio carefully and select the word that completes the final sentence.
        </p>
      </div>

      <div className="options-section" style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Options:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {question.options && question.options.map((option, idx) => {
            const optionId = option.id || option.charAt(0);
            const optionText = option.text || option.substring(3);
            const isSelected = selectedOption === optionId;
            
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(optionId)}
                disabled={isSubmitted}
                style={{
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: isSelected ? '#673ab7' : '#e2e8f0',
                  backgroundColor: isSelected ? '#f3f0ff' : '#ffffff',
                  color: isSelected ? '#673ab7' : '#1e293b',
                  fontSize: '16px',
                  textAlign: 'left',
                  cursor: isSubmitted ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#673ab7' : '#e2e8f0',
                  color: isSelected ? '#fff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {optionId}
                </span>
                <span>{optionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Select the most appropriate word to complete the passage.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons" style={{ marginTop: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isSubmitted && selectedOption === null}
          style={{
            padding: '12px 32px',
            background: (!isSubmitted && selectedOption === null) ? '#9ca3af' : 'linear-gradient(135deg, #673ab7, #5e35b1)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: (!isSubmitted && selectedOption === null) ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isSubmitted ? 'Next Question →' : 'Submit Answer'}
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