import React from 'react';

export interface StatusConfig {
  label: string;
  icon?: React.ReactNode;
  variant: 'published' | 'draft' | 'scheduled' | 'suspended' | 'active' | 'archived' | 'pending' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES: Record<StatusConfig['variant'], string> = {
  published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
  scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  suspended: 'bg-rose-50 text-rose-800 border-rose-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  archived: 'bg-stone-200 text-stone-600 border-stone-300',
  pending: 'bg-blue-50 text-blue-800 border-blue-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

const STATUS_ICONS: Record<StatusConfig['variant'], React.ReactNode> = {
  published: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  draft: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
  scheduled: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  suspended: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
  active: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  archived: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v2h2a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V5zm7 2v10l4-4-4-4z" clipRule="evenodd" /></svg>,
  pending: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 001.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
  error: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
  warning: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.525-1.516 2.525H3.72c-1.347 0-2.189-1.358-1.515-2.525L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  info: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 10-2 0v6a1 1 0 002 0V5z" clipRule="evenodd" /></svg>,
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-[0.65rem]',
  md: 'px-2.5 py-1 text-[0.68rem]',
  lg: 'px-3 py-1.5 text-xs',
};

export const StatusBadge: React.FC<StatusConfig> = ({
  label,
  icon,
  variant = 'info',
  size = 'md',
}) => {
  const styleClass = STATUS_STYLES[variant] || STATUS_STYLES.info;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const displayIcon = icon || STATUS_ICONS[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-xl border font-extrabold ${styleClass} ${sizeClass}`}>
      {displayIcon && <span className="shrink-0" aria-hidden="true">{displayIcon}</span>}
      <span>{label}</span>
    </span>
  );
};

export const getBhajanStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'प्रकाशित':
      return { label: 'प्रकाशित', variant: 'published', size: 'md' };
    case 'ड्राफ्ट':
      return { label: 'ड्राफ्ट', variant: 'draft', size: 'md' };
    case 'शेड्यूल किया गया':
      return { label: 'शेड्यूल', variant: 'scheduled', size: 'md' };
    case 'निलंबित':
      return { label: 'निलंबित', variant: 'suspended', size: 'md' };
    default:
      return { label: status || 'अज्ञात', variant: 'info', size: 'md' };
  }
};