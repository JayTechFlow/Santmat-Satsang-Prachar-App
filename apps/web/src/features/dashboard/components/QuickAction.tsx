import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color?: string;
  disabled?: boolean;
}

export function QuickAction({ label, description, icon, route, color = 'bg-[#EA580C]', disabled = false }: QuickActionProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      disabled={disabled}
      className={`p-4 rounded-[0.75rem] border text-left transition-all group ${
        disabled
          ? 'border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed'
          : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:shadow-xs hover:border-stone-300 cursor-pointer'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg ${color} text-white flex items-center justify-center mb-2 shadow-xs ${
        disabled ? '' : 'group-hover:scale-110 transition-transform'
      }`}>
        {icon}
      </div>
      <h4 className="font-bold text-xs text-stone-900">{label}</h4>
      <p className="text-[0.68rem] text-stone-500 mt-0.5">{description}</p>
    </button>
  );
}
