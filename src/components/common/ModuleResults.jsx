import React, { useEffect, useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import scoringEngine from '../../services/scoringEngine';

const ModuleResults = ({ moduleType, onNavigateNext }) => {
  const { state, setScores } = useExam();
  const navigate = useNavigate();
  const [scores, setLocalScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateModuleScores = async () => {
      try {
        setLoading(true);

        const answers = state.answers || {};
        const moduleAnswers = Object.fromEntries(
          Object.entries(answers).filter(([key, answer]) => answer.section === moduleType)
        );

        // Load AI evaluations from localStorage
        let aiEvaluations = {};
        try {
          const stored = localStorage.getItem('pte_ai_evaluations');
          aiEvaluations = JSON.parse(stored || '{}');
        } catch (e) {
          console.error('Failed to load AI evaluations:', e);
        }

        // Calculate scores for this module only
        const scores = scoringEngine.calculateAllScores(moduleAnswers, aiEvaluations);
        const moduleScore = scores[moduleType]?.scaledScore || 10;

        const getCefrLevel = (score) => {
          if (score >= 85) return 'C2';
          if (score >= 75) return 'C1';
          if (score >= 65) return 'B2';
          if (score >= 55) return 'B1';
          if (score >= 45) return 'A2';
          return 'A1';
        };

        const calculatedScores = {
          [moduleType]: {
            scaledScore: moduleScore,
            cefrLevel: getCefrLevel(moduleScore),
            feedback: `Completed ${Object.keys(moduleAnswers).length} ${moduleType} tasks`
          }
        };

        setLocalScores(calculatedScores);
        setScores(calculatedScores);

      } catch (error) {
        console.error('Error calculating module scores:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateModuleScores();
  }, [moduleType, state.answers]);

  const handleBackToDashboard = () => {
    // Clear AI evaluations for fresh start
    try {
      localStorage.removeItem('pte_ai_evaluations');
    } catch (e) {
      console.error('Failed to clear AI evaluations:', e);
    }
    navigate('/');
  };

  const handleNextModule = () => {
    if (onNavigateNext) {
      onNavigateNext();
    } else {
      // Default navigation options
      const modules = ['listening', 'speaking', 'writing', 'reading'];
      const currentIndex = modules.indexOf(moduleType);
      const nextModule = modules[(currentIndex + 1) % modules.length];
      navigate(`/exam/${nextModule}`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success-color)';
    if (score >= 50) return 'var(--secondary-color)';
    if (score >= 30) return '#fb8c00';
    return '#dc2626';
  };

  if (loading) {
    return (
      <div className="exam-container exam-theme">
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Calculating your {moduleType} score...</h2>
            <p>Please wait while we process your responses.</p>
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
            <p>Please complete the {moduleType} module first.</p>
            <button className="btn btn-primary" onClick={() => navigate(`/exam/${moduleType}`)}>
              Retry {moduleType}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const moduleScore = scores[moduleType]?.scaledScore || 10;
  const cefrLevel = scores[moduleType]?.cefrLevel || 'A1';
  const feedback = scores[moduleType]?.feedback || '';

  return (
    <div className="exam-container exam-theme">
      <header className="exam-header">
        <div className="container">
          <h1 className="exam-title">PTE Academic — {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Results</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {/* Module Score Card */}
          <div className="card" style={{ textAlign: 'center', marginBottom: '24px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px' }}>
              {moduleType === 'speaking' && '🎤 '}
              {moduleType === 'writing' && '✍️ '}
              {moduleType === 'reading' && '📖 '}
              {moduleType === 'listening' && '🎧 '}
              {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Score
            </h2>
            <div style={{
              fontSize: '72px',
              fontWeight: '800',
              color: getScoreColor(moduleScore),
              lineHeight: '1.1',
              margin: '12px 0'
            }}>
              {moduleScore}
              <span style={{ fontSize: '24px', color: '#666' }}>/90</span>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: '20px',
              background: 'var(--primary-color)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '12px'
            }}>
              CEFR Level: {cefrLevel}
            </div>
            <p style={{ color: '#555', marginTop: '12px', fontSize: '15px' }}>{feedback}</p>
          </div>

          {/* Navigation Options */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3>What would you like to do next?</h3>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={handleBackToDashboard}
                style={{ minWidth: '180px' }}
              >
                to Dashboard
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextModule}
                style={{ minWidth: '180px' }}
              >
                ➡ Next Module
              </button>
            </div>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p>You can choose any module from the dashboard to practice</p>
            </div>
          </div>

          {/* Module Summary */}
          <div className="card" style={{ padding: '20px' }}>
            <h3>Module Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Questions Answered</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {Object.values(state.answers || {}).filter(a => a.section === moduleType).length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Time Spent</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {Math.floor((state.timer?.elapsedTime || 0) / 60)}m
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888' }}>Accuracy</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: getScoreColor(moduleScore) }}>
                  {Math.round((moduleScore / 90) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModuleResults;