import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import AIEvaluationService from '../../services/aiEvaluationService';
import ScoreDisplay from '../common/ScoreDisplay';

const ReadingFillBlanks = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [answers, setAnswers] = useState({});
  const [availableOptions, setAvailableOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // AI Evaluation State
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);

  useEffect(() => {
    if (question) {
      setAnswers({});
      setAvailableOptions(question.options ? [...question.options] : []);
      setIsSubmitted(false);
      setEvaluation(null);
      setEvalLoading(false);
      setEvalError(null);
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

    // Don't submit if no answers selected
    if (Object.keys(answers).length === 0) {
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
    handleGetAIScore(answers);
  };

  const handleGetAIScore = async (currentAnswers) => {
    setEvalLoading(true);
    setEvalError(null);

    try {
      const evaluator = new AIEvaluationService();

      // Format current answer for evaluation
      const questionsWithAnswers = [{
        id: question.id,
        type: 'reading_fill_blanks',
        passage: question.passage,
        correct_answer: question.answers.reduce((acc, a) => ({ ...acc, [a.blank]: a.correct }), {}),
        response: currentAnswers
      }];

      const result = await evaluator.evaluateReading(questionsWithAnswers);
      setEvaluation(result);

      // Store in localStorage
      const aiEvaluations = JSON.parse(localStorage.getItem('pte_ai_evaluations') || '{}');
      aiEvaluations[question.id] = result;
      localStorage.setItem('pte_ai_evaluations', JSON.stringify(aiEvaluations));

    } catch (err) {
      console.error('AI Evaluation Error:', err);
      setEvalError('Failed to get AI score. Numerical score shown below.');
    } finally {
      setEvalLoading(false);
    }
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
        <>
          <div className="answer-feedback" style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(13, 59, 102, 0.05)',
            borderRadius: '8px',
            border: '1px solid var(--primary-color)'
          }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Correct Answers:</h4>
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

          <div className="evaluation-section" style={{ marginTop: '24px' }}>
            <ScoreDisplay
              evaluation={evaluation}
              loading={evalLoading}
              error={evalError}
              questionType="reading"
            />

            {!evaluation && !evalLoading && (
              <div className="numerical-score-fallback" style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginTop: '12px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>Numerical Score:</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {question.answers.filter(a => answers[a.blank] === a.correct).length} / {question.answers.length}
                </p>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                  ({((question.answers.filter(a => answers[a.blank] === a.correct).length / question.answers.length) * 100).toFixed(0)}% Accuracy)
                </p>
              </div>
            )}
          </div>
        </>
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