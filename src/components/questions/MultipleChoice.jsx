import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';

const MultipleChoice = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (question) {
      setSelectedOptions([]);
      setIsSubmitted(false);
    }
  }, [question?.id]);

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
    if (isSubmitted) {
      onNext();
      return;
    }
    
    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'reading',
      type: 'multiple_choice',
      responses: selectedOptions
    });
    
    setIsSubmitted(true);
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

      {isSubmitted && (
        <div className="answer-feedback" style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ color: '#0369a1', marginBottom: '10px' }}>
            {question.multiple ? 'Correct Answers:' : 'Correct Answer:'}
          </h4>
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const isCorrect = Array.isArray(question.correct) 
              ? question.correct.includes(option.id)
              : question.correct === option.id;
            
            if (!isCorrect && !isSelected) return null;
            
            return (
              <div key={option.id} style={{ 
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                borderRadius: '4px',
                borderLeft: `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`
              }}>
                <strong>{option.id}.</strong>{' '}
                <span style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                  {option.text}
                </span>
                {isCorrect && isSelected && <span style={{ color: '#22c55e', marginLeft: '10px' }}>✓ Your answer</span>}
                {isCorrect && !isSelected && <span style={{ color: '#22c55e', marginLeft: '10px' }}>✓ Correct</span>}
                {!isCorrect && isSelected && <span style={{ color: '#ef4444', marginLeft: '10px' }}>✗ Your answer (Incorrect)</span>}
              </div>
            );
          })}
        </div>
      )}

      <div className="action-buttons" style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isSubmitted && selectedOptions.length === 0}
        >
          {isSubmitted ? 'Next Question' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};

export default MultipleChoice;