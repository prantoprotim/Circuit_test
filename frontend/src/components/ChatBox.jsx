import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight } from 'lucide-react';

export default function ChatBox({ messages, onSendMessage, isLoading, disabled, placeholder }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || disabled) return;
    
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="chat-container" id="chat-workspace">
      <div className="chat-messages" id="chat-messages-container">
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            textAlign: 'center',
            padding: '2rem'
          }} id="chat-empty-hint">
            {disabled 
              ? "Select 'Ask AI' or 'Generate Viva' to start chatting about your circuit." 
              : "Start the chat by typing your question below!"}
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-bubble ${msg.role === 'user' ? 'user' : 'model'}`}
            >
              <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="chat-bubble model" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} id="chat-typing-indicator">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI is typing</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-row" id="chat-form">
        <input
          type="text"
          className="chat-input"
          placeholder={placeholder || (disabled ? "Select an action to start chat..." : "Ask a follow-up question...")}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled || isLoading}
          id="chat-input-field"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={disabled || isLoading || !inputText.trim()}
          id="chat-submit-button"
        >
          <span>Send</span>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
