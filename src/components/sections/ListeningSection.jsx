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
    console.log('handleNextQuestion called');
    console.log('currentQuestion:', currentQuestion);
    console.log('listeningQuestions.length:', listeningQuestions.length);
    
    const isLastQuestion = currentQuestion >= listeningQuestions.length - 1;
    console.log('isLastQuestion:', isLastQuestion);
    
    if (isLastQuestion) {
      console.log('Navigating to results...');
      // Move to results section
      setCurrentQuestionIndex(0);
      navigate('/exam/results', { replace: true });
    } else {
      console.log('Moving to next question...');
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
  }, [setCurrentSection]);

  return (
    <div className="exam-container exam-theme">
      <header className="exam-header">
        <div className="container">
          <h1 className="exam-title">PTE Academic Mock Test</h1>
          <div className="timer-display">
            <Timer initialTime={600} /> {/* 10 minutes for listening section */}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="exam-section">
            <h2>Listening Section</h2>

            <ProgressBar
              current={currentQuestion + 1}
              total={listeningQuestions.length}
            />

            <div className="exam-question">
              <div className="question-number">
                Question {currentQuestion + 1} of {listeningQuestions.length}
              </div>

              <div className="exam-instructions" style={{ marginBottom: 24 }}>
                <p><strong>{currentQuestionData.instruction || 'Listen to the audio and answer the question.'}</strong></p>
              </div>

              {currentQuestionData.title && currentQuestionData.type !== 'summarize_spoken_text' && (
                <div style={{ padding: '16px', background: '#e0f2fe', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #0284c7', color: '#0f172a' }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Topic: {currentQuestionData.title}</h3>
                </div>
              )}

              {/* Render the appropriate question component based on type */}
              {currentQuestionData.type === 'summarize_spoken_text' && (
                <SummarizeSpokenText key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'listening_multiple_choice' && (
                <ListeningMultipleChoice key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'listening_fill_blanks' && (
                <ListeningFillBlanks key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'highlight_correct_summary' && (
                <HighlightCorrectSummary key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'select_missing_word' && (
                <SelectMissingWord key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'highlight_incorrect_words' && (
                <HighlightIncorrectWords key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'write_from_dictation' && (
                <WriteFromDictation key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
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
                {currentQuestion === listeningQuestions.length - 1 ? 'Finish Exam' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningSection;