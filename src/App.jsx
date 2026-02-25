import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './styles/App.css';
import './styles/exam-theme.css';
import './styles/responsive.css';

function App() {
  return (
    <ExamProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/landing" element={<PracticePage />} />
            <Route path="/intro" element={<ExamIntroduction />} />
            <Route path="/exam/introduction" element={<ExamIntroduction />} />
            <Route path="/exam/speaking" element={<SpeakingSection />} />
            <Route path="/exam/writing" element={<WritingSection />} />
            <Route path="/exam/reading" element={<ReadingSection />} />
            <Route path="/exam/listening" element={<ListeningSection />} />
            <Route path="/exam/results" element={<ResultsPage />} />
            <Route path="/vocab" element={<VocabBook />} />
            <Route path="/materials" element={<Materials />} />
          </Routes>
        </div>
      </Router>
    </ExamProvider>
  );
}

export default App;