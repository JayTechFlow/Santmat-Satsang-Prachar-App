import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Wifi } from 'lucide-react';
import type { ActiveUserSemantics, AnalyticsCoverage } from '../../analytics/types';
import { ACTIVE_SEMANTICS_LABELS, COVERAGE_REASONS } from '../../analytics/types';
import { formatRelativeRefresh } from '../../analytics/format';

/**
 * Data-provenance disclosure.
 *
 * This component exists so the Reports page never has to choose between
 * overstating and hiding a limitation. It states, per metric, whether the
 * numbers are measured or uncollected, and it labels the active-user figure
 * with the exact semantics the backend used.
 *
 * It is deliberately always rendered (when there is something to disclose)
 * rather than only on error, because "we were not measuring this" is not an
 * error state an admin can discover on their own.
 */

export interface AnalyticsCoverageNoticeProps {
  coverage: AnalyticsCoverage;
  activeUserSemantics: ActiveUserSemantics;
  activeUserHeartbeatMinutes: number;
  updatedAt?: unknown;
  minPlayListenedSeconds: number;
  timezone: string;
}

const UNCOVERED_KEYS: Array<keyof AnalyticsCoverage> = ['plays', 'playtime', 'activeUsers', 'libraryActivity'];

const UNCOVERED_LABELS: Record<string, string> = {
  plays: 'कुल प्ले',
  playtime: 'संगीत श्रवण समय',
  activeUsers: 'सक्रिय उपयोगकर्ता',
  libraryActivity: 'विशिष्ट भजन',
};

export const AnalyticsCoverageNotice: React.FC<AnalyticsCoverageNoticeProps> = ({
  coverage,
  activeUserSemantics,
  activeUserHeartbeatMinutes,
  updatedAt,
  minPlayListenedSeconds,
  timezone,
}) => {
  const [expanded, setExpanded] = useState(false);

  const uncovered = UNCOVERED_KEYS.filter((key) => !coverage[key]);
  const isHeartbeatExact = activeUserSemantics === 'exact_realtime';
  const refreshed = formatRelativeRefresh(updatedAt);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-black text-amber-900">डेटा सत्यता सूचना (Data Provenance)</p>

            {uncovered.length > 0 ? (
              <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                चयनित अवधि में {uncovered.map((key) => UNCOVERED_LABELS[key]).join(', ')} के लिए कोई कलेक्टर
                नहीं था। इन मानों को <span className="font-black">0</span> नहीं माना गया — वे{' '}
                <span className="font-black">“एकत्र नहीं हुआ”</span> के रूप में दिखाए गए हैं।
              </p>
            ) : (
              <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                चयनित अवधि के सभी मापदंड वास्तविक दस्तावेज़ों से गणना किए गए हैं।
              </p>
            )}

            <p className="text-[11px] font-semibold text-amber-800 leading-relaxed flex items-start gap-1.5">
              {isHeartbeatExact ? (
                <Wifi className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0" />
              )}
              <span>
                सक्रिय उपयोगकर्ता: <span className="font-black">{ACTIVE_SEMANTICS_LABELS[activeUserSemantics]}</span>
                {isHeartbeatExact
                  ? ` — ${activeUserHeartbeatMinutes} मिनट की हार्टबीट विंडो`
                  : ' — यह पूरे दिन के अद्वितीय उपयोगकर्ताओं की गणना है, लाइव गिनती नहीं'}
                .
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-amber-800 hover:bg-amber-100 border border-amber-200"
          aria-expanded={expanded}
        >
          विवरण
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded ? (
        <div className="pl-6 space-y-1.5 text-[11px] font-semibold text-amber-800 border-t border-amber-200 pt-2">
          <p>
            • समय क्षेत्र: <span className="font-black">{timezone}</span> (दिन की सीमा अर्ध-खुली —{' '}
            <span className="font-mono">[00:00, अगला दिन 00:00)</span>)
          </p>
          <p>
            • प्ले की परिभाषा: कम से कम{' '}
            <span className="font-black">{minPlayListenedSeconds} सेकंड</span> वास्तविक श्रवण वाला सत्र
          </p>
          <p>• सक्रिय हार्टबीट विंडो: {activeUserHeartbeatMinutes} मिनट</p>
          <p>
            • अंतिम अद्यतन:{' '}
            <span className="font-black">{refreshed ?? 'अज्ञात'}</span>
          </p>
          {uncovered.length > 0 ? (
            <div className="pt-1">
              <p className="font-black">अनुपलब्ध मापदंड:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {uncovered.map((key) => (
                  <li key={key}>
                    <span className="font-black">{UNCOVERED_LABELS[key]}</span> — {COVERAGE_REASONS[key]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsCoverageNotice;