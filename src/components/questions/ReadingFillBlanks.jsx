import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';

const ReadingFillBlanks = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [answers, setAnswers] = useState({});
  const [availableOptions, setAvailableOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (question) {
      setAnswers({});
      setAvailableOptions(question.options ? [...question.options] : []);
      setIsSubmitted(false);
    }
  }, [question?.id]);

  const handleOptionSelect = (blankNumber, selectedOption) => {
    const prevSelection = answers[blankNumber];

    // Update the answer for this blank
    setAnswers(prev => ({
      ...prev,
      [blankNumber]: selectedOption
    }));

    // Update available options
    if (selectedOption) {
      // Remove selected option and add back previous selection if any
      setAvailableOptions(opts => {
        let newOpts = opts.filter(opt => opt !== selectedOption);
        if (prevSelection && prevSelection !== selectedOption) {
          newOpts = [...newOpts, prevSelection];
        }
        return newOpts;
      });
    } else if (prevSelection) {
      // If clearing the selection, add back the previous selection
      setAvailableOptions(opts => [...opts, prevSelection]);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      onNext();
      return;
    }
    
    // Save the answers
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'reading',
      type: 'reading_fill_blanks',
      responses: answers
    });
    
    setIsSubmitted(true);
  };

  const renderPassageWithBlanks = () => {
    // Split the passage by blank markers like ___1___, ___2___, etc.
    const parts = question.passage.split(/(___\d+___)/);

    return parts.map((part, index) => {
      const blankMatch = part.match(/___(\d+)___/);

      if (blankMatch) {
        const blankNumber = blankMatch[1];
        const currentAnswer = answers[blankNumber] || '';

        return (
          <select
            key={`blank-${blankNumber}`}
            value={currentAnswer}
            onChange={(e) => handleOptionSelect(blankNumber, e.target.value)}
            className="blank-select"
          >
            <option value="">Select option</option>
            {availableOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {currentAnswer && !availableOptions.includes(currentAnswer) && (
              <option value={currentAnswer}>{currentAnswer}</option>
            )}
          </select>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className="reading-fill-blanks-question">
      <div className="passage-section">
        <div className="passage-text">
          {renderPassageWithBlanks()}
        </div>
      </div>

      <div className="options-bank">
        <h3>Available Options:</h3>
        <div className="options-list">
          {availableOptions.map((option, index) => (
            <span key={index} className="option-chip">
              {option}
            </span>
          ))}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Complete the text with the most appropriate words from the options bank. Each word can only be used once.</p>
      </div>

      {isSubmitted && (
        <div className="answer-feedback" style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ color: '#0369a1', marginBottom: '10px' }}>Correct Answers:</h4>
          {question.answers?.map((answer, idx) => {
            const userAnswer = answers[answer.blank];
            const isCorrect = userAnswer === answer.correct;
            return (
              <div key={idx} style={{ 
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                borderRadius: '4px',
                borderLeft: `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`
              }}>
                <strong>Blank {answer.blank}:</strong>{' '}
                <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{userAnswer || 'No answer'}</span>{' '}
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>→ {answer.correct}</span>
                {isCorrect && <span style={{ color: '#22c55e', marginLeft: '10px' }}>✓</span>}
                {!isCorrect && <span style={{ color: '#ef4444', marginLeft: '10px' }}>✗</span>}
              </div>
            );
          })}
        </div>
      )}

      <div className="action-buttons" style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {isSubmitted ? 'Next Question' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
};

export default ReadingFillBlanks;