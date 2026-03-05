import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import ProgressBar from '../common/ProgressBar';
import Timer from '../common/Timer';
import SummarizeWrittenText from '../questions/SummarizeWrittenText';
import WriteEssay from '../questions/WriteEssay';
import ModuleResults from '../common/ModuleResults';
import { useNavigate } from 'react-router-dom';

const WritingSection = ({ onSectionComplete, onSectionBack, isMockTest = false, nextModule = null }) => {
  const { state, setCurrentQuestionIndex, setCurrentSection, resetMockTest } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
      console.log('Writing: Section complete', { isMockTest });
      if (isMockTest) {
        if (onSectionComplete) onSectionComplete();
      } else {
        // Individual Practice Mode: Show results inline
        setShowResults(true);
      }
    }
  };

  const handleTimeout = () => {
    if (isMockTest) {
      setShowTimeoutModal(true);
      setTimeout(() => {
        resetMockTest();
        navigate('/');
      }, 3000);
    } else {
      // Practice mode: skip to results on timeout
      setShowResults(true);
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
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-color)' }}>Writing Module</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {!isMockTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: 'var(--secondary-color)' }}>●</span> Practice Mode
            </div>
          )}
          {isMockTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-color)', fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: 'var(--danger-color)' }}>●</span> MOCK TEST LIVE
            </div>
          )}
          <Timer initialTime={600} onComplete={handleTimeout} />
        </div>
      </header>

      {showTimeoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: 20 }}>
          <div style={{ background: '#fff', color: 'var(--text-main)', padding: 40, borderRadius: 24, maxWidth: 450, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ color: 'var(--danger-color)', marginBottom: 16 }}>⏰ Time Expired!</h2>
            <p style={{ fontSize: 18, marginBottom: 24, lineHeight: 1.6 }}>The time limit for this section has been reached. In Mock Test mode, the test must be completed within the fixed time limits.</p>
            <p style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Restarting Mock Test...</p>
          </div>
        </div>
      )}

      <main style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Section Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '12px 20px', background: 'rgba(13, 59, 102, 0.05)',
            borderRadius: 12, color: 'var(--primary-color)'
          }}>
            <span style={{ fontSize: 20 }}>✍️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Section</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>PTE Writing</div>
            </div>
          </div>

          <ProgressBar
            current={currentQuestion + 1}
            total={writingQuestions.length}
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
                Instructions
              </div>
              <p style={{
                margin: 0, fontSize: 16, color: 'var(--text-main)', lineHeight: 1.6,
                background: 'var(--accent-color)', padding: '16px 20px', borderRadius: 12,
                borderLeft: '4px solid var(--primary-color)'
              }}>
                {currentQuestionData.instruction}
              </p>
            </div>

            {showResults ? (
              <ModuleResults moduleType="writing" isInline={true} />
            ) : (
              <div style={{ flex: 1 }}>
                {currentQuestionData.type === 'summarize_written_text' && (
                  <SummarizeWrittenText question={currentQuestionData} onNext={handleNextQuestion} />
                )}
                {currentQuestionData.type === 'write_essay' && (
                  <WriteEssay question={currentQuestionData} onNext={handleNextQuestion} />
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 32px', background: '#fff', borderRadius: 20,
            border: '1px solid var(--accent-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            {!showResults ? (
              <>
                {!isMockTest && (
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
                )}
                {!isMockTest && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {currentQuestion === writingQuestions.length - 1 && (
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                          padding: '10px 24px', borderRadius: 12,
                          background: '#fff', color: 'var(--danger-color)',
                          border: '1.5px solid #fee2e2',
                          fontWeight: 600, fontSize: 14, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✖ Back to Dashboard
                      </button>
                    )}
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
                      {currentQuestion === writingQuestions.length - 1
                        ? 'View Results →'
                        : 'Next Question →'}
                    </button>
                  </div>
                )}
                {isMockTest && (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
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
                      {currentQuestion === writingQuestions.length - 1
                        ? (nextModule ? `Next Module: ${nextModule} →` : 'Submit Mock Test →')
                        : 'Next Question →'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '12px 48px', borderRadius: 12,
                    background: 'var(--primary-color)',
                    color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 16, cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WritingSection;