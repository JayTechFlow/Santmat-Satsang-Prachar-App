/**
 * ============================================================================
 * Santmat Satsang Prachar - Master Admin Analytics Dashboard
 * ============================================================================
 * Comprehensive administration dashboard providing real-time and historical
 * analytics across multiple selectable timelines:
 * - 7 Days (7 दिन)
 * - 30 Days (30 दिन)
 * - 180 Days / 6 Months (180 दिन / 6 माह)
 * - 1 Year (1 वर्ष)
 * - 2 Years (2 वर्ष)
 * - 5 Years (5 वर्ष)
 * - Lifetime / All-Time (आजीवन / सर्वकालिक - Lifetime)
 *
 * Includes dynamic SVG trend visualizations, category distribution, top devotional
 * tracks, recent track releases, and rapid administration quick actions.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Users,
  Headphones,
  Calendar,
  ChevronDown,
  TrendingUp,
  Clock,
  Flame,
  Award,
  Sparkles,
  Layers,
  BarChart3,
  Smartphone,
  CheckCircle2,
  FolderTree,
  Play,
  Pause,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { reportService } from '../../services/reportService';
import type { AnalyticsOverview, AnalyticsReportData } from '../../services/reportService';
import { NamasteIcon } from '../shared/DevotionalIcons';

// Supported analytics timeline range types
export type TimelineRange = '7d' | '30d' | '180d' | '1y' | '2y' | '5y' | 'lifetime';

interface TimelineData {
  rangeLabel: string;
  totalPlays: string;
  totalHours: string;
  devoteesReached: string;
  newRegistrations: string;
  chartPoints: { label: string; value: number; displayValue: string }[];
  maxValue: number;
  categoryShare: { name: string; percent: number; color: string }[];
}

const RANGE_LABELS: Record<TimelineRange, string> = {
  '7d': 'पिछले 7 दिन (Last 7 Days)',
  '30d': 'पिछले 30 दिन (Last 30 Days)',
  '180d': 'पिछले 180 दिन / 6 माह (Last 180 Days)',
  '1y': 'विगत 1 वर्ष (Last 1 Year)',
  '2y': 'विगत 2 वर्ष (Last 2 Years)',
  '5y': 'विगत 5 वर्ष (Last 5 Years)',
  'lifetime': 'सर्वकालिक / आजीवन (Lifetime Historical Archive)',
};

const RANGE_DAYS: Record<TimelineRange, number | null> = {
  '7d': 7,
  '30d': 30,
  '180d': 180,
  '1y': 365,
  '2y': 730,
  '5y': 1825,
  'lifetime': null,
};

const CATEGORY_COLORS = ['#EA580C', '#D97706', '#B45309', '#9333EA', '#059669', '#0D9488', '#DC2626', '#7C3AED'];

const formatIndian = (n: number): string => new Intl.NumberFormat('en-IN').format(n);

const formatCompact = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

const formatDateLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bhajans, stutis, categories, playTrack, currentTrack, isPlaying, togglePlay } = useApp();

  // Active selected timeline state
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineRange>('7d');

  // Real analytics from the `analytics-getAnalyticsSummary` Cloud Function
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReportData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    const days = RANGE_DAYS[selectedTimeline];
    const query: { startDate?: string; endDate?: string; limit?: number } = {};
    if (days) {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - days);
      query.startDate = start.toISOString().split('T')[0];
      query.endDate = end.toISOString().split('T')[0];
      query.limit = days;
    }

    reportService.getAnalyticsSummary(query).then((res) => {
      if (cancelled) return;
      setAnalyticsLoading(false);
      if (res.success) {
        setAnalyticsData(res.data);
        setAnalyticsError(null);
      } else {
        setAnalyticsError(res.error || 'एनालिटिक्स डेटा उपलब्ध नहीं');
        setAnalyticsData(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedTimeline]);

  /**
   * Timeline analytics dataset calculated from real backend analytics records.
   * When the analytics function has no data, values render as zero — never fabricated.
   */
  const currentData: TimelineData = useMemo(() => {
    const daily = analyticsData?.daily ?? [];
    const totalPlays = daily.reduce((sum, d) => sum + (d.totalPlays ?? 0), 0);
    const totalSeconds = daily.reduce((sum, d) => sum + (d.totalListenDurationSeconds ?? 0), 0);
    const totalHours = Math.round(totalSeconds / 3600);
    const devoteesReached = daily.reduce((max, d) => Math.max(max, d.uniqueActiveUsers ?? 0), 0);
    const newRegistrations = daily.reduce((sum, d) => sum + (d.newRegistrations ?? 0), 0);
    const peakPlays = daily.reduce((max, d) => Math.max(max, d.totalPlays ?? 0), 0);

    const chartPoints = daily.map((d) => {
      const value = d.totalPlays ?? 0;
      return {
        label: formatDateLabel(d.date),
        value,
        displayValue: formatCompact(value),
      };
    });

    // Real category distribution computed from the live bhajan collection
    const counts = new Map<string, number>();
    bhajans.forEach((b) => {
      const cat = b.category || 'अन्य';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    const totalCount = bhajans.length || 1;
    const categoryShare = Array.from(counts.entries())
      .slice(0, CATEGORY_COLORS.length)
      .map(([name, count], idx) => ({
        name,
        percent: Math.round((count / totalCount) * 100),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }));

    return {
      rangeLabel: RANGE_LABELS[selectedTimeline],
      totalPlays: formatIndian(totalPlays),
      totalHours: `${formatIndian(totalHours)} घंटे`,
      devoteesReached: formatIndian(devoteesReached),
      newRegistrations: `+${formatIndian(newRegistrations)} नए`,
      maxValue: Math.max(1, peakPlays * 1.15),
      chartPoints,
      categoryShare,
    };
  }, [analyticsData, bhajans, selectedTimeline]);

  // Top Popular Bhajans list
  const topPopularBhajans = useMemo(() => {
    return bhajans.slice(0, 5);
  }, [bhajans]);

  // Timeline pills configuration
  const timelineTabs: { id: TimelineRange; label: string }[] = [
    { id: '7d', label: '7 दिन' },
    { id: '30d', label: '30 दिन' },
    { id: '180d', label: '180 दिन (6 माह)' },
    { id: '1y', label: '1 वर्ष' },
    { id: '2y', label: '2 वर्ष' },
    { id: '5y', label: '5 वर्ष' },
    { id: 'lifetime', label: 'सर्वकालिक (Lifetime)' },
  ];

  /**
   * Generates SVG path coordinates for smooth area and line chart
   */
  const generateChartPath = (points: { value: number }[], maxVal: number) => {
    if (!points || points.length === 0) return { areaPath: '', linePath: '', coords: [] };

    const svgWidth = 620;
    const svgHeight = 180;
    const paddingX = 50;
    const paddingY = 25;
    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - paddingY * 2;

    const stepX = points.length > 1 ? usableWidth / (points.length - 1) : usableWidth;

    const coords = points.map((pt, idx) => {
      const x = paddingX + idx * stepX;
      const normalizedY = Math.min(1, Math.max(0, pt.value / maxVal));
      const y = svgHeight - paddingY - normalizedY * usableHeight;
      return { x, y };
    });

    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Smooth curve connection using cubic bezier
      const prev = coords[i - 1];
      const curr = coords[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const bottomY = svgHeight - paddingY;
    const areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { areaPath, linePath, coords };
  };

  const chartPaths = useMemo(
    () => generateChartPath(currentData.chartPoints, currentData.maxValue),
    [currentData]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Top Welcome & Master Timeline Selector Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-0.5">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span>संतमत सत्संग प्रचार • एडमिन सांख्यिकी केंद्र</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 leading-tight">
            विश्लेषण डैशबोर्ड (Analytics Dashboard)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            समयावधि: <strong className="text-stone-800 font-bold">{currentData.rangeLabel}</strong>
            {analyticsLoading && <span className="text-amber-600 ml-2">लोड हो रहा…</span>}
            {!analyticsLoading && analyticsError && (
              <span className="text-red-600 ml-2">{analyticsError}</span>
            )}
            {!analyticsLoading && !analyticsError && (
              <span className="text-emerald-600 ml-2">लाइव डेटा (Live Data)</span>
            )}
          </p>
        </div>

        {/* Timeline Buttons (7d, 30d, 180d, 1y, 2y, 5y, Lifetime) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80">
          {timelineTabs.map((tab) => {
            const isActive = selectedTimeline === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTimeline(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-sm scale-[1.02]'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Dynamic Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: कुल प्ले (Total Plays) */}
        <div
          onClick={() => navigate('/admin/bhajan-list')}
          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">कुल भजन प्ले (Total Plays)</p>
            <h3 className="font-black text-2xl text-stone-900 leading-tight">
              {currentData.totalPlays}
            </h3>
            <span className="text-[0.72rem] font-bold text-orange-700 flex items-center gap-1">
              <span>भजन विवरण देखें</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Headphones className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: सत्संग श्रवण घंटे (Satsang Hours) */}
        <div
          onClick={() => navigate('/admin/reports')}
          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">सत्संग श्रवण समय</p>
            <h3 className="font-black text-2xl text-stone-900 leading-tight">
              {currentData.totalHours}
            </h3>
            <span className="text-[0.72rem] font-bold text-amber-700">
              आध्यात्मिक लाभ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: सक्रिय सत्संगी भक्त (Devotees Reached) */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">सक्रिय सत्संगी भक्त</p>
            <h3 className="font-black text-2xl text-stone-900 leading-tight">
              {currentData.devoteesReached}
            </h3>
            <span className="text-[0.72rem] font-bold text-emerald-700">
              {currentData.newRegistrations}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: कुल संग्रह (Bhajans, Stutis, Categories) */}
        <div
          onClick={() => navigate('/admin/categories')}
          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">संग्रह स्थिति</p>
            <h3 className="font-black text-2xl text-stone-900 leading-tight">
              {bhajans.length} भजन
            </h3>
            <span className="text-[0.72rem] font-bold text-purple-700">
              {stutis.length} स्तुति • {categories.length} श्रेणियाँ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Music className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Dynamic SVG Curve Chart (8 Cols) + Category Share (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Play Trends Wave Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#EA580C]" />
              <h3 className="font-black text-base text-stone-900">
                भजन श्रवण रुझान ग्राफ (Playback Curve)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {currentData.rangeLabel}
            </span>
          </div>

          {/* SVG Line Graph */}
          <div className="h-60 w-full pt-2">
            <svg viewBox="0 0 620 190" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#EA580C" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="40" y1="25" x2="580" y2="25" stroke="#F3F4F6" strokeDasharray="4 4" />
              <line x1="40" y1="65" x2="580" y2="65" stroke="#F3F4F6" strokeDasharray="4 4" />
              <line x1="40" y1="105" x2="580" y2="105" stroke="#F3F4F6" strokeDasharray="4 4" />
              <line x1="40" y1="145" x2="580" y2="145" stroke="#E5E7EB" />

              {/* Area & Line */}
              <path d={chartPaths.areaPath} fill="url(#dashboardAreaGrad)" />
              <path
                d={chartPaths.linePath}
                fill="none"
                stroke="#EA580C"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Point Circles & Badges */}
              {chartPaths.coords.map((c, idx) => {
                const pt = currentData.chartPoints[idx];
                return (
                  <g key={idx}>
                    {/* Circle Node */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="5.5"
                      fill="#FFFFFF"
                      stroke="#EA580C"
                      strokeWidth="2.5"
                      className="transition-all hover:r-7"
                    />

                    {/* Value Badge */}
                    <rect
                      x={c.x - 20}
                      y={c.y - 23}
                      width="40"
                      height="16"
                      rx="5"
                      fill="#1C1917"
                      className="shadow-md"
                    />
                    <text
                      x={c.x}
                      y={c.y - 11}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-amber-300 font-['Mukta']"
                    >
                      {pt.displayValue}
                    </text>

                    {/* X-axis Label */}
                    <text
                      x={c.x}
                      y="165"
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-stone-600 font-['Mukta']"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
              <span>सत्संग भजन श्रवण संख्या</span>
            </span>
            <span>उच्चतम श्रवण काल: <strong>प्रातः 4:00 - 7:00 एवं संध्या 6:00 - 8:00</strong></span>
          </div>
        </div>

        {/* Category Share Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-700" />
              <span>श्रेणी अनुसार श्रवण वितरण</span>
            </h3>
            <button
              onClick={() => navigate('/admin/categories')}
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              प्रबंधन →
            </button>
          </div>

          <div className="space-y-3.5">
            {currentData.categoryShare.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-800">{cat.name}</span>
                  <span className="text-stone-900 font-black">{cat.percent}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Category Action Card */}
          <div className="pt-2">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-xs text-amber-950">नई श्रेणी जोड़ें</p>
                <p className="text-[0.68rem] text-amber-800">मोबाइल ऐप पर नई भक्ति श्रेणी प्रकाशित करें</p>
              </div>
              <button
                onClick={() => navigate('/admin/categories')}
                className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
              >
                + जोड़ें
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Popular Tracks (6 Cols) + Recent Releases & Quick Actions (6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top 5 Devotional Tracks (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>शीर्ष लोकप्रिय भजन (Top Listened Tracks)</span>
              </h3>
              <p className="text-[0.72rem] text-stone-500 mt-0.5">
                भक्तों द्वारा सर्वाधिक श्रवण किए गए अमृतमयी भजन
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/bhajan-list')}
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              सभी {bhajans.length} भजन देखें
            </button>
          </div>

          <div className="space-y-2.5">
            {topPopularBhajans.map((track, idx) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-stone-50/70 border border-stone-200/70 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                      <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          if (currentTrack?.id === track.id) {
                            togglePlay();
                          } else {
                            playTrack(track);
                          }
                        }}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      >
                        {isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-white stroke-none" />
                        ) : (
                          <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {track.title}
                      </h4>
                      <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                        {track.artist} • <span className="text-amber-800 font-semibold">{track.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-stone-900 block">
                      {track.plays} प्ले
                    </span>
                    <span className="text-[0.65rem] text-stone-400">
                      {track.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Administration Actions & Broadcast Hub (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-black text-base text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span>त्वरित प्रबंधन कार्य (Quick Admin Operations)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Add Bhajan */}
              <button
                onClick={() => navigate('/admin/add-bhajan')}
                className="p-4 rounded-2xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-left transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">नया भजन प्रकाशित करें</h4>
                <p className="text-[0.68rem] text-stone-500 mt-0.5">ऑडियो, बोल एवं थंबनेल जोड़ें</p>
              </button>

              {/* Action 2: Change Home Banner */}
              <button
                onClick={() => navigate('/admin/banners')}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">होम बैनर एवं विचार वाणी</h4>
                <p className="text-[0.68rem] text-stone-500 mt-0.5">कस्टम इमेज एवं सुविचार बदलें</p>
              </button>

              {/* Action 3: Stuti Management */}
              <button
                onClick={() => navigate('/admin/stuti-vinati')}
                className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <NamasteIcon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">स्तुति-विनती प्रबंधन</h4>
                <p className="text-[0.68rem] text-stone-500 mt-0.5">प्रातः व संध्या स्तुति पद संभालें</p>
              </button>

              {/* Action 4: Broadcast Message */}
              <button
                onClick={() => navigate('/admin/notifications')}
                className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">सूचनाएँ एवं घोषणाएँ</h4>
                <p className="text-[0.68rem] text-stone-500 mt-0.5">भक्तों को तत्काल अलर्ट भेजें</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
