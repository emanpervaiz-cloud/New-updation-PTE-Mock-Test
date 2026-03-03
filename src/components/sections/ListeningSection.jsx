import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import ProgressBar from '../common/ProgressBar';
import Timer from '../common/Timer';
import SummarizeSpokenText from '../questions/SummarizeSpokenText';
import ListeningMultipleChoice from '../questions/ListeningMultipleChoice';
import ListeningFillBlanks from '../questions/ListeningFillBlanks';
import HighlightCorrectSummary from '../questions/HighlightCorrectSummary';
import SelectMissingWord from '../questions/SelectMissingWord';
import HighlightIncorrectWords from '../questions/HighlightIncorrectWords';
import WriteFromDictation from '../questions/WriteFromDictation';
import { LISTENING_PASSAGES } from '../../data/listeningData';
import { useNavigate } from 'react-router-dom';

const ListeningSection = () => {
  const { state, setCurrentQuestionIndex, setCurrentSection } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Debug logging
  console.log('ListeningSection rendering...');
  console.log('LISTENING_PASSAGES:', LISTENING_PASSAGES);

  // Map the structured JSON listening passages into individual test questions
  let listeningQuestions = [];
  try {
    listeningQuestions = LISTENING_PASSAGES.flatMap((passage, pIdx) => {
      if (!passage.questions || !Array.isArray(passage.questions)) {
        console.warn(`No questions found for passage: ${passage.passage_id}`);
        return [];
      }
      return passage.questions.flatMap((q, qIdx) => {
        try {
          const audioUrl = passage.audioUrl || `/assets/listening/listening_audio_${(pIdx % 3) + 1}.wav`;
          const title = passage.title;

          if (q.type === 'Summarize Spoken Text') {
            return {
              id: `${passage.passage_id}_${qIdx}`,
              type: 'summarize_spoken_text',
              audioUrl,
              instruction: q.question,
              minWords: q.word_count_limit ? q.word_count_limit[0] : 50,
              maxWords: q.word_count_limit ? q.word_count_limit[1] : 70,
              transcript: passage.transcript,
              keyPoints: q.key_points,
              title
            };
          } else if (q.type.includes('Multiple Choice')) {
            const multiple = q.type.includes('Multiple Answers');
            const options = q.options ? q.options.map((opt, idx) => {
              const match = opt.match(/^([A-Z])\.\s*(.*)/);
              return match ? { id: match[1], text: match[2] } : { id: `opt_${idx}`, text: opt };
            }) : [];
            const correct = multiple ? q.correct_answers : q.correct_answer;

            return {
              id: `${passage.passage_id}_${qIdx}`,
              type: 'listening_multiple_choice',
              audioUrl,
              instruction: q.note || 'Listen to the audio and answer the multiple-choice question.',
              question: q.question,
              options,
              correct,
              multiple,
              title
            };
          } else if (q.type === 'Fill in the Blanks') {
            let blankCount = 0;
            const formattedPassage = q.blank_text.replace(/________/g, () => {
              blankCount++;
              return `___${blankCount}___`;
            });
            const answers = q.correct_answers.map((ans, idx) => ({
              blank: idx + 1,
              correct: ans
            }));

            return {
              id: `${passage.passage_id}_${qIdx}`,
              type: 'listening_fill_blanks',
              audioUrl,
              passage: formattedPassage,
              options: [...q.correct_answers].sort(),
              answers,
              instruction: 'Type the missing words in the blanks based on the recording.',
              title
            };
          } else if (q.type === 'True / False / Not Given') {
            return q.statements.map((stmt, idx) => ({
              id: `${passage.passage_id}_${qIdx}_${idx}`,
              type: 'listening_multiple_choice',
              audioUrl,
              instruction: 'Based on the lecture, decide whether the following statement is True, False, or Not Given.',
              question: stmt.statement,
              options: [
                { id: 'True', text: 'True' },
                { id: 'False', text: 'False' },
                { id: 'Not Given', text: 'Not Given' }
              ],
              correct: stmt.answer,
              multiple: false,
              title
            }));
          } else if (q.type === 'Short Answer') {
            return {
              id: `${passage.passage_id}_${qIdx}`,
              type: 'summarize_spoken_text', // Mapping short answer to summarize_spoken_text for simplicity
              audioUrl,
              instruction: q.question,
              minWords: 1,
              maxWords: 15,
              transcript: passage.transcript,
              modelAnswer: q.model_answer,
              title
            };
          } else if (q.type === 'Select Missing Word') {
            const options = q.options ? q.options.map((opt, idx) => {
              const match = opt.match(/^([A-Z])\)\s*(.*)/);
              return match ? { id: match[1], text: match[2] } : { id: `opt_${idx}`, text: opt };
            }) : [];

            return {
              id: `${passage.passage_id}_${qIdx}`,
              type: 'select_missing_word',
              audioUrl,
              instruction: q.question,
              context: q.context,
              options,
              correct: q.correct_answer,
              title
            };
          }
          return [];
        } catch (err) {
          console.error(`Error processing question ${qIdx} in passage ${passage.passage_id}:`, err);
          return [];
        }
      });
    });
  } catch (err) {
    console.error('Error processing listening passages:', err);
    setError(err.message);
  }

  const currentQuestionData = listeningQuestions[currentQuestion];

  console.log('listeningQuestions count:', listeningQuestions.length);
  console.log('currentQuestionData:', currentQuestionData);

  // Handle error state
  if (error) {
    return (
      <div className="exam-container exam-theme">
        <header className="exam-header">
          <div className="container">
            <h1 className="exam-title">PTE Academic Mock Test</h1>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <div className="exam-section">
              <h2>Listening Section</h2>
              <div className="exam-question" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <p>Error loading listening questions: {error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle case when no questions are available
  if (!currentQuestionData || listeningQuestions.length === 0) {
    return (
      <div className="exam-container exam-theme">
        <header className="exam-header">
          <div className="container">
            <h1 className="exam-title">PTE Academic Mock Test</h1>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <div className="exam-section">
              <h2>Listening Section</h2>
              <div className="exam-question" style={{ textAlign: 'center', padding: '40px' }}>
                <p>No listening questions available. Please check the data configuration.</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Debug: LISTENING_PASSAGES length = {LISTENING_PASSAGES?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleNextQuestion = () => {
    const isLastQuestion = currentQuestion >= listeningQuestions.length - 1;

    if (isLastQuestion) {
      // Listening is first - navigate to Speaking
      console.log('Listening section completed - navigating to Speaking');
      setCurrentSection('speaking');
      setCurrentQuestionIndex(0);
      navigate('/exam/speaking', { replace: true });
    } else {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentQuestionIndex(nextIndex);
      window.scrollTo(0, 0);
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
    setCurrentSection('listening');
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
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-color)' }}>Listening Module</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: 'var(--secondary-color)' }}>●</span> Section Test
          </div>
          <Timer initialTime={900} />
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
            <span style={{ fontSize: 20 }}>🎧</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Section</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>PTE Listening</div>
            </div>
          </div>

          <ProgressBar
            current={currentQuestion + 1}
            total={listeningQuestions.length}
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
                Question {currentQuestion + 1} Instructions
              </div>
              <p style={{
                margin: 0, fontSize: 16, color: 'var(--text-main)', lineHeight: 1.6,
                background: 'var(--accent-color)', padding: '16px 20px', borderRadius: 12,
                borderLeft: '4px solid var(--primary-color)'
              }}>
                {currentQuestionData.instruction || 'Listen to the audio and answer the question.'}
              </p>
            </div>

            <div style={{ flex: 1 }}>
              {currentQuestionData.title && currentQuestionData.type !== 'summarize_spoken_text' && (
                <div style={{ padding: '16px', background: 'rgba(13, 59, 102, 0.05)', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Topic: {currentQuestionData.title}</h3>
                </div>
              )}

              {/* Render the appropriate question component based on type */}
              {currentQuestionData.type === 'summarize_spoken_text' && (
                <SummarizeSpokenText question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'listening_multiple_choice' && (
                <ListeningMultipleChoice question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'listening_fill_blanks' && (
                <ListeningFillBlanks question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'highlight_correct_summary' && (
                <HighlightCorrectSummary question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'select_missing_word' && (
                <SelectMissingWord question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'highlight_incorrect_words' && (
                <HighlightIncorrectWords question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'write_from_dictation' && (
                <WriteFromDictation question={currentQuestionData} onNext={handleNextQuestion} />
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
              {currentQuestion === listeningQuestions.length - 1 ? 'Next Section →' : 'Next Question →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningSection;