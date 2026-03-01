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

      <div className="action-buttons">
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