import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const HighlightCorrectSummary = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'highlight_correct_summary',
      response: selectedOption,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  return (
    <div className="highlight-correct-summary-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the talk"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="question-text">
        <h3>Which option best summarizes the talk?</h3>
      </div>

      <div className="options-container">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`option-item ${selectedOption === option.id ? 'selected' : ''
              }`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <input
              type="radio"
              checked={selectedOption === option.id}
              onChange={() => { }}
              className="option-input"
            />
            <div className="option-text">
              {option.text}
            </div>
          </div>
        ))}
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Select the option that best summarizes the talk.</p>
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

export default HighlightCorrectSummary;