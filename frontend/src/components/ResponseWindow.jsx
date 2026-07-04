import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Cpu, Download, Sparkles, HelpCircle } from 'lucide-react';

export default function ResponseWindow({ content, isLoading, activeMode, error }) {
  
  const getModeTitle = () => {
    switch (activeMode) {
      case 'explain':
        return 'Circuit Explanation';
      case 'report':
        return 'Generated Lab Report';
      case 'chat':
        return 'AI Assistant Workspace';
      case 'viva':
        return 'Interactive Viva Session';
      default:
        return 'AI Response Window';
    }
  };

  const handleDownloadMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CircuitMindAI_${activeMode || 'response'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel response-container" id="response-window">
      <div className="response-header">
        <div className="response-title" id="response-window-title">
          <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
          <span>{getModeTitle()}</span>
        </div>
        {content && !isLoading && !error && (
          <button
            onClick={handleDownloadMarkdown}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            id="btn-download-response"
            title="Download Response as Markdown (.md)"
            type="button"
          >
            <Download size={14} />
            <span>Download .md</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="response-placeholder" id="response-loading">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            CircuitMindAI is analyzing...
          </p>
        </div>
      ) : error ? (
        <div className="response-placeholder" style={{ color: '#ef4444' }} id="response-error">
          <HelpCircle size={48} />
          <p style={{ fontWeight: 500 }}>Analysis Failed</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '300px', margin: 0 }}>
            {error}
          </p>
        </div>
      ) : content ? (
        <div className="response-content markdown-body" id="response-markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="response-placeholder" id="response-empty-placeholder">
          <Sparkles size={48} style={{ color: 'var(--accent-purple)', animation: 'float 3s ease-in-out infinite' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Welcome to CircuitMindAI</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: 0 }}>
            Upload an image of your circuit diagram or paste an experiment title, then click an action above to start the AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}
