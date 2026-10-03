import React from 'react';
import { HelpCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  computeDelta,
  deltaToneClasses,
  formatDeltaAbsolute,
  formatDeltaPercent,
} from '../../analytics/format';

/**
 * Coverage-aware KPI card.
 *
 * The critical behaviour is the `available === false` branch: when the backend
 * reports that a metric had no collector for this period, the card renders an
 * explicit "not collected" state. It never renders `0`, because a structural
 * zero and a real zero are different facts and conflating them is what made the
 * previous Reports page untrustworthy.
 */

export interface AnalyticsKpiCardProps {
  label: string;
  icon: React.ReactNode;
  /** Rendered value, e.g. "1,204" or "3 घंटे 12 मिनट". */
  value: string;
  /** False when the metric has no trustworthy source for this period. */
  available: boolean;
  /** Shown when `available` is false. */
  unavailableReason?: string;
  /** Comparison period value; null/undefined disables the delta chip. */
  previousValue?: number | null;
  currentNumericValue?: number;
  /** Pre-computed when the caller needs custom comparability logic. */
  deltaComparable?: boolean;
  deltaFormatter?: (value: number) => string;
  /** Server-declared definition, surfaced in the tooltip. */
  definition?: string;
  source?: string;
  accentClassName?: string;
  iconClassName?: string;
  footer?: React.ReactNode;
}

export const AnalyticsKpiCard: React.FC<AnalyticsKpiCardProps> = ({
  label,
  icon,
  value,
  available,
  unavailableReason = 'इस अवधि के लिए डेटा एकत्र नहीं हुआ',
  previousValue,
  currentNumericValue,
  deltaComparable = true,
  deltaFormatter,
  definition,
  source,
  accentClassName = 'bg-orange-50 border-orange-200 text-orange-600',
  iconClassName = 'w-6 h-6',
  footer,
}) => {
  const delta =
    currentNumericValue === undefined
      ? null
      : computeDelta(currentNumericValue, previousValue, available && deltaComparable);

  return (
    <div className="admin-card p-5 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-stone-500 truncate">{label}</p>
            {definition ? (
              <span title={`${definition}${source ? `\nस्रोत: ${source}` : ''}`} className="shrink-0 text-stone-300 hover:text-stone-500">
                <HelpCircle className="w-3.5 h-3.5" aria-label={`${label} की परिभाषा`} />
              </span>
            ) : null}
          </div>

          {available ? (
            <h3 className="font-black text-2xl text-stone-900 leading-tight">{value}</h3>
          ) : (
            <>
              <h3 className="font-black text-2xl text-stone-300 leading-tight">—</h3>
              <p className="text-[11px] font-semibold text-amber-700 leading-snug">{unavailableReason}</p>
            </>
          )}
        </div>

        <div className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${accentClassName}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 min-h-[22px]">
        {available && delta ? (
          <>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-black ${deltaToneClasses(delta.direction)}`}
              title={delta.reason}
            >
              {delta.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : delta.direction === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {formatDeltaPercent(delta)}
            </span>
            {delta.absolute !== null && delta.absolute !== 0 ? (
              <span className="text-[11px] font-bold text-stone-400">
                {formatDeltaAbsolute(delta, deltaFormatter)}
              </span>
            ) : null}
            <span className="text-[11px] font-bold text-stone-400">पिछली समान अवधि से</span>
          </>
        ) : available ? (
          <span className="text-[11px] font-bold text-stone-400">तुलना उपलब्ध नहीं</span>
        ) : null}
        {footer}
      </div>
    </div>
  );
};

export default AnalyticsKpiCard;