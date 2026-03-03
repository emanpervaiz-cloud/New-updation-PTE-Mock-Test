import React, { useState } from 'react';

const TestGemini = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testGemini = async () => {
    setLoading(true);
    setResult('Testing Gemini API...');
    
    try {
      // Get the API key from environment
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('API Key exists:', !!apiKey);
      console.log('API Key first 10 chars:', apiKey?.substring(0, 10));
      
      if (!apiKey) {
        setResult('ERROR: No Gemini API key found in environment variables');
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'Hello, this is a simple test. Please respond with "Gemini API is working!"' }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100
            }
          })
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        setResult(`ERROR: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResult(`SUCCESS: ${textContent || 'No response text found'}`);
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Gemini API Test</h2>
      <button 
        onClick={testGemini}
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Gemini API'}
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: result.startsWith('ERROR') ? '#ffe6e6' : '#e6ffe6',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {result}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #ccc' }}>
        <h3>Debug Information:</h3>
        <p><strong>Environment Variables:</strong></p>
        <p>VITE_GEMINI_API_KEY exists: {String(!!import.meta.env.VITE_GEMINI_API_KEY)}</p>
        <p>VITE_OPENROUTER_API_KEY exists: {String(!!import.meta.env.VITE_OPENROUTER_API_KEY)}</p>
        <p>VITE_N8N_API_KEY exists: {String(!!import.meta.env.VITE_N8N_API_KEY)}</p>
      </div>
    </div>
  );
};

export default TestGemini;