import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color?: string;
  disabled?: boolean;
}

export function QuickAction({ label, description, icon, route, color = 'bg-brand/10 text-brand', disabled = false }: QuickActionProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => !disabled && navigate(route)}
      disabled={disabled}
      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
        disabled
          ? 'border-stone-200 bg-surface opacity-50 cursor-not-allowed'
          : 'border-stone-200 bg-surface hover:shadow-md hover:border-stone-300 cursor-pointer group'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3 ${
          disabled ? '' : 'group-hover:scale-110 transition-transform duration-200'
        }`}
        data-testid="quick-action-icon-container"
      >
        {icon}
      </div>
      <h4 className="font-semibold text-text-primary">{label}</h4>
      <p className="text-sm text-text-secondary mt-1">{description}</p>
    </button>
  );
}