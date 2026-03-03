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
        sentences = q.paragraphs.map((p, idx) => ({
          id: `rs_${idx + 1}`,
          text: p
        }));
        correctOrder = q.correct_order.map(num => `rs_${num}`);
      } else if (q.type === 'Reading Fill in the Blanks') {
        type = 'reading_fill_blanks';
        let blankCount = 0;
        const formattedPassage = q.passage.replace(/\[BLANK_\d+\]/g, (match) => {
          blankCount++;
          return `___${blankCount}___`;
        });

        options = q.word_bank || [];
        answers = q.blanks.map((blank) => ({
          blank: blank.blank_id,
          correct: blank.correct_answer
        }));

        return {
          id: q.id,
          type,
          passage: formattedPassage,
          prompt: q.question,
          options,
          answers,
          title: passage.title
        };
      } else if (q.type === 'R&W Fill in the Blanks') {
        type = 'reading_writing_fill_blanks';
        let blankCount = 0;
        const formattedPassage = q.passage.replace(/\[BLANK_\d+\]/g, (match) => {
          blankCount++;
          return `___${blankCount}___`;
        });

        options = q.blanks.map(b => ({
          options: b.options,
          correct: b.correct_answer
        }));

        answers = q.blanks.map((blank) => ({
          blank: blank.blank_id,
          correct: blank.correct_answer
        }));

        return {
          id: q.id,
          type,
          passage: formattedPassage,
          prompt: q.question,
          options,
          answers,
          title: passage.title
        };
      }

      return {
        id: q.id,
        type,
        passage: passage.text,
        prompt: q.question,
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
    console.log('Reading: handleNextQuestion called', { currentQuestion, total: readingQuestions.length });

    if (currentQuestion < readingQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentQuestionIndex(nextIndex);
      window.scrollTo(0, 0);
    } else {
      console.log('Reading: All sections completed - navigating to results');
      // Reading is last - navigate to results
      navigate('/exam/results', { replace: true });
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
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid var(--accent-color)',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16,
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-color)' }}>Reading Module</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: 'var(--secondary-color)' }}>●</span> Section Test
          </div>
          <Timer initialTime={2100} />
        </div>
      </header>

      <main style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Section Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '12px 20px', background: 'rgba(13, 59, 102, 0.05)',
            borderRadius: 12, color: 'var(--primary-color)'
          }}>
            <span style={{ fontSize: 20 }}>📖</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Section</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>PTE Reading</div>
            </div>
          </div>

          <ProgressBar
            current={currentQuestion + 1}
            total={readingQuestions.length}
          />

          {/* Question Card */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid var(--accent-color)',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 24
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: 'var(--primary-color)',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-color)' }} />
                Question {currentQuestion + 1} Guide
              </div>
              <div style={{
                margin: 0, fontSize: 16, color: 'var(--text-main)', lineHeight: 1.6,
                background: 'var(--accent-color)', padding: '16px 20px', borderRadius: 12,
                borderLeft: '4px solid var(--primary-color)'
              }}>
                <strong>{currentQuestionData.prompt}</strong>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {currentQuestionData.passage && currentQuestionData.type !== 'reading_fill_blanks' && currentQuestionData.type !== 'reading_writing_fill_blanks' && (
                <div style={{ padding: '20px', background: 'rgba(13, 59, 102, 0.03)', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--accent-color)', color: 'var(--text-main)' }}>
                  {currentQuestionData.title && <h3 style={{ margin: '0 0 12px', fontSize: 18, color: 'var(--primary-color)' }}>Topic: {currentQuestionData.title}</h3>}
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{currentQuestionData.passage}</p>
                </div>
              )}

              {/* Render the appropriate question component based on type */}
              {currentQuestionData.type === 'reading_writing_fill_blanks' && (
                <ReadingWritingFillBlanks key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'multiple_choice' && (
                <MultipleChoice key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reorder_paragraph' && (
                <ReorderParagraph key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reading_fill_blanks' && (
                <ReadingFillBlanks key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'reading_multiple_choice_audio' && (
                <ReadingMultipleChoiceAudio key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 32px', background: '#fff', borderRadius: 20,
            border: '1px solid var(--accent-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '10px 24px', borderRadius: 12,
                background: 'transparent', color: currentQuestion === 0 ? '#cbd5e1' : 'var(--text-secondary)',
                border: `1.5px solid ${currentQuestion === 0 ? 'var(--accent-color)' : '#d1d9e2'}`,
                fontWeight: 600, fontSize: 14, cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextQuestion}
              style={{
                padding: '10px 32px', borderRadius: 12,
                background: 'var(--primary-color)',
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {currentQuestion === readingQuestions.length - 1 ? 'View Results →' : 'Next Question →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingSection;