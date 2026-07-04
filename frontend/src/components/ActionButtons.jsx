import React from 'react';
import { Eye, BookOpen, MessageSquare, GraduationCap } from 'lucide-react';

export default function ActionButtons({ activeMode, onAction, disabled }) {
  const actions = [
    {
      id: 'explain',
      label: 'Explain Circuit',
      description: 'Get component analysis & formulas',
      icon: Eye,
      idAttr: 'btn-explain'
    },
    {
      id: 'report',
      label: 'Generate Lab Report',
      description: 'Create detailed academic report',
      icon: BookOpen,
      idAttr: 'btn-report'
    },
    {
      id: 'chat',
      label: 'Ask AI',
      description: 'Interactive chat on circuit topic',
      icon: MessageSquare,
      idAttr: 'btn-chat'
    },
    {
      id: 'viva',
      label: 'Generate Viva',
      description: 'Start interactive oral exam session',
      icon: GraduationCap,
      idAttr: 'btn-viva'
    }
  ];

  return (
    <div className="glass-panel actions-grid" id="actions-panel">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activeMode === action.id;
        
        return (
          <button
            key={action.id}
            id={action.idAttr}
            className={`action-btn ${isActive ? 'active' : ''}`}
            onClick={() => onAction(action.id)}
            disabled={disabled}
            type="button"
            title={action.description}
          >
            <Icon />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>{action.label}</span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 400, 
                opacity: 0.7, 
                marginTop: '0.15rem',
                textAlign: 'center',
                color: isActive ? '#070913' : 'var(--text-muted)'
              }}>
                {action.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
