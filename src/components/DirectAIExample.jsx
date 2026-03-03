import React, { useState } from 'react';
import DirectAIService from '../services/directAIService';

const DirectAIExample = () => {
  const [recording, setRecording] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aiService = new DirectAIService();

  const handleSpeakingEvaluation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate a speaking evaluation
      const mockPrompt = "Describe a memorable vacation you had.";
      const mockTranscript = "I went to Paris last summer. It was amazing. I visited the Eiffel Tower and Louvre Museum. The food was delicious and people were friendly.";
      
      const result = await aiService.evaluateSpeaking(mockPrompt, mockTranscript, 'describe_image');
      setEvaluation(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingEvaluation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mockPrompt = "Write an essay about the benefits of learning English.";
      const mockResponse = "Learning English has many benefits. It is a global language that opens up opportunities for education, career advancement, and travel. English is widely spoken around the world and is the language of international business.";
      
      const result = await aiService.evaluateWriting(mockPrompt, mockResponse, 'write_essay');
      setEvaluation(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you'd capture actual audio
      // This is just a demo showing the transcription capability
      const result = await aiService.transcribeAudio(new Blob(['mock audio data'], { type: 'audio/webm' }));
      setEvaluation({ transcript: result, source: 'direct-transcription' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Direct AI Service Demo</h1>
      <p>No n8n required - direct API integration</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleSpeakingEvaluation} disabled={loading}>
          {loading ? 'Evaluating...' : 'Evaluate Speaking'}
        </button>
        <button onClick={handleWritingEvaluation} disabled={loading}>
          {loading ? 'Evaluating...' : 'Evaluate Writing'}
        </button>
        <button onClick={handleTranscription} disabled={loading}>
          {loading ? 'Transcribing...' : 'Test Transcription'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          padding: '10px', 
          borderRadius: '4px',
          color: '#c33',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {evaluation && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>Evaluation Results</h3>
          <p><strong>Source:</strong> {evaluation.source}</p>
          
          {evaluation.transcript && (
            <div>
              <h4>Transcript:</h4>
              <p style={{ fontStyle: 'italic', backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
                {evaluation.transcript}
              </p>
            </div>
          )}
          
          {evaluation.feedback && (
            <div>
              <h4>Feedback:</h4>
              <p>{evaluation.feedback}</p>
            </div>
          )}
          
          {evaluation.fluencyScore && (
            <div>
              <h4>Scores:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>Fluency: {evaluation.fluencyScore}/10</div>
                <div>Grammar: {evaluation.grammarScore}/10</div>
                <div>Pronunciation: {evaluation.pronunciationScore}/10</div>
                <div>Vocabulary: {evaluation.vocabularyScore}/10</div>
                {evaluation.taskScore && <div>Task Achievement: {evaluation.taskScore}/10</div>}
                <div><strong>Overall: {evaluation.overallScore}/50</strong></div>
              </div>
            </div>
          )}
          
          {evaluation.grammarErrors && evaluation.grammarErrors.length > 0 && (
            <div>
              <h4>Grammar Errors:</h4>
              <ul>
                {evaluation.grammarErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e8f4f8', 
        border: '1px solid #b8d4e8',
        borderRadius: '4px'
      }}>
        <h3>How It Works (No n8n)</h3>
        <ol>
          <li><strong>Direct API Calls:</strong> Communicates directly with AI providers</li>
          <li><strong>Priority Chain:</strong> Gemini → OpenAI Whisper → Backend Fallback</li>
          <li><strong>Zero Dependencies:</strong> No external workflow management needed</li>
          <li><strong>Lower Latency:</strong> Faster response times without webhook hops</li>
          <li><strong>Easier Debugging:</strong> Straightforward error handling and logging</li>
        </ol>
      </div>
    </div>
  );
};

export default DirectAIExample;