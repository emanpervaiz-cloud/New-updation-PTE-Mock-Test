import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const ListeningMultipleChoice = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleOptionSelect = (optionId) => {
    if (!question.multiple) {
      // For single choice, only allow one selection
      setSelectedOption(optionId);
    } else {
      // For multiple choice, toggle selection
      if (selectedOption?.includes(optionId)) {
        setSelectedOption(selectedOption.filter(id => id !== optionId));
      } else {
        setSelectedOption([...(selectedOption || []), optionId]);
      }
    }
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'multiple_choice',
      response: selectedOption,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  return (
    <div className="listening-multiple-choice-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the question"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="question-text">
        <h3>{question.question}</h3>
      </div>

      <div className="options-container">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`option-item ${(question.multiple && selectedOption?.includes(option.id)) ||
              (!question.multiple && selectedOption === option.id)
              ? 'selected' : ''
              }`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <input
              type={question.multiple ? 'checkbox' : 'radio'}
              checked={
                (question.multiple && selectedOption?.includes(option.id)) ||
                (!question.multiple && selectedOption === option.id)
              }
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
        <p><strong>Instructions:</strong> {question.multiple ? 'Select all that apply.' : 'Select one answer.'}</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedOption === null || (Array.isArray(selectedOption) && selectedOption.length === 0)}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default ListeningMultipleChoice;