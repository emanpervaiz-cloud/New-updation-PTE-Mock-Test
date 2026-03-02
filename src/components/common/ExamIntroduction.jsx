import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';

const ExamIntroduction = () => {
  const navigate = useNavigate();
  const { startExam, setTimer, state, setUser } = useExam();

  const handleStartExam = () => {
    // set exam duration to configured minutes (default 40)
    const seconds = (state?.examDurationMinutes || 40) * 60;
    setTimer(seconds);
    startExam();
    // if logged-in user, record lastTestTaken so next test can vary
    if (state && state.user) {
      const updated = { ...state.user, lastTestTaken: new Date().toISOString() };
      setUser(updated);
      try { localStorage.setItem('pte_user', JSON.stringify(updated)); } catch { }
    }
    navigate('/exam/listening');
  };

  const sections = [
    { title: 'Listening', time: '10 Min', questions: '7 Ques', icon: '🎧', color: '#fce4ec', textColor: '#e91e63' },
    { title: 'Speaking', time: '10 Min', questions: '5 Ques', icon: '🎤', color: '#e8f4fd', textColor: '#2196f3' },
    { title: 'Writing', time: '10 Min', questions: '2 Ques', icon: '✍️', color: '#fffde7', textColor: '#f9a825' },
    { title: 'Reading', time: '10 Min', questions: '4 Ques', icon: '📖', color: '#e8f5e9', textColor: '#43a047' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fb 0%, #ebf0f9 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Premium Header */}
      <header style={{
        background: '#fff',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid #e8ecf4',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#3e2723', letterSpacing: '-0.5px' }}>
          Migration PTE Mock test
        </h1>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '100%',
          maxWidth: 800,
          background: '#fff',
          borderRadius: 24,
          padding: '48px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 32
        }}>
          {/* Intro Text */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1a237e', margin: '0 0 12px' }}>Ready to Begin?</h2>
            <p style={{ color: '#666', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              This mock test simulates the real PTE Academic experience. Please ensure you are in a quiet environment.
            </p>
          </div>

          {/* Section Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {sections.map((sec) => (
              <div key={sec.title} style={{
                background: sec.color,
                borderRadius: 16,
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{sec.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#333', marginBottom: 4 }}>{sec.title}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: sec.textColor }}>{sec.time} • {sec.questions}</div>
              </div>
            ))}
          </div>

          {/* Guidelines & Timer Summary */}
          <div style={{
            background: '#f8f9fe',
            borderRadius: 16,
            padding: '24px',
            borderLeft: '4px solid #3949ab'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3949ab', textTransform: 'uppercase', marginBottom: 4 }}>Total Duration</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1a237e' }}>40 Minutes</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, color: '#555' }}>✅ Microphone Enabled</span>
                <span style={{ fontSize: 13, color: '#555' }}>✅ Quiet Environment</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartExam}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '18px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(57,73,171,0.25)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Begin Examination →
          </button>
        </div>
      </main>

      <footer style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: 12 }}>
        © {new Date().getFullYear()} Migration PTE Mock test. All rights reserved.
      </footer>
    </div>
  );
};

export default ExamIntroduction;
