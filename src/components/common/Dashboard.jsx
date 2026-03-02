import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { AuthService } from '../../services/authService';
import AuthModal from './AuthModal';
import ModuleCard from '../dashboard/ModuleCard';
import SidebarOverview from '../dashboard/SidebarOverview';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/', active: true },
  { icon: '📝', label: 'Practice', path: '/landing' },
  { icon: '📋', label: 'Section Test', path: '/exam/speaking' },
  { icon: '🎓', label: 'Mock Test', path: '/intro' },
  { icon: '📚', label: 'Vocab Book', path: '/vocab' },
  { icon: '📁', label: 'Materials', path: '/materials' }
];

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('pteTestHistory') || '[]');
  } catch {
    return [];
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useExam();
  const [history, setHistory] = useState([]);
  const [targetScore, setTargetScore] = useState(65);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(65);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setHistory(getHistory());
    setUser(AuthService.getUser());
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, t) => s + (t.overall || 0), 0) / history.length)
    : 0;
  const lastScore = history.length > 0 ? history[history.length - 1].overall : null;

  const handleStartPractice = (section) => navigate(`/exam/${section}`);
  const handleStartTest = () => navigate('/intro');

  // Define modules dynamically based on user history
  const modules = [
    {
      module_id: 'mod_listening', module_name: 'Listening', icon: '🎧',
      color: '#fce7f3', accent: '#db2777', border: '#fbcfe8',
      total_items: 4403,
      practiced: history.reduce((sum, t) => sum + (t['listeningAnswered'] || 0), 0),
      route: 'listening'
    },
    {
      module_id: 'mod_speaking', module_name: 'Speaking', icon: '🎤',
      color: '#e0f2fe', accent: '#0284c7', border: '#bae6fd',
      total_items: 7096,
      practiced: history.reduce((sum, t) => sum + (t['speakingAnswered'] || 0), 0),
      route: 'speaking'
    },
    {
      module_id: 'mod_writing', module_name: 'Writing', icon: '✍️',
      color: '#fef3c7', accent: '#d97706', border: '#fde68a',
      total_items: 473,
      practiced: history.reduce((sum, t) => sum + (t['writingAnswered'] || 0), 0),
      route: 'writing'
    },
    {
      module_id: 'mod_reading', module_name: 'Reading', icon: '📖',
      color: '#dcfce7', accent: '#16a34a', border: '#bbf7d0',
      total_items: 2766,
      practiced: history.reduce((sum, t) => sum + (t['readingAnswered'] || 0), 0),
      route: 'reading'
    }
  ].map(mod => {
    const progress_percentage = (mod.practiced / mod.total_items) * 100;
    // Calculate average score for this specific module from history
    const modScores = history.filter(h => h[mod.route] !== undefined).map(h => h[mod.route]);
    const average_score = modScores.length > 0 ? Math.round(modScores.reduce((a, b) => a + b, 0) / modScores.length) : 0;

    return { ...mod, progress_percentage, average_score };
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>PTE</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.5px' }}>Master</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 20px', cursor: 'pointer', position: 'relative',
                background: item.active ? '#e0e7ff' : 'transparent',
                borderRight: item.active ? '4px solid #4f46e5' : '4px solid transparent',
                color: item.active ? '#4338ca' : '#64748b',
                fontWeight: item.active ? 600 : 500,
                fontSize: 15,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; } }}
              onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, background: '#ef4444',
                      color: '#fff', borderRadius: 4, padding: '2px 6px', fontWeight: 600,
                    }}>{item.badge}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            padding: '16px 20px', cursor: 'pointer', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 14, fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#475569'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>
          {sidebarOpen && <span>Collapse</span>}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          background: '#ffffff', borderBottom: '1px solid #e2e8f0',
          padding: '0 32px', height: 64, display: 'flex', alignItems: 'center',
          gap: 16, position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', borderRadius: '6px', padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>PTE Academic</span>
            <button
              onClick={() => navigate('/landing')}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >Practice Library ▾</button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Student</div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#475569'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: '#fff', color: '#ef4444', fontWeight: 600, cursor: 'pointer',
                    fontSize: 13, transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Page body */}
        <div style={{ flex: 1, padding: '32px', display: 'flex', gap: 24, overflowY: 'auto' }}>

          {/* Main Module Grid Column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Greeting Section */}
            <div>
              <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                Welcome back, {user ? user.name : 'Student'} 👋
              </h1>
              <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>
                Track your progress, practice modules, and achieve your target score of {targetScore}.
              </p>
            </div>

            {/* Modules Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Practice Modules</h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {modules.map(mod => (
                  <ModuleCard
                    key={mod.module_id}
                    module={mod}
                    onStartPractice={() => handleStartPractice(mod.route)}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Overview */}
          <SidebarOverview
            history={history}
            targetScore={targetScore}
            avgScore={avgScore}
            lastScore={lastScore}
            onStartTest={handleStartTest}
            onShowTargetModal={() => { setTempTarget(targetScore); setShowTargetModal(true); }}
          />

        </div>
      </div>

      {/* Target Score Modal */}
      {showTargetModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px', padding: '32px', width: '480px', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>🎯 Set Your Goal</h3>
            
            {/* Current Target Display */}
            <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: 800, color: '#4f46e5', marginBottom: '8px' }}>
              {tempTarget}
            </div>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Target PTE Score</p>

            <input
              type="range" min={30} max={90} step={1}
              value={tempTarget}
              onChange={e => setTempTarget(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '24px', accentColor: '#4f46e5' }}
            />

            {/* PTE Band Levels Reference */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#374151' }}>📊 PTE Band Levels & Requirements</h4>
              
              {[
                { 
                  band: 'PTE 90 (Perfect)', 
                  range: '90', 
                  color: '#059669',
                  requirements: [
                    'Speaking: Native-like fluency & pronunciation',
                    'Writing: Complex structures, academic vocabulary',
                    'Reading: Advanced inference & vocabulary',
                    'Listening: Complete comprehension of academic content'
                  ]
                },
                { 
                  band: 'PTE 79+ (Band 8)', 
                  range: '79-89', 
                  color: '#0891b2',
                  requirements: [
                    'Speaking: Fluent with minor hesitations',
                    'Writing: Varied sentence structures, precise vocabulary',
                    'Reading: Strong comprehension of complex texts',
                    'Listening: Understand main ideas and most details'
                  ]
                },
                { 
                  band: 'PTE 65+ (Band 7)', 
                  range: '65-78', 
                  color: '#7c3aed',
                  requirements: [
                    'Speaking: Clear communication with some fluency issues',
                    'Writing: Good grammar range, adequate vocabulary',
                    'Reading: Good understanding of academic texts',
                    'Listening: Understand main ideas and key details'
                  ]
                },
                { 
                  band: 'PTE 50+ (Band 6)', 
                  range: '50-64', 
                  color: '#d97706',
                  requirements: [
                    'Speaking: Basic communication, noticeable accent',
                    'Writing: Simple structures, some grammatical errors',
                    'Reading: Understand main ideas with some difficulty',
                    'Listening: Catch main ideas, miss some details'
                  ]
                },
                { 
                  band: 'PTE 36+ (Band 5)', 
                  range: '36-49', 
                  color: '#dc2626',
                  requirements: [
                    'Speaking: Limited vocabulary, frequent pauses',
                    'Writing: Basic sentences, frequent errors',
                    'Reading: Limited comprehension of complex texts',
                    'Listening: Understand only basic information'
                  ]
                }
              ].map((level, idx) => (
                <div 
                  key={idx}
                  style={{
                    border: `2px solid ${tempTarget >= parseInt(level.range) ? level.color : '#e5e7eb'}`,
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    marginBottom: '12px',
                    background: tempTarget >= parseInt(level.range) ? `${level.color}08` : '#f9fafb',
                    opacity: tempTarget >= parseInt(level.range) ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#fff',
                      background: level.color,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {level.band}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Score: {level.range}</span>
                    {tempTarget >= parseInt(level.range) && tempTarget < (idx === 0 ? 91 : parseInt(['90','79','65','50','36'][idx-1])) && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: level.color, fontWeight: 600 }}>✓ Your Target</span>
                    )}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#4b5563', lineHeight: '1.6' }}>
                    {level.requirements.map((req, ridx) => (
                      <li key={ridx}>{req}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTargetModal(false)}
                style={{
                  flex: 1, padding: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => { setTargetScore(tempTarget); setShowTargetModal(false); }}
                style={{
                  flex: 1, padding: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}
      {authOpen && <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />}
    </div>
  );
};

export default Dashboard;