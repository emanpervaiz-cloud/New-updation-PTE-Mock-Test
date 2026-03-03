import React, { useState, useRef, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import audioService from '../../services/audioService';
import ScoreDisplay from '../common/ScoreDisplay';
import AIEvaluationService from '../../services/aiEvaluationService';

const DescribeImage = ({ question, onNext }) => {
  const { saveAnswer } = useExam();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [prepTime, setPrepTime] = useState(25);
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const recordingInterval = useRef(null);
  const prepInterval = useRef(null);
  const timeoutRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const initMic = async () => {
      const ok = await audioService.initRecording();
      setMicReady(ok);
      if (!ok) setMicError(true);
    };
    initMic();

    prepInterval.current = setInterval(() => {
      setPrepTime(prev => {
        if (prev <= 1) {
          clearInterval(prepInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (prepInterval.current) clearInterval(prepInterval.current);
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
    isRecordingRef.current = true;
    setRecordingTime(0);

    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    timeoutRef.current = setTimeout(() => stopRecording(), 40000);
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const blob = await audioService.stopRecording();
    setIsRecording(false);
    setHasRecorded(true);
    setAudioBlob(blob);

    saveAnswer(question.id, {
      questionId: question.id,
      section: 'speaking',
      type: 'describe_image',
      response: blob,
      meta: { duration: recordingTime, hasAudio: !!blob, blobSize: blob?.size || 0, prepTimeUsed: 25 - prepTime }
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
        question.instruction || 'Describe the image in detail',
        audioBlob || `[Audio response recorded - Duration: ${recordingTime}s, Task: Describe Image, Prep time used: ${25 - prepTime}s]`,
        'describe_image'
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
    if (isRecording) await stopRecording();
    if (prepInterval.current) clearInterval(prepInterval.current);
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(15,15,15,0.03)' }}>
        <div style={{ padding: '20px 24px', background: '#f8f9fe', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1f36' }}>📊 Observation Task</h4>
          {!isRecording && !hasRecorded && prepTime > 0 && (
            <div style={{
              background: '#fff3e0', color: '#e65100', padding: '6px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
            }}>
              ⏳ Prep: {prepTime}s
            </div>
          )}
        </div>

        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{
            maxWidth: '100%',
            minHeight: 300,
            background: '#fafafa',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px dashed #e2e8f0'
          }}>
            {question.imageUrl ? (
              <img
                src={question.imageUrl}
                alt="Test image to describe"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=Premium+Chart+Placeholder';
                }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: 14 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
                No image provided
              </div>
            )}
          </div>
        </div>
      </div>

      {micError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500 }}>
          ⚠️ Microphone access denied. Please check your browser permissions.
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px 32px', border: '1px solid #eef2f6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => {
              if (prepTime > 0 && !isRecording && !hasRecorded) {
                clearInterval(prepInterval.current);
                setPrepTime(0);
                startRecording();
              } else if (isRecording) {
                stopRecording();
              } else if (!hasRecorded) {
                startRecording();
              }
            }}
            disabled={recordingTime >= 40 || micError}
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
              {isRecording ? 'Recording in progress...' : (hasRecorded ? 'Recording complete!' : (prepTime > 0 ? 'Preparing...' : 'Ready to record'))}
            </div>
            <div style={{ fontSize: 14, color: '#5a6270' }}>
              {isRecording ? `Please describe the image (${recordingTime}s / 40s)` : (hasRecorded ? 'Get your score or continue' : 'Click the button to start speaking')}
            </div>
          </div>
        </div>

        {isRecording && (
          <div style={{
            height: 12, width: 120, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: '#dc2626', width: `${(recordingTime / 40) * 100}%`,
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

export default DescribeImage;