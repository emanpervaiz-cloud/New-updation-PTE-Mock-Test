import React, { useState, useRef, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import audioService from '../../services/audioService';
import ScoreDisplay from '../common/ScoreDisplay';
import AIEvaluationService from '../../services/aiEvaluationService';

const ReadAloud = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const recordingInterval = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const initMic = async () => {
      const ok = await audioService.initRecording();
      setMicReady(ok);
      if (!ok) setMicError(true);
    };
    initMic();

    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      audioService.cancelRecording();
    };
  }, []);

  const startRecording = async () => {
    if (!micReady) {
      const ok = await audioService.initRecording();
      if (!ok) { setMicError(true); return; }
      setMicReady(true);
    }

    const started = audioService.startRecording();
    if (!started) return;

    setIsRecording(true);
    setRecordingTime(0);

    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    timeoutRef.current = setTimeout(() => stopRecording(), 50000);
  };

  const stopRecording = async () => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const blob = await audioService.stopRecording();
    setIsRecording(false);
    setHasRecorded(true);
    setAudioBlob(blob);

    saveAnswer(question.id, {
      questionId: question.id,
      section: 'speaking',
      type: 'read_aloud',
      response: blob,
      meta: { duration: recordingTime, hasAudio: !!blob, blobSize: blob?.size || 0 }
    });
  };

  const handleGetScore = async () => {
    setEvalLoading(true);
    setEvalError(null);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
      const apiUrl = import.meta.env.VITE_OPENROUTER_API_KEY
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const provider = import.meta.env.VITE_OPENROUTER_API_KEY ? 'openrouter' : 'openai';

      if (!apiKey) {
        setEvalError('No API key configured. Please set VITE_OPENROUTER_API_KEY in your .env file.');
        setEvalLoading(false);
        return;
      }

      const evaluator = new AIEvaluationService(apiKey, apiUrl, provider);
      const result = await evaluator.evaluateSpeaking(
        question.prompt || question.instruction || 'Read the following text aloud',
        audioBlob || `[Audio response recorded - Duration: ${recordingTime}s, Text to read: "${question.prompt || ''}"]`,
        'read_aloud'
      );
      setEvaluation(result);
      
      // Store AI evaluation in localStorage for ResultsPage
      try {
        const aiEvaluations = JSON.parse(localStorage.getItem('pte_ai_evaluations') || '{}');
        aiEvaluations[question.id] = result;
        localStorage.setItem('pte_ai_evaluations', JSON.stringify(aiEvaluations));
        console.log('AI evaluation saved for question:', question.id);
      } catch (storageError) {
        console.error('Failed to save AI evaluation:', storageError);
      }
    } catch (err) {
      setEvalError(err.message || 'Failed to evaluate. Please try again.');
    }
    setEvalLoading(false);
  };

  const handleNext = async () => {
    if (isRecording) {
      await stopRecording();
    }
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '32px',
        border: '1px solid #eef2f6',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 16, left: 24, fontSize: 12, fontWeight: 700, color: '#673ab7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📖 Read Aloud
        </div>
        <div style={{ marginTop: 20, fontSize: 20, lineHeight: 1.6, color: '#1a1f36', fontWeight: 500 }}>
          {question.prompt}
        </div>
      </div>

      {micError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500 }}>
          ⚠️ Microphone access denied. Please allow microphone permission and refresh.
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px 32px', border: '1px solid #eef2f6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={recordingTime >= 50 || micError}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: isRecording ? '#dc2626' : (hasRecorded ? '#10b981' : '#673ab7'),
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: isRecording ? '0 0 0 6px rgba(220, 38, 38, 0.15)' : '0 4px 12px rgba(103, 58, 183, 0.2)',
              transition: 'all 0.3s ease',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isRecording ? '⏹' : (hasRecorded ? '✓' : '🎤')}
          </button>

          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>
              {isRecording ? 'Recording...' : (hasRecorded ? 'Recorded Successfully' : 'Ready to record')}
            </div>
            <div style={{ fontSize: 14, color: '#5a6270' }}>
              {isRecording ? `Time elapsed: ${recordingTime}s / 50s` : (hasRecorded ? 'Get your score or continue to the next question' : 'Click the microphone to start reading')}
            </div>
          </div>
        </div>

        {isRecording && (
          <div style={{
            height: 10, width: 140, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: '#dc2626', width: `${(recordingTime / 50) * 100}%`,
              transition: 'width 1s linear'
            }} />
          </div>
        )}
      </div>

      {/* Score Display */}
      <ScoreDisplay
        evaluation={evaluation}
        loading={evalLoading}
        error={evalError}
        onGetScore={handleGetScore}
        hasResponse={hasRecorded}
        questionType="speaking"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          onClick={handleNext}
          style={{
            padding: '12px 32px', borderRadius: 12,
            background: isRecording ? '#fff' : 'linear-gradient(135deg, #673ab7, #5e35b1)',
            color: isRecording ? '#673ab7' : '#fff',
            border: isRecording ? '1.5px solid #673ab7' : 'none',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isRecording ? 'none' : '0 4px 12px rgba(103, 58, 183, 0.2)'
          }}
          onMouseEnter={e => { if (!isRecording) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isRecording ? 'Stop & Next' : 'Continue'} →
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}</style>
    </div>
  );
};

export default ReadAloud;