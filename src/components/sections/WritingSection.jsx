import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import ProgressBar from '../common/ProgressBar';
import Timer from '../common/Timer';
import SummarizeWrittenText from '../questions/SummarizeWrittenText';
import WriteEssay from '../questions/WriteEssay';
import { useNavigate } from 'react-router-dom';

const WritingSection = () => {
  const { state, setCurrentQuestionIndex, setCurrentSection } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  // Mock writing questions data
  const writingQuestions = [
    {
      id: 'wq1',
      type: 'summarize_written_text',
      prompt: 'Read the passage below and summarize it using one sentence. You have 10 minutes to finish this task.',
      passage: 'Global warming is a long-term rise in the average temperature of the Earth\'s climate system, an aspect of climate change shown by temperature measurements and by multiple effects of the warming. The term commonly refers to the mainly human-caused increase in global surface temperatures and its projected continuation, though there have been prehistoric periods of climate change.',
      instruction: 'Summarize the paragraph in a single sentence. Your response should be between 5 and 75 words.'
    },
    {
      id: 'wq2',
      type: 'write_essay',
      prompt: 'Write an essay about the impact of technology on education. Discuss both positive and negative aspects, and provide examples to support your opinion. You have 20 minutes to complete this task.',
      instruction: 'Write a 200-300 word essay on the given topic. Make sure to organize your ideas logically and support them with relevant examples.'
    }
  ];

  const currentQuestionData = writingQuestions[currentQuestion];

  const handleNextQuestion = () => {
    console.log('Writing: handleNextQuestion called', { currentQuestion, total: writingQuestions.length });
    
    if (currentQuestion < writingQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentQuestionIndex(nextIndex);
      window.scrollTo(0, 0);
    } else {
      console.log('Writing: Navigating to reading section...');
      // Move to reading section
      setCurrentSection('reading');
      setCurrentQuestionIndex(0);
      navigate('/exam/reading', { replace: true });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentQuestionIndex(currentQuestion - 1);
    }
  };

  // Set the current section when component mounts
  useEffect(() => {
    setCurrentSection('writing');
  }, [setCurrentSection]);

  return (
    <div className="exam-container exam-theme">
      <header className="exam-header">
        <div className="container">
          <h1 className="exam-title">PTE Academic Mock Test</h1>
          <div className="timer-display">
            <Timer initialTime={600} /> {/* 10 minutes for writing section */}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="exam-section">
            <h2>Writing Section</h2>

            <ProgressBar
              current={currentQuestion + 1}
              total={writingQuestions.length}
            />

            <div className="exam-question">
              <div className="question-number">
                Question {currentQuestion + 1} of {writingQuestions.length}
              </div>

              <div className="exam-instructions">
                <p>{currentQuestionData.instruction}</p>
              </div>

              {/* Render the appropriate question component based on type */}
              {currentQuestionData.type === 'summarize_written_text' && (
                <SummarizeWrittenText question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'write_essay' && (
                <WriteEssay question={currentQuestionData} onNext={handleNextQuestion} />
              )}
            </div>

            <div className="navigation-buttons" style={{ position: 'relative', zIndex: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextQuestion}
              >
                {currentQuestion === writingQuestions.length - 1 ? 'Next: Reading Section →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WritingSection;