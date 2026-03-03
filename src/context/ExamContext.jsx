import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the exam
const initialState = {
  user: null,
  currentSection: 'introduction',
  currentQuestionIndex: 0,
  answers: {},
  timer: null,
  examStarted: false,
  examCompleted: false,
  examDurationMinutes: 80, // Total: Listening(15) + Speaking(20) + Writing(10) + Reading(35) = 80 minutes
  useAlternatePaper: false,
  examMode: 'practice', // 'practice' or 'mock'
  mockTestSections: ['listening', 'speaking', 'writing', 'reading'], // Order for mock test
  currentMockSectionIndex: 0,
  scores: {
    speaking: null,
    writing: null,
    reading: null,
    listening: null,
    overall: null
  }
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_CURRENT_SECTION: 'SET_CURRENT_SECTION',
  SET_CURRENT_QUESTION_INDEX: 'SET_CURRENT_QUESTION_INDEX',
  SAVE_ANSWER: 'SAVE_ANSWER',
  SET_TIMER: 'SET_TIMER',
  START_EXAM: 'START_EXAM',
  COMPLETE_EXAM: 'COMPLETE_EXAM',
  SET_SCORES: 'SET_SCORES',
  RESET_EXAM: 'RESET_EXAM',
  SET_EXAM_MODE: 'SET_EXAM_MODE',
  SET_CURRENT_MOCK_SECTION_INDEX: 'SET_CURRENT_MOCK_SECTION_INDEX'
};

actionTypes.SET_USE_ALTERNATE = 'SET_USE_ALTERNATE';

// Reducer function
const examReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
    case actionTypes.SET_CURRENT_SECTION:
      return {
        ...state,
        currentSection: action.payload
      };
    case actionTypes.SET_CURRENT_QUESTION_INDEX:
      return {
        ...state,
        currentQuestionIndex: action.payload
      };
    case actionTypes.SAVE_ANSWER:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer
        }
      };
    case actionTypes.SET_TIMER:
      return {
        ...state,
        timer: action.payload
      };
    case actionTypes.SET_EXAM_MODE:
      return {
        ...state,
        examMode: action.payload
      };
    case actionTypes.SET_CURRENT_MOCK_SECTION_INDEX:
      return {
        ...state,
        currentMockSectionIndex: action.payload
      };
    case actionTypes.SET_USE_ALTERNATE:
      return {
        ...state,
        useAlternatePaper: !!action.payload
      };
    case actionTypes.START_EXAM:
      return {
        ...state,
        examStarted: true
      };
    case actionTypes.COMPLETE_EXAM:
      return {
        ...state,
        examCompleted: true
      };
    case actionTypes.SET_SCORES:
      return {
        ...state,
        scores: {
          ...state.scores,
          ...action.payload
        }
      };
    case actionTypes.RESET_EXAM:
      return initialState;
    default:
      return state;
  }
};

// Create context
const ExamContext = createContext();

// Provider component
export const ExamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(examReducer, initialState);

  // On mount, populate user from localStorage if available
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('pte_user');
      if (raw) {
        const user = JSON.parse(raw);
        dispatch({ type: actionTypes.SET_USER, payload: user });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Actions
  const setUser = (user) => {
    dispatch({ type: actionTypes.SET_USER, payload: user });
  };

  const setCurrentSection = (section) => {
    dispatch({ type: actionTypes.SET_CURRENT_SECTION, payload: section });
  };

  const setCurrentQuestionIndex = (index) => {
    dispatch({ type: actionTypes.SET_CURRENT_QUESTION_INDEX, payload: index });
  };

  const saveAnswer = (questionId, answer) => {
    dispatch({ 
      type: actionTypes.SAVE_ANSWER, 
      payload: { questionId, answer } 
    });
  };

  const setTimer = (timer) => {
    dispatch({ type: actionTypes.SET_TIMER, payload: timer });
  };

  const startExam = () => {
    dispatch({ type: actionTypes.START_EXAM });
    // If a logged-in user has taken a test before, mark alternate paper preference
    if (state.user && state.user.lastTestTaken) {
      dispatch({ type: actionTypes.SET_USE_ALTERNATE, payload: true });
    }
  };

  const completeExam = () => {
    dispatch({ type: actionTypes.COMPLETE_EXAM });
  };

  const setScores = (scores) => {
    dispatch({ type: actionTypes.SET_SCORES, payload: scores });
  };

  const setExamMode = (mode) => {
    dispatch({ type: actionTypes.SET_EXAM_MODE, payload: mode });
  };

  const setCurrentMockSectionIndex = (index) => {
    dispatch({ type: actionTypes.SET_CURRENT_MOCK_SECTION_INDEX, payload: index });
  };

  const resetExam = () => {
    dispatch({ type: actionTypes.RESET_EXAM });
  };

  // Lightweight authentication helpers (local only)
  const login = (user) => {
    const u = { ...user, lastLoginAt: new Date().toISOString(), lastTestTaken: user.lastTestTaken || null };
    dispatch({ type: actionTypes.SET_USER, payload: u });
    try { localStorage.setItem('pte_user', JSON.stringify(u)); } catch {}
  };

  const logout = () => {
    dispatch({ type: actionTypes.SET_USER, payload: null });
    try { localStorage.removeItem('pte_user'); } catch {}
  };

  const value = {
    state,
    setUser,
    setCurrentSection,
    setCurrentQuestionIndex,
    saveAnswer,
    setTimer,
    startExam,
    completeExam,
    setScores,
    resetExam,
    setExamMode,
    setCurrentMockSectionIndex,
    login,
    logout
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

// Custom hook to use the exam context
export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};