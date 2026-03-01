import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';

const ReadingWritingFillBlanks = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (question) {
      setAnswers({});
      setIsSubmitted(false);
    }
  }, [question?.id]);

  const handleOptionChange = (blankId, value) => {
    setAnswers(prev => ({
      ...prev,
      [blankId]: value
    }));
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
      type: 'reading_writing_fill_blanks',
      responses: answers
    });
    
    setIsSubmitted(true);
  };

  const renderPassageWithBlanks = () => {
    // Split by blank markers like ___1___, ___2___, etc.
    const parts = question.passage.split(/(___\d+___)/);

    return parts.map((part, index) => {
      const blankMatch = part.match(/___(\d+)___/);
      if (blankMatch) {
        const blankNum = parseInt(blankMatch[1]);
        const blankData = question.options?.[blankNum - 1];
        const options = blankData?.options || [];
        const blankId = `blank_${blankNum}`;

        return (
          <select
            key={`blank-${blankNum}`}
            value={answers[blankId] || ''}
            onChange={(e) => handleOptionChange(blankId, e.target.value)}
            className="blank-select"
            disabled={isSubmitted}
          >
            <option value="">Select option</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="reading-writing-fill-blanks-question">
      <div className="passage-section">
        <div className="passage-text">
          {renderPassageWithBlanks()}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> For each blank, select the most appropriate word from the dropdown menu.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isSubmitted && Object.keys(answers).length !== (question.options?.length || question.answers?.length || 0)}
        >
          {isSubmitted ? 'Next Question' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
};

export default ReadingWritingFillBlanks;