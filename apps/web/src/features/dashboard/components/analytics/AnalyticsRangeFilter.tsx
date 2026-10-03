import React from 'react';
import { CalendarRange, RotateCcw } from 'lucide-react';
import {
  ANALYTICS_RANGE_PRESETS,
  AnalyticsRangePresetId,
  inclusiveDayCount,
  isDayKey,
  shiftDayKey,
  todayUtc,
} from '../../analytics/dateRange';
import { formatRangeLabel } from '../../analytics/dateRange';

/**
 * Analytics date-range control.
 *
 * Presets plus a custom inclusive range. The previous control offered only
 * 7/30/90/365-day buttons and could not show Today or Yesterday, so the
 * operator had no way to inspect the current (partial) day at all — even though
 * "Today" is the range they most often want.
 *
 * All bounds are UTC day keys, matching the backend contract. Local-date input
 * strings are passed through unchanged because `type="date"` already yields
 * YYYY-MM-DD.
 */

export interface AnalyticsRangeFilterProps {
  preset: AnalyticsRangePresetId;
  customStart?: string;
  customEnd?: string;
  maxRangeDays: number;
  /** Resolved bounds currently in effect, used for the summary line. */
  resolvedStartDate: string;
  resolvedEndDate: string;
  onPresetChange: (preset: AnalyticsRangePresetId) => void;
  onCustomChange: (startDate: string, endDate: string) => void;
  isPartialPeriod: boolean;
}

export const AnalyticsRangeFilter: React.FC<AnalyticsRangeFilterProps> = ({
  preset,
  customStart,
  customEnd,
  maxRangeDays,
  resolvedStartDate,
  resolvedEndDate,
  onPresetChange,
  onCustomChange,
  isPartialPeriod,
}) => {
  const today = todayUtc();
  const resolvedDays = inclusiveDayCount(resolvedStartDate, resolvedEndDate);
  const customTooLong = resolvedDays > maxRangeDays;

  // Validate against the live contract limit rather than a hardcoded constant.
  const customInvalid =
    preset === 'custom' &&
    (!isDayKey(customStart) || !isDayKey(customEnd) || customStart > customEnd || customTooLong);

  const inputClass =
    'px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40';

  return (
    <div className="admin-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-[#EA580C]" />
          <span>तिथि-सीमा (अवधि)</span>
        </h3>
        <span className="text-[11px] font-bold text-stone-500">
          {formatRangeLabel(resolvedStartDate, resolvedEndDate)}
          {isPartialPeriod ? <span className="text-amber-700"> · आज तक अधूरा</span> : null}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {ANALYTICS_RANGE_PRESETS.map((item) => {
          const active = preset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPresetChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/40 ${
                active
                  ? 'bg-[#EA580C] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={preset === 'custom'}
          onClick={() => onPresetChange('custom')}
          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/40 ${
            preset === 'custom'
              ? 'bg-[#EA580C] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          कस्टम
        </button>
      </div>

      {preset === 'custom' ? (
        <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-stone-100">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-stone-500">से (आरंभ)</span>
            <input
              type="date"
              value={customStart ?? ''}
              max={customEnd || today}
              onChange={(e) => onCustomChange(e.target.value, customEnd ?? shiftDayKey(e.target.value || today, -1))}
              className={inputClass}
              aria-label="शुरुआत की तिथि"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-stone-500">तक (समाप्ति)</span>
            <input
              type="date"
              value={customEnd ?? ''}
              min={customStart || undefined}
              max={today}
              onChange={(e) => onCustomChange(customStart ?? shiftDayKey(e.target.value || today, -29), e.target.value)}
              className={inputClass}
              aria-label="समाप्ति तिथि"
            />
          </label>
          <button
            type="button"
            onClick={() => onCustomChange(shiftDayKey(today, -29), today)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-stone-600 hover:bg-stone-100 border border-stone-200"
          >
            <RotateCcw className="w-3 h-3" />
            डिफ़ॉल्ट
          </button>
          <span className="text-[11px] font-bold text-stone-400">अधिकतम {maxRangeDays} दिन</span>

          {customInvalid ? (
            <p className="w-full text-[11px] font-bold text-rose-600">
              {!isDayKey(customStart) || !isDayKey(customEnd)
                ? 'कृपया दोनों तिथियाँ चुनें।'
                : customStart > customEnd
                  ? 'आरंभ तिथि समाप्ति तिथि से पहले होनी चाहिए।'
                  : `चयनित अवधि ${resolvedDays} दिन है, जो ${maxRangeDays} दिन की सीमा से अधिक है।`}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsRangeFilter;