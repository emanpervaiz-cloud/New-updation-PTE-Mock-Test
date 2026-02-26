import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const SelectMissingWord = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
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
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default SelectMissingWord;