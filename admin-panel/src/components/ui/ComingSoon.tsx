import React from 'react';
import { Construction } from 'lucide-react';

export interface ComingSoonProps {
  moduleName: string;
  description: string;
  expectedAvailability?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  moduleName, 
  description, 
  expectedAvailability = 'Coming soon' 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-64) var(--space-24)',
      textAlign: 'center',
      backgroundColor: 'var(--background)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--border)',
      maxWidth: '600px',
      margin: '40px auto'
    }}>
      <div style={{
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-24)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Construction size={32} />
      </div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 700, 
        color: 'var(--text-heading)', 
        marginBottom: 'var(--space-8)' 
      }}>
        {moduleName}
      </h2>
      <p style={{ 
        color: 'var(--text-body)', 
        fontSize: '1rem', 
        marginBottom: 'var(--space-24)',
        maxWidth: '400px'
      }}>
        {description}
      </p>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#FFF2E8',
        color: 'var(--primary)',
        borderRadius: 'var(--radius-input)',
        fontSize: '0.875rem',
        fontWeight: 600,
        border: '1px solid rgba(232, 116, 18, 0.25)'
      }}>
        {expectedAvailability}
      </div>
    </div>
  );
};
