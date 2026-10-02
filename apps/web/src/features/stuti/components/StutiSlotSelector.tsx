/**
 * StutiSlotSelector
 * ============================================================================
 * Renders the EXACTLY TWO fixed product slots (प्रातःकालीन स्तुति /
 * संध्याकालीन स्तुति). The list is a compile-time constant, so no dynamic
 * stuti items, no "Add" control and no "Delete" control can ever appear.
 */
import React from 'react';
import { NamasteIcon } from '../../../components/shared/DevotionalIcons';
import { STUTI_SLOTS } from '../config/stutiSlots';
import { StutiSlot } from '../../../types/common/index';

interface StutiSlotSelectorProps {
  selected: StutiSlot;
  onSelect: (slot: StutiSlot) => void;
}

export const StutiSlotSelector: React.FC<StutiSlotSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {STUTI_SLOTS.map((slot) => {
        const isSelected = slot.type === selected;
        return (
          <button
            key={slot.docId}
            type="button"
            onClick={() => onSelect(slot.type)}
            aria-pressed={isSelected}
            className={`flex flex-col items-start justify-between gap-2 px-5 py-4 rounded-xl font-bold text-sm transition-all border text-left relative overflow-hidden ${
              isSelected
                ? 'bg-white text-stone-900 border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-sm'
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <span
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                isSelected ? 'bg-gradient-to-b from-[#EA580C] to-amber-400' : 'bg-transparent'
              }`}
              aria-hidden="true"
            />
            <span className="flex items-center gap-2.5 w-full">
              <span className={`shrink-0 ${isSelected ? 'text-[#EA580C]' : 'text-stone-400'}`}>
                <NamasteIcon className="w-5 h-5" />
              </span>
              <span className="text-base">{slot.label}</span>
            </span>
            <span className={`text-[0.72rem] font-semibold ${isSelected ? 'text-stone-600' : 'text-stone-500'}`}>
              {slot.description}
            </span>
            <span
              className={`text-[0.6rem] px-2 py-0.5 rounded-full font-extrabold tracking-wider uppercase ${
                isSelected ? 'bg-orange-50 text-[#C2410C] border border-orange-200' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {slot.fixedBadge}
            </span>
          </button>
        );
      })}
    </div>
  );
};