import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import ProgressBar from '../common/ProgressBar';
import Timer from '../common/Timer';
import ReadingWritingFillBlanks from '../questions/ReadingWritingFillBlanks';
import MultipleChoice from '../questions/MultipleChoice';
import ReorderParagraph from '../questions/ReorderParagraph';
import ReadingFillBlanks from '../questions/ReadingFillBlanks';
import ReadingMultipleChoiceAudio from '../questions/ReadingMultipleChoiceAudio';
import { useNavigate } from 'react-router-dom';
import { READING_PASSAGES } from '../../data/readingData';

const ReadingSection = () => {
  const { state, setCurrentQuestionIndex, setCurrentSection } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  // Map the structured JSON reading passages into individual test questions
  const readingQuestions = READING_PASSAGES.flatMap(passage => {
    return passage.questions.map((q) => {
      let type = '';
      let options = [];
      let correct = null;
      let answers = [];
      let sentences = [];
      let correctOrder = [];

      if (q.type === 'MCQ Single Answer') {
        type = 'multiple_choice';
        options = Object.entries(q.options).map(([key, text]) => ({ id: key, text }));
        correct = q.correct_answer;
      } else if (q.type === 'MCQ Multiple Answers') {
        type = 'multiple_choice';
        options = Object.entries(q.options).map(([key, text]) => ({ id: key, text }));
        correct = q.correct_answer;
      } else if (q.type === 'Re-order Paragraphs') {
        type = 'reorder_paragraph';
        sentences = q.paragraphs.map(p => {
          const match = p.match(/^(\d+)\.\s*(.*)/);
          if (match) {
            return { id: `rs_${match[1]}`, text: match[2] };
          }
          return { id: `rs_${Math.random()}`, text: p };
        });
        correctOrder = q.correct_order.map(num => `rs_${num}`);
      } else if (q.type === 'Fill in the Blanks') {
        type = 'reading_fill_blanks';
        let blankCount = 0;
        const formattedPassage = q.blank_text.replace(/________/g, () => {
          blankCount++;
          return `___${blankCount}___`;
        });

        options = [...q.correct_answers].sort();
        answers = q.correct_answers.map((ans, idx) => ({
          blank: idx + 1, // Fix: Use 1-based index (e.g. 1 instead of 0) since replace uses 1-based logic
          correct: ans
        }));

        return {
          id: q.id,
          type,
          passage: formattedPassage, // For fill in the blanks, passage is the blank_text
          prompt: q.student_instructions,
          options,
          answers,
          title: passage.title
        };
      }

      return {
        id: q.id,
        type,
        passage: passage.text,
        prompt: q.student_instructions,
        question: q.question,
        options,
        correct,
        multiple: q.type === 'MCQ Multiple Answers',
        sentences,
        correctOrder,
        title: passage.title
      };
    });
  });

  const currentQuestionData = readingQuestions[currentQuestion];

  const handleNextQuestion = () => {
    if (currentQuestion < readingQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentQuestionIndex(nextIndex);
      window.scrollTo(0, 0);
    } else {
      // Move to listening section
      setCurrentSection('listening');
      setCurrentQuestionIndex(0);
      navigate('/exam/listening');
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
    setCurrentSection('reading');
  }, [setCurrentSection]);

  return (
    <div className="exam-container exam-theme">
      <header className="exam-header">
        <div className="container">
          <h1 className="exam-title">PTE Academic Mock Test</h1>
          <div className="timer-display">
            <Timer initialTime={600} /> {/* 10 minutes for reading section */}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="exam-section">
            <h2>Reading Section</h2>

            <ProgressBar
              current={currentQuestion + 1}
              total={readingQuestions.length}
            />

            <div className="exam-question">
              <div className="question-number">
                Question {currentQuestion + 1} of {readingQuestions.length}
              </div>

              <div className="exam-instructions" style={{ marginBottom: 24 }}>
                <p><strong>{currentQuestionData.prompt}</strong></p>
              </div>

              {currentQuestionData.passage && currentQuestionData.type !== 'reading_fill_blanks' && currentQuestionData.type !== 'reading_writing_fill_blanks' && (
                <div style={{ padding: '24px', background: '#f8f9fe', borderRadius: '16px', marginBottom: '32px', borderLeft: '4px solid #673ab7', fontSize: '16px', lineHeight: '1.7', color: '#1e293b' }}>
                  {currentQuestionData.title && <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#0f172a' }}>{currentQuestionData.title}</h3>}
                  <p style={{ margin: 0 }}>{currentQuestionData.passage}</p>
                </div>
              )}

              {/* Render the appropriate question component based on type */}
              {currentQuestionData.type === 'reading_writing_fill_blanks' && (
                <ReadingWritingFillBlanks question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'multiple_choice' && (
                <MultipleChoice question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reorder_paragraph' && (
                <ReorderParagraph question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reading_fill_blanks' && (
                <ReadingFillBlanks question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reading_multiple_choice_audio' && (
                <ReadingMultipleChoiceAudio question={currentQuestionData} onNext={handleNextQuestion} />
              )}
            </div>

            <div className="navigation-buttons">
              <button
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
              >
                {currentQuestion === readingQuestions.length - 1 ? 'Finish Section' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingSection;