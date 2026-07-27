import React, { useState, useEffect, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { Save } from 'lucide-react';

export interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
  height?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  id = 'draft',
  placeholder = 'Enter markdown content here...',
  height = 400
}) => {
  const [draftSaved, setDraftSaved] = useState(false);

  // Auto-save draft to local storage
  useEffect(() => {
    if (!value && !id) {
      const saved = localStorage.getItem(`md-editor-draft-draft`);
      if (saved) {
        onChange(saved);
      }
    }
  }, [id, value, onChange]);

  useEffect(() => {
    const draftKey = `md-editor-draft-${id}`;
    if (value) {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, value);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [value, id]);

  const wordCount = useMemo(() => {
    if (!value) return 0;
    return value.trim().split(/\s+/).filter(Boolean).length;
  }, [value]);

  const charCount = useMemo(() => {
    if (!value) return 0;
    return value.length;
  }, [value]);

  return (
    <div className="markdown-editor-container" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }} data-color-mode="light">
      <style>
        {`
          .w-md-editor {
            font-family: 'Noto Sans Devanagari', sans-serif !important;
          }
          .w-md-editor-text-pre > code, .w-md-editor-text-input {
            font-family: 'Noto Sans Devanagari', sans-serif !important;
            font-size: 16px;
            line-height: 1.6;
          }
        `}
      </style>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]]
        }}
        height={height}
        textareaProps={{
          placeholder
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div>
          {wordCount} words | {charCount} characters
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {draftSaved && (
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Save size={12} /> Draft saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
