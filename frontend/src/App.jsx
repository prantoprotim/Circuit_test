import React, { useState } from 'react';
import { Sparkles, Power, RefreshCw } from 'lucide-react';
import UploadSection from './components/UploadSection';
import ActionButtons from './components/ActionButtons';
import ResponseWindow from './components/ResponseWindow';
import ChatBox from './components/ChatBox';
import {
  explainCircuit,
  generateLabReport,
  sendChatMessage,
  startVivaSession,
  sendVivaResponse
} from './services/api';

export default function App() {
  const [experimentTitle, setExperimentTitle] = useState('');
  const [imageFilename, setImageFilename] = useState('');
  const [activeMode, setActiveMode] = useState(null); // 'explain' | 'report' | 'chat' | 'viva'
  const [responseContent, setResponseContent] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (title) => {
    setExperimentTitle(title);
  };

  const handleImageUploaded = (filename) => {
    setImageFilename(filename);
  };

  const handleImageRemoved = () => {
    setImageFilename('');
  };

  const handleAction = async (mode) => {
    setError('');
    
    // Check validation: user must provide a title or image
    if (!experimentTitle.trim() && !imageFilename) {
      setError('Please enter an Experiment Title or upload a Circuit Image first.');
      return;
    }

    setActiveMode(mode);

    if (mode === 'explain') {
      setIsLoading(true);
      setResponseContent('');
      
      const result = await explainCircuit(experimentTitle, imageFilename);
      setIsLoading(false);
      
      if (result.success) {
        setResponseContent(result.response);
      } else {
        setError(result.error || 'Failed to explain the circuit.');
      }
    } 
    
    else if (mode === 'report') {
      setIsLoading(true);
      setResponseContent('');
      
      const result = await generateLabReport(experimentTitle, imageFilename);
      setIsLoading(false);
      
      if (result.success) {
        setResponseContent(result.response);
      } else {
        setError(result.error || 'Failed to generate lab report.');
      }
    } 
    
    else if (mode === 'chat') {
      // Start/Switch to chat mode
      setResponseContent(`### 💬 Interactive Chat Workspace\nUse the chat box below to discuss this circuit experiment with CircuitMindAI.\n\n* **Topic**: ${experimentTitle || 'Uploaded Circuit'}\n* **File**: ${imageFilename || 'None'}\n\n*Ask questions like:*\n- "How do I choose the value for the feedback resistor?"\n- "What are the common noise issues in this layout?"\n- "Can you explain the frequency equation?"`);
      
      // Initialize chat history if empty
      if (chatHistory.length === 0) {
        setChatHistory([
          { 
            role: 'model', 
            content: `Hi! I am CircuitMindAI. I am ready to help you analyze this circuit. What questions do you have?`
          }
        ]);
      }
    } 
    
    else if (mode === 'viva') {
      setIsLoading(true);
      setResponseContent('');
      setChatHistory([]); // Clear past normal chat when starting viva
      
      const result = await startVivaSession(experimentTitle, imageFilename);
      setIsLoading(false);
      
      if (result.success) {
        setResponseContent(`### 🎓 Interactive Viva session is active!\n\nUse the Chat Box below to answer the examiner's questions.\n\nThere will be 3 questions testing your understanding of the circuit.`);
        setChatHistory([
          {
            role: 'model',
            content: result.response
          }
        ]);
      } else {
        setError(result.error || 'Failed to start viva session.');
        setActiveMode(null);
      }
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    setIsChatLoading(true);
    
    // Add user message to history
    const userMessage = { role: 'user', content: text };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);

    if (activeMode === 'viva') {
      // Call viva respond
      const result = await sendVivaResponse(text, chatHistory, imageFilename);
      setIsChatLoading(false);
      
      if (result.success) {
        setChatHistory(prev => [...prev, { role: 'model', content: result.response }]);
        // Check if viva is complete to show final summary in response window
        if (result.response.includes('Performance Summary') || result.response.includes('Complete!')) {
          setResponseContent(`### 🎓 Viva Session Completed!\n\nCheck the chat dialog below for the final grading score and constructive feedback.\n\nTo start another session, change your inputs and click 'Generate Viva'.`);
        }
      } else {
        setChatHistory(prev => [...prev, { role: 'model', content: `Error: ${result.error || 'Connection failed'}` }]);
      }
    } else {
      // Call standard chat
      const result = await sendChatMessage(text, chatHistory, imageFilename);
      setIsChatLoading(false);
      
      if (result.success) {
        setChatHistory(prev => [...prev, { role: 'model', content: result.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'model', content: `Error: ${result.error || 'Connection failed'}` }]);
      }
    }
  };

  const handleReset = () => {
    setExperimentTitle('');
    setImageFilename('');
    setActiveMode(null);
    setResponseContent('');
    setChatHistory([]);
    setError('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>CircuitMindAI</h1>
        <p>Your Intelligent Electronics Circuit Assistant & Lab Companion</p>
      </header>

      <main className="dashboard-grid">
        {/* Left Control Panel: Upload, Inputs, Actions */}
        <section className="control-panel">
          <UploadSection
            experimentTitle={experimentTitle}
            onTitleChanged={handleTitleChange}
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            imageFilename={imageFilename}
          />

          <ActionButtons
            activeMode={activeMode}
            onAction={handleAction}
            disabled={isLoading || isChatLoading}
          />
          
          {(experimentTitle || imageFilename || activeMode) && (
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '-0.5rem'
              }}
              id="btn-reset-workspace"
              type="button"
            >
              <RefreshCw size={16} />
              <span>Clear / Reset Workspace</span>
            </button>
          )}
        </section>

        {/* Right Output Panel: AI Response Window and Chat Box */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '600px' }} id="output-workspace">
          <ResponseWindow
            content={responseContent}
            isLoading={isLoading}
            activeMode={activeMode}
            error={error}
          />

          <ChatBox
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            disabled={activeMode !== 'chat' && activeMode !== 'viva'}
            placeholder={
              activeMode === 'viva' 
                ? "Type your answer to the examiner..." 
                : activeMode === 'chat' 
                ? "Type your message to CircuitMindAI..." 
                : "Select 'Ask AI' or 'Generate Viva' to enable chat..."
            }
          />
        </section>
      </main>
    </div>
  );
}
