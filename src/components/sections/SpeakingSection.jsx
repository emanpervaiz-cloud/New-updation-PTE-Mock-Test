import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import ProgressBar from '../common/ProgressBar';
import Timer from '../common/Timer';
import ReadAloud from '../questions/ReadAloud';
import RepeatSentence from '../questions/RepeatSentence';
import DescribeImage from '../questions/DescribeImage';
import RetellLecture from '../questions/RetellLecture';
import AnswerShortQuestion from '../questions/AnswerShortQuestion';
import { useNavigate } from 'react-router-dom';

const SpeakingSection = () => {
  const { state, setCurrentQuestionIndex, setCurrentSection } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  // Speaking questions data - Only including the user's voice notes as they are the priority
  const speakingQuestions = [
    {
      id: 'vn_1',
      type: 'repeat_sentence',
      audioUrl: '/assets/speaking/read_aloud_1.wav',
      instruction: 'Listen to the audio and repeat the sentence exactly as you hear it.',
      transcript: 'Global warming is one of the most serious challenges facing humanity today. Immediate action is required to reduce carbon emissions.'
    },
    {
      id: 'vn_2',
      type: 'repeat_sentence',
      audioUrl: '/assets/speaking/read_aloud_2.wav',
      instruction: 'Listen to the audio and repeat the sentence exactly as you hear it.',
      transcript: 'Education is the foundation of personal and social development. Every child deserves access to quality learning opportunities.'
    },
    {
      id: 'vn_3',
      type: 'repeat_sentence',
      audioUrl: '/assets/speaking/read_aloud_3.wav',
      instruction: 'Listen to the audio and repeat the sentence exactly as you hear it.',
      transcript: 'Technology has transformed the way we communicate. Social media platforms connect millions of people worldwide.'
    },
    {
      id: 'vn_4',
      type: 'repeat_sentence',
      audioUrl: '/assets/speaking/read_aloud_4.wav',
      instruction: 'Listen to the audio and repeat the sentence exactly as you hear it.',
      transcript: 'Healthy eating is essential for maintaining physical and mental well-being. Fruits and vegetables should be included in every meal.'
    },
    {
      id: 'vn_5',
      type: 'repeat_sentence',
      audioUrl: '/assets/speaking/read_aloud_5.wav',
      instruction: 'Listen to the audio and repeat the sentence exactly as you hear it.',
      transcript: 'Global trade has increased dramatically in the past decades. Countries are more interconnected than ever before.'
    },
    {
      id: 'vn_6_di',
      type: 'describe_image',
      imageUrl: '/assets/pte_describe_image_chart.png',
      instruction: 'Look at the image below and describe it in detail. You have 25 seconds to prepare and 40 seconds to speak.'
    }
  ];

  const currentQuestionData = speakingQuestions[currentQuestion];

  const handleNextQuestion = () => {
    console.log('handleNextQuestion called', currentQuestion, speakingQuestions.length);
    if (currentQuestion < speakingQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentQuestionIndex(nextIndex);
      window.scrollTo(0, 0);
    } else {
      console.log('Navigating to writing section...');
      // Set section in context before navigating for consistency
      setCurrentSection('writing');
      setCurrentQuestionIndex(0);
      navigate('/exam/writing');
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
    setCurrentSection('speaking');
  }, [setCurrentSection]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Premium Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e8ecf4',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #ff8a65, #ff6f00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16,
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1f36' }}>Speaking Module</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5a6270', fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: '#673ab7' }}>●</span> Section Test
          </div>
          <Timer initialTime={600} /> {/* 10 minutes */}
        </div>
      </header>

      <main style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Section Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '12px 20px', background: 'rgba(103, 58, 183, 0.05)',
            borderRadius: 12, color: '#512da8'
          }}>
            <span style={{ fontSize: 20 }}>🎙️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Section</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Speaking & Writing</div>
            </div>
          </div>

          <ProgressBar
            current={currentQuestion + 1}
            total={speakingQuestions.length}
          />

          {/* Question Card */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid #eef2f6',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#673ab7',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#673ab7' }} />
                Instructions
              </div>
              <p style={{
                margin: 0, fontSize: 16, color: '#3e4e68', lineHeight: 1.6,
                background: '#f8f9fe', padding: '16px 20px', borderRadius: 12,
                borderLeft: '4px solid #673ab7'
              }}>
                {currentQuestionData.instruction}
              </p>
            </div>

            <div style={{ flex: 1 }}>
              {/* Question components render here */}
              {currentQuestionData.type === 'read_aloud' && (
                <ReadAloud key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'repeat_sentence' && (
                <RepeatSentence key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'describe_image' && (
                <DescribeImage key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'retell_lecture' && (
                <RetellLecture key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
              {currentQuestionData.type === 'answer_short_question' && (
                <AnswerShortQuestion key={currentQuestionData.id} question={currentQuestionData} onNext={handleNextQuestion} />
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div style={{
            marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 32px', background: '#fff', borderRadius: 20,
            border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'relative', zIndex: 10
          }}>
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '10px 24px', borderRadius: 12,
                background: 'transparent', color: currentQuestion === 0 ? '#cbd5e1' : '#5a6270',
                border: `1.5px solid ${currentQuestion === 0 ? '#e2e8f0' : '#d1d9e2'}`,
                fontWeight: 600, fontSize: 14, cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ← Previous
            </button>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              Ensure your answers are saved before proceeding
            </div>
            <button
              type="button"
              onClick={handleNextQuestion}
              style={{
                padding: '10px 32px', borderRadius: 12,
                background: 'linear-gradient(135deg, #1a1f36, #323b5c)',
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(26, 31, 54, 0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {currentQuestion === speakingQuestions.length - 1 ? 'Finish Section' : 'Next Question →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpeakingSection;