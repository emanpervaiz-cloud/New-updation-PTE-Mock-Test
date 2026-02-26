import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const ListeningFillBlanks = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [answers, setAnswers] = useState({});
  const [availableOptions, setAvailableOptions] = useState([...question.options]);
  const [audioPlayed, setAudioPlayed] = useState(false);

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

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    // Save the answers
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'listening_fill_blanks',
      responses: answers,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
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
    <div className="listening-fill-blanks-question">
      <div className="passage-section">
        <div className="passage-text">
          {renderPassageWithBlanks()}
        </div>
      </div>

      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the passage"
          onPlay={handleAudioPlay}
        />
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
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
};

export default ListeningFillBlanks;