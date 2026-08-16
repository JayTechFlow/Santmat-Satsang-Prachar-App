/**
 * ============================================================================
 * Santmat Satsang Prachar - Detailed Reports & Analytics (Admin)
 * ============================================================================
 * Real analytics via the `analytics-getAnalyticsSummary` Cloud Function.
 * Renders genuine daily metrics; shows an explicit error or empty state when
 * the analytics pipeline has no data — nothing is fabricated.
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Headphones,
  Users,
  Timer,
  UserPlus,
  Loader2,
  CalendarRange,
  AlertTriangle,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import type { AnalyticsReportData, DailyAnalyticsSnapshot } from '../../services/reportService';

const RANGES: { id: '7d' | '30d' | '90d' | '1y'; label: string; days: number }[] = [
  { id: '7d', label: 'पिछले 7 दिन', days: 7 },
  { id: '30d', label: 'पिछले 30 दिन', days: 30 },
  { id: '90d', label: 'पिछले 90 दिन', days: 90 },
  { id: '1y', label: 'पिछले 1 वर्ष', days: 365 },
];

const formatIndian = (n: number): string => new Intl.NumberFormat('en-IN').format(n);

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h <= 0) return `${m} मिनट`;
  return `${h} घंटे ${m > 0 ? `${m} मिनट` : ''}`;
};

export const AdminReports: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [data, setData] = useState<AnalyticsReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (selected: '7d' | '30d' | '90d' | '1y') => {
    setLoading(true);
    setError(null);
    const days = RANGES.find((r) => r.id === selected)!.days;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);

    reportService
      .getAnalyticsSummary({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        limit: days,
      })
      .then((res) => {
        setLoading(false);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || 'एनालिटिक्स डेटा उपलब्ध नहीं');
          setData(null);
        }
      });
  };

  useEffect(() => {
    load(range);
  }, [range]);

  const daily = data?.daily ?? [];

  const totals = daily.reduce(
    (acc, d) => {
      acc.plays += d.totalPlays ?? 0;
      acc.seconds += d.totalListenDurationSeconds ?? 0;
      acc.activeUsers = Math.max(acc.activeUsers, d.uniqueActiveUsers ?? 0);
      acc.newUsers += d.newRegistrations ?? 0;
      return acc;
    },
    { plays: 0, seconds: 0, activeUsers: 0, newUsers: 0 }
  );

  const renderTable = (rows: DailyAnalyticsSnapshot[]) => {
    if (rows.length === 0) {
      return (
        <div className="py-10 text-center text-stone-400 space-y-2">
          <Inbox className="w-10 h-10 mx-auto text-stone-300" />
          <p className="text-sm">चयनित अवधि में कोई विश्लेषण रिकॉर्ड नहीं मिला</p>
          <p className="text-xs text-stone-400">जैसे ही मोबाइल ऐप से साधना डेटा एकत्र होगा, यहाँ प्रदर्शित होगा।</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-stone-500 border-b border-stone-200">
              <th className="py-2 pr-3 font-bold">दिनांक</th>
              <th className="py-2 pr-3 font-bold">कुल प्ले</th>
              <th className="py-2 pr-3 font-bold">सक्रिय उपयोगकर्ता</th>
              <th className="py-2 pr-3 font-bold">श्रवण समय</th>
              <th className="py-2 font-bold">नए पंजीकरण</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, idx) => (
              <tr key={idx} className="border-b border-stone-100 last:border-0">
                <td className="py-2 pr-3 font-bold text-stone-800">
                  {new Date(d.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-2 pr-3 text-stone-700">{formatIndian(d.totalPlays ?? 0)}</td>
                <td className="py-2 pr-3 text-stone-700">{formatIndian(d.uniqueActiveUsers ?? 0)}</td>
                <td className="py-2 pr-3 text-stone-700">{formatDuration(d.totalListenDurationSeconds ?? 0)}</td>
                <td className="py-2 text-stone-700">{formatIndian(d.newRegistrations ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-0.5">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span>विस्तृत रिपोर्ट एवं एनालिटिक्स</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900">रिपोर्ट एवं एनालिटिक्स केंद्र</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            डेटा स्रोत: `analytics-getAnalyticsSummary` (वास्तविक Cloud Function)
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                range === r.id
                  ? 'bg-[#EA580C] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error / Data states */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 shadow-xs text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-orange-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">रिपोर्ट लोड हो रही है…</p>
        </div>
      ) : error ? (
        <div className="bg-amber-50 rounded-3xl p-12 border border-amber-200 shadow-xs text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-600" />
          <p className="text-sm font-bold text-amber-900">एनालिटिक्स डेटा उपलब्ध नहीं</p>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">
            {error}. विश्लेषण पाइपलाइन (एनालिटिक्स स्नैपशॉट / शेड्यूलर) अभी तक सक्रिय नहीं है
            अथवा क्लाउड फ़ंक्शन तक पहुँच सीमित है।
          </p>
          <button
            onClick={() => load(range)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            पुनः प्रयास करें
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-500">कुल प्ले (Total Plays)</p>
                <h3 className="font-black text-2xl text-stone-900">{formatIndian(totals.plays)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-500">श्रवण समय</p>
                <h3 className="font-black text-xl text-stone-900">{formatDuration(totals.seconds)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Timer className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-500">शीर्ष सक्रिय उपयोगकर्ता</p>
                <h3 className="font-black text-2xl text-stone-900">{formatIndian(totals.activeUsers)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-500">नए पंजीकरण</p>
                <h3 className="font-black text-2xl text-stone-900">{formatIndian(totals.newUsers)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Daily Detail Table */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-[#EA580C]" />
                <span>दैनिक विवरण (Daily Analytics)</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {RANGES.find((r) => r.id === range)!.label}
              </span>
            </div>
            {renderTable(daily)}
          </div>
        </>
      )}
    </div>
  );
};
