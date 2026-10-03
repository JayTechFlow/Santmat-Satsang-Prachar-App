import React, { useMemo } from 'react';
import { formatDayKeyShort } from '../../analytics/dateRange';
import { formatHoursCompact, formatIndian } from '../../analytics/format';

/**
 * Dependency-free SVG trend chart.
 *
 * Two properties matter for correctness here:
 *  1. It renders *no* series at all when the backend reported the metric as
 *     uncollected, instead of drawing a flat line at zero which reads as
 *     "nothing happened" rather than "we were not measuring".
 *  2. Values are taken from the server-provided rows, and the y-axis maximum is
 *     derived from those same rows, so the axis can never disagree with the
 *     plot.
 */

export type TrendMetric = 'totalPlays' | 'totalListenDurationSeconds' | 'uniqueActiveUsers' | 'distinctTracksPlayed';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface AnalyticsTrendChartProps {
  title: string;
  metric: TrendMetric;
  points: TrendPoint[];
  /** False when the series has no trustworthy source for this period. */
  available: boolean;
  unavailableReason?: string;
  /** Renders the y-axis / tooltip in hours instead of counts. */
  asHours?: boolean;
  partialDates?: Set<string>;
  height?: number;
}

const WIDTH = 720;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  title,
  metric,
  points,
  available,
  unavailableReason = 'इस अवधि के लिए डेटा एकत्र नहीं हुआ',
  asHours = false,
  partialDates,
  height = 220,
}) => {
  const maxValue = useMemo(
    () => points.reduce((max, point) => Math.max(max, point.value ?? 0), 0),
    [points]
  );

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const scaleY = (value: number): number => {
    if (maxValue <= 0) return PAD.top + innerH;
    return PAD.top + innerH - (value / maxValue) * innerH;
  };

  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const linePath = useMemo(() => {
    if (!available || points.length === 0) return '';
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${PAD.left + index * stepX} ${scaleY(point.value)}`)
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, points, maxValue, stepX]);

  const areaPath = useMemo(() => {
    if (!available || points.length === 0 || maxValue <= 0) return '';
    const baseline = PAD.top + innerH;
    return `${linePath} L ${PAD.left + (points.length - 1) * stepX} ${baseline} L ${PAD.left} ${baseline} Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linePath, available, points.length, maxValue, stepX]);

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(maxValue * fraction));

  const tickEvery = Math.max(1, Math.ceil(points.length / 8));

  const formatValue = (value: number): string => (asHours ? formatHoursCompact(value) : formatIndian(value));

  return (
    <div className="admin-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-black text-sm text-stone-900">{title}</h3>
        {!available ? (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            डेटा एकत्र नहीं
          </span>
        ) : null}
      </div>

      {!available ? (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 py-10 text-center">
          <p className="text-sm font-bold text-stone-400">—</p>
          <p className="text-[11px] font-semibold text-amber-700 max-w-xs">{unavailableReason}</p>
        </div>
      ) : points.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 py-10 text-center">
          <p className="text-sm font-bold text-stone-400">कोई दिनांक डेटा नहीं</p>
          <p className="text-[11px] font-semibold text-stone-400">चयनित अवधि में कोई रिकॉर्ड नहीं मिला।</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${height}`}
              className="w-full min-w-[420px] h-auto"
              role="img"
              aria-label={`${title} — ${points.length} दिनों का रुझान`}
              data-testid={`trend-chart-${metric}`}
            >
              {/* Horizontal grid + y axis */}
              {gridValues.map((value) => (
                <g key={value}>
                  <line
                    x1={PAD.left}
                    x2={WIDTH - PAD.right}
                    y1={scaleY(value)}
                    y2={scaleY(value)}
                    stroke="#e7e5e4"
                    strokeWidth={1}
                    strokeDasharray={value === 0 ? undefined : '3 3'}
                  />
                  <text x={PAD.left - 8} y={scaleY(value) + 3.5} textAnchor="end" fontSize={10} fill="#a8a29e" fontWeight={700}>
                    {formatValue(value)}
                  </text>
                </g>
              ))}

              {/* Area under the line */}
              {areaPath ? <path d={areaPath} fill="url(#analyticsGradient)" /> : null}
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              {/* Series line */}
              {linePath ? (
                <path d={linePath} fill="none" stroke="#EA580C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              ) : null}

              {/* Partial days are drawn hollow so an in-progress day is never
                  mistaken for a final one. */}
              {points.map((point, index) => {
                const isPartial = partialDates?.has(point.date) ?? false;
                return (
                  <circle
                    key={point.date}
                    cx={PAD.left + index * stepX}
                    cy={scaleY(point.value)}
                    r={points.length > 60 ? 1.5 : 2.75}
                    fill={isPartial ? '#fff' : '#EA580C'}
                    stroke="#EA580C"
                    strokeWidth={1.25}
                  >
                    <title>
                      {`${formatDayKeyShort(point.date)} · ${formatValue(point.value)}`}
                      {isPartial ? ' (अधूरा दिन)' : ''}
                    </title>
                  </circle>
                );
              })}

              {/* X axis labels */}
              {points.map((point, index) =>
                index % tickEvery === 0 || index === points.length - 1 ? (
                  <text
                    key={point.date}
                    x={PAD.left + index * stepX}
                    y={height - 8}
                    textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                    fontSize={10}
                    fill="#a8a29e"
                    fontWeight={700}
                  >
                    {formatDayKeyShort(point.date)}
                  </text>
                ) : null
              )}
            </svg>
          </div>

          <p className="text-[11px] font-semibold text-stone-400">
            अधिकतम: <span className="font-black text-stone-600">{formatValue(maxValue)}</span>
            {partialDates && partialDates.size > 0 ? (
              <span className="text-amber-700"> · ○ = अधूरा दिन ({partialDates.size})</span>
            ) : null}
          </p>
        </>
      )}
    </div>
  );
};

export default AnalyticsTrendChart;