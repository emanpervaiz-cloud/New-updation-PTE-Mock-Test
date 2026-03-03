import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthService } from './services/authService';
import { ExamProvider } from './context/ExamContext';
import LandingPage from './components/sections/LandingPage';
import PracticePage from './components/sections/PracticePage';
import ExamIntroduction from './components/common/ExamIntroduction';
import SpeakingSection from './components/sections/SpeakingSection';
import WritingSection from './components/sections/WritingSection';
import ReadingSection from './components/sections/ReadingSection';
import ListeningSection from './components/sections/ListeningSection';
import ResultsPage from './components/sections/ResultsPage';
import VocabBook from './components/sections/VocabBook';
import Materials from './components/sections/Materials';
import Dashboard from './components/common/Dashboard';
import Login from './components/sections/Login';
import Register from './components/sections/Register';
import TestGemini from './components/TestGemini';
import './styles/App.css';
import './styles/exam-theme.css';
import './styles/responsive.css';

// A wrapper ensuring only authenticated users can access the route
const AuthWrapper = ({ children }) => {
  const isAuth = AuthService.isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    // Save intended location to return after login (optional future enhancement)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <ExamProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-gemini" element={<TestGemini />} />

            {/* Protected Routes */}
            <Route path="/" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
            <Route path="/landing" element={<AuthWrapper><PracticePage /></AuthWrapper>} />
            <Route path="/intro" element={<AuthWrapper><ExamIntroduction /></AuthWrapper>} />
            <Route path="/exam/introduction" element={<AuthWrapper><ExamIntroduction /></AuthWrapper>} />
            <Route path="/exam/speaking" element={<AuthWrapper><SpeakingSection /></AuthWrapper>} />
            <Route path="/exam/writing" element={<AuthWrapper><WritingSection /></AuthWrapper>} />
            <Route path="/exam/reading" element={<AuthWrapper><ReadingSection /></AuthWrapper>} />
            <Route path="/exam/listening" element={<AuthWrapper><ListeningSection /></AuthWrapper>} />
            <Route path="/exam/results" element={<AuthWrapper><ResultsPage /></AuthWrapper>} />
            <Route path="/vocab" element={<AuthWrapper><VocabBook /></AuthWrapper>} />
            <Route path="/materials" element={<AuthWrapper><Materials /></AuthWrapper>} />
          </Routes>
        </div>
      </Router>
    </ExamProvider>
  );
}

export default App;