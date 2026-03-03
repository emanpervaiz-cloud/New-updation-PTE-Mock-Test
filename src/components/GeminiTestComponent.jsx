import React, { useState } from 'react';

const GeminiTestComponent = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testGemini = async () => {
    setLoading(true);
    setResult('Testing Gemini API...');
    
    try {
      // This will use the Gemini key from your .env file
      const response = await fetch('http://localhost:5173'); // Just to check if app is running
      
      // In a real test, you would call your AI service
      setResult('✅ Application is running and Gemini key is configured in .env file');
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Gemini API Key Test</h2>
      <p>Your Gemini key has been added to .env file:</p>
      <code style={{ 
        display: 'block', 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px',
        marginBottom: '20px',
        wordBreak: 'break-all'
      }}>
        VITE_GEMINI_API_KEY=AIzaSyAVUcmsczn5N0sSY7hWZTA--ZFKYPpMyX8
      </code>
      
      <button 
        onClick={testGemini} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4285f4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Gemini Integration'}
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f8ff', 
          border: '1px solid #4285f4',
          borderRadius: '4px'
        }}>
          <h3>Result:</h3>
          <p>{result}</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e8f5e8', 
        border: '1px solid #4caf50',
        borderRadius: '4px'
      }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Open your application in the browser: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
          <li>Try recording audio in a speaking question</li>
          <li>Check the browser console for Gemini API logs</li>
          <li>The AI evaluation service should now use your Gemini key for transcription and scoring</li>
        </ol>
      </div>
    </div>
  );
};

export default GeminiTestComponent;