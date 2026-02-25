import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AiBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 2,
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff', fontSize: 9, fontWeight: 700,
    borderRadius: 4, padding: '1px 5px', marginLeft: 4,
    letterSpacing: '0.3px', verticalAlign: 'middle',
  }}>
    Ai✦
  </span>
);

const ARROW_UP = ({ color = '#22c55e' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: '50%',
    background: `${color}22`, flexShrink: 0,
  }}>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M5 2L2 5M5 2L8 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const ARROW_DOWN = ({ color = '#ef4444' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: '50%',
    background: `${color}22`, flexShrink: 0,
  }}>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2V8M5 8L8 5M5 8L2 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const DASH = ({ color = '#f59e0b' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: '50%',
    background: `${color}22`, flexShrink: 0,
  }}>
    <svg width="10" height="4" viewBox="0 0 10 4" fill="none">
      <rect x="0" y="1.5" width="10" height="1.5" rx="0.75" fill={color} />
    </svg>
  </span>
);

const PRACTICE_DATA = [
  {
    key: 'speaking',
    label: 'Speaking',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    tasks: [
      { label: 'Read Aloud', indicator: 'up', ai: true },
      { label: 'Repeat Sentence', indicator: 'up', ai: true },
      { label: 'Describe Image', indicator: 'dash', ai: true },
      { label: 'Respond to a Situation', indicator: 'dash', ai: true },
      { label: 'Answer Short Question', indicator: 'down', ai: true },
    ],
    route: '/exam/speaking',
  },
  {
    key: 'writing',
    label: 'Writing',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    tasks: [
      { label: 'Summarize Written Text', indicator: 'dash', ai: true },
      { label: 'Write an Email', indicator: 'dash', ai: true },
    ],
    route: '/exam/writing',
  },
  {
    key: 'reading',
    label: 'Reading',
    color: '#059669',
    bgColor: '#ecfdf5',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    tasks: [
      { label: 'Reading & Writing: Fill In The Blanks', indicator: 'up', ai: false },
      { label: 'Multiple Choice, Choose Multiple Answer', indicator: 'down', ai: false },
      { label: 'Re-Order Paragraph', indicator: 'dash', ai: false },
      { label: 'Reading: Fill In The Blanks', indicator: 'dash', ai: false },
      { label: 'Multiple Choice, Choose Single Answer', indicator: 'down', ai: false },
    ],
    route: '/exam/reading',
  },
  {
    key: 'listening',
    label: 'Listening',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    tasks: [
      { label: 'Summarize Spoken Text', indicator: 'dash', ai: true },
      { label: 'Listening: Multiple Choice, Choose Multiple Answer', indicator: 'down', ai: false },
      { label: 'Listening: Fill In The Blanks', indicator: 'up', ai: false },
      { label: 'Listening: Multiple Choice, Choose Single Answer', indicator: 'down', ai: false },
      { label: 'Select Missing Word', indicator: 'dash', ai: false },
      { label: 'Highlight Incorrect Words', indicator: 'up', ai: false },
      { label: 'Write From Dictation', indicator: 'up', ai: true },
    ],
    route: '/exam/listening',
  },
];

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/' },
  { icon: '📝', label: 'Practice', path: '/landing', active: true },
  { icon: '📋', label: 'Section Test', path: '/exam/speaking' },
  { icon: '🎓', label: 'Mock Test', path: '/intro' },
  { icon: '📚', label: 'Vocab Book', path: '/vocab' },
  { icon: '📁', label: 'Materials', path: '/materials' },
];

const PracticePage = () => {
  const navigate = useNavigate();
  const [hoveredTask, setHoveredTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderIndicator = (type) => {
    if (type === 'up') return <ARROW_UP />;
    if (type === 'down') return <ARROW_DOWN />;
    return <DASH />;
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f5f7fb',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
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
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                background: item.active ? 'linear-gradient(90deg, #ede7f6, #f3e5f5)' : 'transparent',
                borderRight: item.active ? '3px solid #673ab7' : '3px solid transparent',
                color: item.active ? '#512da8' : '#5a6270',
                fontWeight: item.active ? 600 : 400,
                fontSize: 14, transition: 'all 0.15s',
                borderRadius: '0 8px 8px 0', margin: '1px 0',
              }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
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

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e8ecf4',
          padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
          gap: 16, position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: '4px 12px', borderRadius: 6 }}
            >
              Dashboard
            </button>
            <span style={{ color: '#ccc' }}>/</span>
            <span style={{ background: '#ede7f6', color: '#512da8', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
              Practice
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #673ab7, #9c27b0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>U</div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Page title */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#111827' }}>Practice</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Select a question type to start practicing
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ARROW_UP /> <span>High frequency</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DASH /> <span>Medium frequency</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ARROW_DOWN /> <span>Low frequency</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AiBadge /> <span>AI evaluated</span>
              </span>
            </div>
          </div>

          {/* 4-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {PRACTICE_DATA.map((section) => (
              <div
                key={section.key}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
              >
                {/* Section header */}
                <div style={{
                  padding: '16px 18px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: section.bgColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {section.icon}
                  </div>
                  <h3 style={{
                    margin: 0, fontSize: 15, fontWeight: 700,
                    color: '#111827',
                  }}>{section.label}</h3>
                </div>

                {/* Task list */}
                <div style={{ padding: '8px 0' }}>
                  {section.tasks.map((task, idx) => {
                    const taskId = `${section.key}-${idx}`;
                    const isHovered = hoveredTask === taskId;
                    return (
                      <div
                        key={idx}
                        id={`practice-${section.key}-${idx}`}
                        onClick={() => navigate(section.route)}
                        onMouseEnter={() => setHoveredTask(taskId)}
                        onMouseLeave={() => setHoveredTask(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 18px',
                          cursor: 'pointer',
                          background: isHovered ? '#f8f9fc' : 'transparent',
                          transition: 'background 0.15s',
                          borderBottom: idx < section.tasks.length - 1 ? '1px solid #f8f9fc' : 'none',
                        }}
                      >
                        {renderIndicator(task.indicator)}
                        <span style={{
                          fontSize: 13, color: isHovered ? section.color : '#374151',
                          fontWeight: isHovered ? 500 : 400,
                          flex: 1, lineHeight: 1.4,
                          transition: 'color 0.15s',
                        }}>
                          {task.label}
                        </span>
                        {task.ai && <AiBadge />}
                      </div>
                    );
                  })}
                </div>

                {/* Section footer button */}
                <div style={{ padding: '10px 14px 14px' }}>
                  <button
                    onClick={() => navigate(section.route)}
                    style={{
                      width: '100%', padding: '8px 0',
                      background: section.bgColor,
                      color: section.color,
                      border: `1px solid ${section.color}33`,
                      borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = section.color;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = section.bgColor;
                      e.currentTarget.style.color = section.color;
                    }}
                  >
                    Start {section.label} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Responsive note for small screens */}
          <style>{`
            @media (max-width: 1024px) {
              .practice-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 640px) {
              .practice-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
