import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';

const ReorderParagraph = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [orderedSentences, setOrderedSentences] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (question && question.sentences && question.sentences.length > 0) {
      setOrderedSentences([...question.sentences].sort(() => Math.random() - 0.5));
      setIsSubmitted(false);
    }
  }, [question?.id]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    const newOrderedSentences = [...orderedSentences];
    const draggedItem = newOrderedSentences[dragIndex];

    // Remove the dragged item
    newOrderedSentences.splice(dragIndex, 1);
    // Insert at the drop position
    newOrderedSentences.splice(dropIndex, 0, draggedItem);

    setOrderedSentences(newOrderedSentences);
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      onNext();
      return;
    }

    // Don't submit if no sentences ordered
    if (orderedSentences.length === 0) {
      return;
    }

    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'reading',
      type: 'reorder_paragraph',
      responses: orderedSentences.map(sentence => sentence.id)
    });

    setIsSubmitted(true);
  };

  return (
    <div className="reorder-paragraph-question">
      <div className="prompt-text">
        <p>{question.prompt}</p>
      </div>

      <div className="sentences-container">
        <h3>Reorder the sentences:</h3>
        {orderedSentences.map((sentence, index) => (
          <div
            key={sentence.id}
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            {index + 1}. {sentence.text}
          </div>
        ))}
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Drag and drop the sentences to restore the original order.</p>
      </div>

      {isSubmitted && (
        <div className="answer-feedback" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: 'rgba(13, 59, 102, 0.05)',
          borderRadius: '8px',
          border: '1px solid var(--primary-color)'
        }}>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Correct Order:</h4>
          {question.sentences?.map((sentence, idx) => {
            const userIndex = orderedSentences.findIndex(s => s.id === sentence.id);
            const isCorrectPosition = userIndex === idx;
            return (
              <div key={sentence.id} style={{
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: isCorrectPosition ? '#dcfce7' : '#fee2e2',
                borderRadius: '4px',
                borderLeft: `4px solid ${isCorrectPosition ? '#22c55e' : '#ef4444'}`
              }}>
                <strong>{idx + 1}.</strong>{' '}
                <span style={{ color: isCorrectPosition ? '#22c55e' : '#ef4444' }}>
                  {sentence.text}
                </span>
                {!isCorrectPosition && (
                  <span style={{ color: '#ef4444', marginLeft: '10px', fontSize: '0.9em' }}>
                    (Your position: {userIndex + 1})
                  </span>
                )}
                {isCorrectPosition && <span style={{ color: '#22c55e', marginLeft: '10px' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}

      <div className="action-buttons" style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={orderedSentences.length === 0}
        >
          {isSubmitted ? 'Next Question' : 'Submit Order'}
        </button>
      </div>
    </div>
  );
};

export default ReorderParagraph;