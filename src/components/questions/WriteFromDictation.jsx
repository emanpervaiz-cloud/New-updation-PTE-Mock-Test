import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const WriteFromDictation = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [sentence, setSentence] = useState('');
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleChange = (e) => {
    setSentence(e.target.value);
  };

  const handleAudioPlay = () => {
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    // Save the answer
    saveAnswer(question.id, {
      questionId: question.id,
      section: 'listening',
      type: 'write_from_dictation',
      response: sentence,
      meta: { audioPlayed: audioPlayed }
    });

    // Move to next question
    onNext();
  };

  return (
    <div className="write-from-dictation-question">
      <div className="audio-section">
        <AudioPlayer
          src={question.audioUrl}
          title="Listen to the sentence"
          onPlay={handleAudioPlay}
        />
      </div>

      <div className="answer-section">
        <h3>Type the sentence exactly as you hear it:</h3>
        <input
          type="text"
          className="response-input"
          value={sentence}
          onChange={handleChange}
          placeholder="Type the sentence here..."
        />
      </div>

      <div className="instructions">
        <p><strong>Instructions:</strong> Type the sentence exactly as you hear it.</p>
        <p><strong>Note:</strong> You will only be able to play the audio once.</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={sentence.trim() === ''}
        >
          Submit Sentence
        </button>
      </div>
    </div>
  );
};

export default WriteFromDictation;