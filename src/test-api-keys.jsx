import React, { useEffect, useState } from 'react';

const TestApiKeys = () => {
  const [keys, setKeys] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Test API key detection
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    setKeys({
      openRouter: openRouterKey ? `${openRouterKey.substring(0, 10)}...` : 'NOT FOUND',
      openAi: openAiKey ? `${openAiKey.substring(0, 10)}...` : 'NOT FOUND',
      gemini: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'NOT FOUND'
    });

    console.log('=== ENVIRONMENT VARIABLES TEST ===');
    console.log('VITE_OPENROUTER_API_KEY:', openRouterKey);
    console.log('VITE_OPENAI_API_KEY:', openAiKey);
    console.log('VITE_GEMINI_API_KEY:', geminiKey);
    console.log('==================================');

    // Test service instantiation
    try {
      import('./services/aiEvaluationService').then((module) => {
        const AIEvaluationService = module.default;
        const service = new AIEvaluationService();
        console.log('Service instantiated successfully');
        console.log('Service keys:', {
          openRouter: service.openRouterKey ? `${service.openRouterKey.substring(0, 10)}...` : 'NOT FOUND',
          openAi: service.openAiKey ? `${service.openAiKey.substring(0, 10)}...` : 'NOT FOUND',
          gemini: service.geminiApiKey ? `${service.geminiApiKey.substring(0, 10)}...` : 'NOT FOUND'
        });
        setTestResult('Service test completed - check console for details');
      });
    } catch (error) {
      console.error('Service instantiation failed:', error);
      setTestResult(`Service test failed: ${error.message}`);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Keys Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <pre>{JSON.stringify(keys, null, 2)}</pre>
      </div>
      <div>
        <h3>Test Result:</h3>
        <p>{testResult || 'Running test...'}</p>
      </div>
    </div>
  );
};

export default TestApiKeys;