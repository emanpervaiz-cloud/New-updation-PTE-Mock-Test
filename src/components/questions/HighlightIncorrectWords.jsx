import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const HighlightIncorrectWords = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWordClick = (index) => {
    if (isSubmitted) return; // Prevent changes after submission
    if (incorrectWords.includes(index)) {
      setIncorrectWords(incorrectWords.filter(i => i !== index));
    } else {
      setIncorrectWords([...incorrectWords, index]);
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
      type: 'highlight_incorrect_words',
      response: incorrectWords,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  const renderTranscriptWithClickableWords = () => {
    const words = question.transcript.split(' ');

    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      const punctuation = word.match(/[.,!?;:]/g)?.join('') || '';

      return (
        <span
          key={index}
          className={`clickable-word ${incorrectWords.includes(index) ? 'highlighted-incorrect' : ''
            }`}
          onClick={() => handleWordClick(index)}
        >
          {cleanWord}{punctuation}{' '}
        </span>
      );
    });
  };

  return (
    <div className="highlight-incorrect-words-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the passage"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="transcript-section">
        <h3>Identify the incorrect words:</h3>
        <div className="transcript-text">
          {renderTranscriptWithClickableWords()}
        </div>
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Click on the words that are different from what you heard.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={incorrectWords.length === 0}
        >
          {isSubmitted ? 'Next Question' : 'Submit Answer'}
        </button>
      </div>

      {isSubmitted && (
        <div style={{
          marginTop: 24,
          padding: '20px',
          background: '#f0fdf4',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h4 style={{ color: '#166534', margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span> Self-Review Feedback
          </h4>
          <p style={{ color: '#15803d', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Compare your highlighted words with the recording. In a real test, points are deducted for incorrect selections.
          </p>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default HighlightIncorrectWords;