import React, { useEffect, useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import scoringEngine from '../../services/scoringEngine';
import { AuthService } from '../../services/authService';
import { ghlService } from '../../services/ghlService';

const ResultsPage = () => {
  const { state, setScores, completeExam, resetExam } = useExam();
  const navigate = useNavigate();
  const [scores, setLocalScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simple score calculation without AI backend
    const calculateScores = () => {
      try {
        setLoading(true);
        setError(null);
        
        const answers = state.answers || {};
        
        // Count answers per section
        const speakingCount = Object.values(answers).filter(a => a.section === 'speaking').length;
        const writingCount = Object.values(answers).filter(a => a.section === 'writing').length;
        const readingCount = Object.values(answers).filter(a => a.section === 'reading').length;
        const listeningCount = Object.values(answers).filter(a => a.section === 'listening').length;
        
        // Calculate simple scores based on completion
        const calculateSectionScore = (count, maxQuestions) => {
          if (maxQuestions === 0) return 10;
          const percentage = Math.min(count / maxQuestions, 1);
          return Math.round(10 + (percentage * 80)); // Scale 10-90
        };
        
        const speakingScore = calculateSectionScore(speakingCount, 5);
        const writingScore = calculateSectionScore(writingCount, 2);
        const readingScore = calculateSectionScore(readingCount, 5);
        const listeningScore = calculateSectionScore(listeningCount, 3);
        
        const overallScore = Math.round((speakingScore + writingScore + readingScore + listeningScore) / 4);
        
        const getCefrLevel = (score) => {
          if (score >= 85) return 'C2';
          if (score >= 75) return 'C1';
          if (score >= 65) return 'B2';
          if (score >= 55) return 'B1';
          if (score >= 45) return 'A2';
          return 'A1';
        };
        
        const calculatedScores = {
          overall: { 
            overallScore: overallScore, 
            cefrLevel: getCefrLevel(overallScore),
            classification: overallScore >= 70 ? 'Advanced' : overallScore >= 50 ? 'Intermediate' : 'Beginner'
          },
          speaking: { 
            scaledScore: speakingScore, 
            cefrLevel: getCefrLevel(speakingScore), 
            feedback: `Completed ${speakingCount} speaking tasks` 
          },
          writing: { 
            scaledScore: writingScore, 
            cefrLevel: getCefrLevel(writingScore), 
            feedback: `Completed ${writingCount} writing tasks` 
          },
          reading: { 
            scaledScore: readingScore, 
            cefrLevel: getCefrLevel(readingScore), 
            feedback: `Completed ${readingCount} reading tasks` 
          },
          listening: { 
            scaledScore: listeningScore, 
            cefrLevel: getCefrLevel(listeningScore), 
            feedback: `Completed ${listeningCount} listening tasks` 
          }
        };

        setLocalScores(calculatedScores);
        setScores(calculatedScores);
        completeExam();

        // Save result history
        const result = {
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          overall: overallScore,
          speaking: speakingScore,
          writing: writingScore,
          reading: readingScore,
          listening: listeningScore,
          cefrLevel: getCefrLevel(overallScore),
          totalAnswered: Object.keys(answers).length,
        };

        try {
          const history = JSON.parse(localStorage.getItem('pteTestHistory') || '[]');
          history.push(result);
          localStorage.setItem('pteTestHistory', JSON.stringify(history));
        } catch (e) { }

        // Sync to GHL
        const user = AuthService.getUser();
        if (user) {
          ghlService.syncTestResults(user, {
            overall: overallScore,
            speaking: speakingScore,
            writing: writingScore,
            reading: readingScore,
            listening: listeningScore,
            cefr: getCefrLevel(overallScore)
          }).catch(err => console.error('GHL sync error:', err));
        }

      } catch (error) {
        console.error('Error calculating scores:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    calculateScores();
  }, []);

  const handleRetakeExam = () => {
    resetExam();
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#2e7d32';
    if (score >= 50) return '#f57f17';
    if (score >= 30) return '#e65100';
    return '#c62828';
  };

  const getScoreBarWidth = (score) => {
    return `${((score - 10) / 80) * 100}%`;
  };

  if (loading) {
    return (
      <div className="exam-container exam-theme">
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Calculating your scores...</h2>
            <p>Please wait while we process your responses.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-container exam-theme">
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Error Loading Results</h2>
            <p style={{ color: 'red' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </main>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="exam-container exam-theme">
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>No Results Available</h2>
            <p>Please complete the exam first.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </main>
      </div>
    );
  }

  const overallScore = scores.overall?.overallScore || 10;
  const cefrLevel = scores.overall?.cefrLevel || 'A1';
  const classification = scores.overall?.classification || '';

  return (
    <div className="exam-container exam-theme">
      <header className="exam-header">
        <div className="container">
          <h1 className="exam-title">PTE Academic — Test Results</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {/* Overall Score Card */}
          <div className="card" style={{ textAlign: 'center', marginBottom: '24px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px' }}>Overall Score</h2>
            <div style={{
              fontSize: '72px',
              fontWeight: '800',
              color: getScoreColor(overallScore),
              lineHeight: '1.1',
              margin: '12px 0'
            }}>
              {overallScore}
              <span style={{ fontSize: '24px', color: '#666' }}>/90</span>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: '20px',
              background: getScoreColor(overallScore),
              color: '#fff',
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '12px'
            }}>
              CEFR Level: {cefrLevel}
            </div>
            <p style={{ color: '#555', marginTop: '12px', fontSize: '15px' }}>{classification}</p>
          </div>

          {/* Section Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'speaking', label: 'Speaking', icon: '🎤' },
              { key: 'writing', label: 'Writing', icon: '✍️' },
              { key: 'reading', label: 'Reading', icon: '📖' },
              { key: 'listening', label: 'Listening', icon: '🎧' }
            ].map(({ key, label, icon }) => {
              const sectionScore = scores[key]?.scaledScore || 10;
              const sectionCefr = scores[key]?.cefrLevel || 'A1';
              const sectionFeedback = scores[key]?.feedback || '';

              return (
                <div key={key} className="card" style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '12px' }}>{icon} {label}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '36px', fontWeight: '700', color: getScoreColor(sectionScore) }}>
                      {sectionScore}
                    </span>
                    <span style={{ color: '#999' }}>/90</span>
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: '#f0f0f0',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {sectionCefr}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '12px' }}>
                    <div style={{
                      height: '100%',
                      width: getScoreBarWidth(sectionScore),
                      background: getScoreColor(sectionScore),
                      borderRadius: '4px',
                      transition: 'width 1s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5' }}>{sectionFeedback}</p>
                </div>
              );
            })}
          </div>

          {/* Answers Summary */}
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3>Exam Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Total Questions</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{Object.keys(state.answers).length}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Speaking</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{Object.values(state.answers).filter(a => a.section === 'speaking').length}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Writing</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{Object.values(state.answers).filter(a => a.section === 'writing').length}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Reading</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{Object.values(state.answers).filter(a => a.section === 'reading').length}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Listening</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{Object.values(state.answers).filter(a => a.section === 'listening').length}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleRetakeExam}>
              Retake Exam
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              Print Results
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;