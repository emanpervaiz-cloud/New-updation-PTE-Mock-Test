import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';

const MultipleChoice = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionToggle = (optionId) => {
    if (question.multiple) {
      // For multiple choice, allow multiple selections
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      // For single choice, only allow one selection
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = () => {
    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'reading',
      type: 'multiple_choice',
      responses: selectedOptions
    });

    // Move to next question
    onNext();
  };

  return (
    <div className="multiple-choice-question">
      <div className="question-text">
        <h3>{question.question}</h3>
      </div>

      <div className="options-container">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`option-item ${selectedOptions.includes(option.id) ? 'selected' : ''
              }`}
            onClick={() => handleOptionToggle(option.id)}
          >
            <input
              type={question.multiple ? 'checkbox' : 'radio'}
              checked={selectedOptions.includes(option.id)}
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
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default MultipleChoice;