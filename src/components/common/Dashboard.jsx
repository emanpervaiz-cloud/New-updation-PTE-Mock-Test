import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import AuthModal from './AuthModal';

const SECTIONS = [
  { key: 'speaking', label: 'Speaking', icon: '🎤', color: '#e8f4fd', accent: '#2196f3', border: '#90caf9', total: 7096 },
  { key: 'writing', label: 'Writing', icon: '✍️', color: '#fffde7', accent: '#f9a825', border: '#ffe082', total: 473 },
  { key: 'reading', label: 'Reading', icon: '📖', color: '#e8f5e9', accent: '#43a047', border: '#a5d6a7', total: 2766 },
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#fce4ec', accent: '#e91e63', border: '#f48fb1', total: 4403 }
];

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
  const { state, login } = useExam();
  const [activeTab, setActiveTab] = useState('speaking');
  const [history, setHistory] = useState([]);
  const [targetScore, setTargetScore] = useState(65);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(65);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, t) => s + (t.overall || 0), 0) / history.length)
      : 0;

  const lastScore = history.length > 0 ? history[history.length - 1].overall : null;

  const recentHistory = [...history].reverse().slice(0, 5);

  const handleStartPractice = () => navigate('/landing');
  const handleStartTest = () => navigate('/intro');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        background: '#fff',
        borderRight: '1px solid #e8ecf4',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #ff8a65, #ff6f00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>A</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 16, color: '#3e2723', letterSpacing: '-0.5px' }}>Migration</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer', position: 'relative',
                background: item.active ? 'linear-gradient(90deg, #ede7f6, #f3e5f5)' : 'transparent',
                borderRight: item.active ? '3px solid #673ab7' : '3px solid transparent',
                color: item.active ? '#512da8' : '#5a6270',
                fontWeight: item.active ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
                borderRadius: '0 8px 8px 0',
                margin: '1px 0',
              }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, background: '#ff5722',
                      color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 600,
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
            padding: '12px 16px', cursor: 'pointer', borderTop: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', gap: 8, color: '#9e9e9e', fontSize: 13,
          }}
        >
          <span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>
          {sidebarOpen && <span>Collapse</span>}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e8ecf4',
          padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
          gap: 16, position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: '#fff3e0', color: '#bf360c', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>Migration</span>
            <button
              onClick={handleStartPractice}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: '4px 12px', borderRadius: 6 }}
            >Practice ▾</button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {state.user ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#444' }}>Hi, <strong>{state.user.name || state.user.email}</strong></span>
                <button onClick={() => setAuthOpen(true)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>Account</button>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg,#ff6f00,#ff8a65)', color: '#fff', border: 'none' }}>Sign in</button>
            )}
          </div>
        </header>

        {/* Page body */}
        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', gap: 20 }}>
          {/* Center column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>



            {/* Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #4527a0 0%, #7b1fa2 50%, #5c6bc0 100%)',
              borderRadius: 16, padding: '28px 32px',
              boxShadow: '0 8px 32px rgba(69,39,160,0.35)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* decorative circles */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: 200, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 6px' }}>Welcome back! 👋</p>
                  <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>
                    Let's Target <span style={{ color: '#ffd740', fontSize: 36 }}>{targetScore}+</span> Score
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '8px 0 0' }}>Start strong and stay consistent!</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '2px 0 0' }}>Practice regularly and watch your skills improve.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setTempTarget(targetScore); setShowTargetModal(true); }}
                      style={{
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                        color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                      🎯 Set Target Score
                    </button>
                    <button
                      style={{
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                        color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                      🎙 Check Microphone
                    </button>
                  </div>
                  <button
                    onClick={handleStartPractice}
                    style={{
                      background: '#ffd740', color: '#3d1a78',
                      border: 'none', borderRadius: 10, padding: '12px 24px',
                      fontWeight: 700, fontSize: 15, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(255,215,64,0.4)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    Start Practice Now →
                  </button>
                </div>
              </div>
            </div>

            {/* Practice Section (cards) */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 6px 20px rgba(15,15,15,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Practice</h3>
                <button onClick={() => { localStorage.removeItem('pteTestHistory'); setHistory([]); }} style={{ background: 'none', border: 'none', color: '#0b5fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Reset History</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {SECTIONS.map((sec) => {
                  const practiced = history.reduce((sum, t) => sum + (t[sec.key + 'Answered'] || 0), 0);
                  const pct = Math.round((practiced / sec.total) * 100);
                  return (
                    <div key={sec.key} onClick={() => navigate('/exam/' + sec.key)} style={{ background: '#fff', borderRadius: 10, padding: 16, cursor: 'pointer', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{sec.icon}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{sec.label}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{sec.total.toLocaleString()} items</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#0b5fff', fontWeight: 700 }}>{pct}%</div>
                      </div>

                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 0)}%`, height: '100%', background: sec.accent }} />
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Practiced: {practiced}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section Test / Score Chart */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#222', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📊 Section Test
                </h3>
                <span style={{ fontSize: 12, color: '#888' }}>
                  Test Completed: <b>{history.length}</b>
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #f0f0f0' }}>
                {['speaking', 'writing', 'reading', 'listening'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: 'none', background: 'none', padding: '8px 18px',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      color: activeTab === tab ? '#3949ab' : '#888',
                      borderBottom: activeTab === tab ? '2px solid #3949ab' : '2px solid transparent',
                      marginBottom: -2, textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Chart / History for active tab */}
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
                  <p style={{ margin: 0, fontSize: 14 }}>No test data yet. Complete your first mock test to see scores here!</p>
                  <button
                    onClick={handleStartTest}
                    style={{
                      marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg, #3949ab, #5c6bc0)',
                      color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                    }}>
                    Take Mock Test
                  </button>
                </div>
              ) : (
                <div>
                  {/* Score bar chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {/* Y axis labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingRight: 8 }}>
                      {[90, 70, 50, 30, 10].map(v => (
                        <span key={v} style={{ fontSize: 10, color: '#bbb', lineHeight: 1 }}>{v}</span>
                      ))}
                    </div>
                    {recentHistory.map((t, i) => {
                      const sScore = t[activeTab] || 0;
                      const barH = Math.max(4, ((sScore - 10) / 80) * 100);
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#3949ab' }}>{sScore}</span>
                          <div style={{
                            width: '60%', borderRadius: '4px 4px 0 0',
                            background: 'linear-gradient(180deg, #5c6bc0, #3949ab)',
                            height: `${barH}%`,
                            transition: 'height 0.8s ease',
                          }} />
                          <span style={{ fontSize: 10, color: '#aaa' }}>#{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#666' }}>
                    <span>📊 Avg <b style={{ color: '#3949ab' }}>{avgScore}</b></span>
                    {lastScore && <span>🏆 Last <b style={{ color: '#43a047' }}>{lastScore}</b></span>}
                    <span>🎯 Target <b style={{ color: '#f9a825' }}>{targetScore}+</b></span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick Start CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #3949ab, #7c4dff)',
              borderRadius: 14, padding: '20px',
              boxShadow: '0 4px 16px rgba(57,73,171,0.25)',
            }}>
              <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>🚀 Ready to Test?</h4>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: '0 0 14px', lineHeight: 1.5 }}>
                Take a full mock test and get your estimated PTE score instantly.
              </p>
              <button
                onClick={handleStartTest}
                style={{
                  width: '100%', background: '#ffd740', color: '#3d1a78',
                  border: 'none', borderRadius: 8, padding: '10px',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                Start Mock Test →
              </button>
            </div>

            {/* Score Overview */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#333' }}>📈 Your Score Overview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Tests Taken', value: history.length, color: '#3949ab' },
                  { label: 'Avg Score', value: avgScore || '—', color: '#43a047' },
                  { label: 'Best Score', value: history.length ? Math.max(...history.map(t => t.overall)) : '—', color: '#f9a825' },
                  { label: 'Target', value: `${targetScore}+`, color: '#e91e63' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: '#f8f9fe', borderRadius: 10, padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practiced History */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1,
            }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#333' }}>🕐 Your Practiced History</h4>

              {recentHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#ccc' }}>
                  <div style={{ fontSize: 32 }}>📭</div>
                  <p style={{ fontSize: 12, marginTop: 8 }}>No history yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentHistory.map((test, i) => (
                    <div key={i} style={{
                      border: '1px solid #ede7f6', borderRadius: 10, padding: '10px 12px',
                      background: '#fafaff',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#5c6bc0', textTransform: 'uppercase' }}>
                          {test.date}
                        </span>
                        <span style={{ fontSize: 10, color: '#888' }}>Total Ques: {test.totalAnswered || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>Mock Test #{history.length - i}</span>
                        <span style={{
                          background: test.overall >= 65 ? '#e8f5e9' : '#fff3e0',
                          color: test.overall >= 65 ? '#2e7d32' : '#e65100',
                          borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700,
                        }}>{test.overall}/90</span>
                      </div>
                      {/* Mini section scores */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {['speaking', 'writing', 'reading', 'listening'].map(s => (
                          <span key={s} style={{ fontSize: 10, background: '#ede7f6', color: '#512da8', borderRadius: 4, padding: '1px 6px' }}>
                            {s.slice(0, 2).toUpperCase()}: {test[s] || '—'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {history.length > 5 && (
                    <button style={{ background: 'none', border: 'none', color: '#5c6bc0', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                      Show Complete History →
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Target Score Modal */}
      {showTargetModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: 32, width: 320,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#222' }}>🎯 Set Target Score</h3>
            <input
              type="range" min={30} max={90} step={5}
              value={tempTarget}
              onChange={e => setTempTarget(Number(e.target.value))}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <div style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, color: '#3949ab', marginBottom: 20 }}>
              {tempTarget}+
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowTargetModal(false)}
                style={{
                  flex: 1, padding: '10px', border: '1px solid #e0e0e0', background: '#f5f5f5',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                }}>Cancel</button>
              <button
                onClick={() => { setTargetScore(tempTarget); setShowTargetModal(false); }}
                style={{
                  flex: 1, padding: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #3949ab, #5c6bc0)',
                  color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {authOpen && <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />}
    </div>
  );
};

export default Dashboard;