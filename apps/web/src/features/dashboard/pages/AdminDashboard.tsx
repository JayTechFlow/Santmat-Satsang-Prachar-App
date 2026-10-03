/**
 * ============================================================================
 * Santmat Satsang Prachar - Enterprise Admin Dashboard
 * ============================================================================
 * Real operational dashboard. Every metric comes from Firestore or Cloud Functions.
 * No mock data, no hardcoded counts, no fabricated charts.
 *
 * Data sources:
 *   - Analytics: Cloud Function `analytics-getAnalyticsSummary` via reportService
 *   - Content: AppContext realtime subscriptions (bhajans, stutis, categories,
 *              suvichars, notifications, playlists)
 *   - Books/Banners: One-shot reads via bookService/bannerService
 *   - RBAC: PermissionContext for role-based section gating
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  effectiveRangeDays,
  RANGE_LABELS,
  timelineLabel,
  type TimelineRange,
} from '../analytics/timelineRange';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Users,
  Headphones,
  Clock,
  TrendingUp,
  BarChart3,
  Award,
  Sparkles,
  FolderTree,
  Play,
  Pause,
  Layers,
  Smartphone,
  BookOpen,
  BookMarked,
  Image,
  MessageSquare,
  Bell,
  ListMusic,
  Shield,
  CircleAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { usePermissions } from '../../../app/providers/PermissionContext';
import { reportService } from '../services/reportService';
import type { AnalyticsSummaryPayload } from '../analytics/types';
import { resolveRange, shiftDayKey, todayUtc } from '../analytics/dateRange';
import { formatDuration, formatIndian as formatIndianShared } from '../analytics/format';
import { bookService } from '../../books/services/bookService';
import { bannerService } from '../../banners/services/bannerService';
import { StatCard } from '../components/StatCard';
import { QuickAction } from '../components/QuickAction';
import { NamasteIcon } from '../../../components/shared/DevotionalIcons';
import { AdminPageHeader } from '../../../components/admin';

// ── Timeline Types ──────────────────────────────────────────────────────────

const CATEGORY_COLORS = ['#EA580C', '#D97706', '#B45309', '#9333EA', '#059669', '#0D9488', '#DC2626', '#7C3AED'];

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatIndian = (n: number | null | undefined): string =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('en-IN').format(n);

const formatCompact = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

const formatDateLabel = (dateStr: string): string => {
  // Analytics day keys are UTC calendar days; formatting them without an
  // explicit UTC timezone would shift them by a day for most operators.
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
};

// ── Main Dashboard ──────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    bhajans, stutis, categories, suvichars, notifications, playlists,
    playTrack, currentTrack, isPlaying, togglePlay,
    dataLoading: appDataLoading, dataError: appDataError,
  } = useApp();
  const { hasPermission, isDeveloperSuperAdmin } = usePermissions();

  // ── Timeline State ──────────────────────────────────────────────────────
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineRange>('7d');

  // ── Analytics (Cloud Function) ──────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummaryPayload | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    // Resolve the window through the shared UTC helper instead of duplicating
    // local-time date maths here. 'lifetime' and the multi-year presets are
    // clamped to the server's maximum range instead of requesting a window the
    // backend would reject.
    const bounded = effectiveRangeDays(selectedTimeline);
    const range = resolveRange('custom', {
      startDate: shiftDayKey(todayUtc(), -(bounded - 1)),
      endDate: todayUtc(),
    });

    const query: { startDate?: string; endDate?: string; pageSize?: number } = {};
    query.startDate = range.startDate;
    query.endDate = range.endDate;
    query.pageSize = Math.min(bounded, 62);

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

    return () => { cancelled = true; };
  }, [selectedTimeline]);

  useEffect(() => {
    const cleanup = fetchAnalytics();
    return cleanup;
  }, [fetchAnalytics]);

  // ── One-Shot Counts (Books + Banners) ──────────────────────────────────
  const [booksCount, setBooksCount] = useState<number | null>(null);
  const [bannersCount, setBannersCount] = useState<number | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCountsLoading(true);

    Promise.all([
      bookService.getBooks().catch(() => []),
      bannerService.getBanners().then((res) => res.success ? res.data ?? [] : []).catch(() => []),
    ]).then(([books, banners]) => {
      if (cancelled) return;
      setBooksCount(books.length);
      setBannersCount(banners.length);
      setCountsLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // ── Computed KPIs ──────────────────────────────────────────────────────

  const analyticsKpis = useMemo(() => {
    // Period totals come from the server so the dashboard cannot report a
    // different figure from the Reports page for the same window, and cannot
    // silently describe a paginated slice as the whole range.
    const current = analyticsData?.current;
    const coverage = current?.coverage;
    return {
      totalPlays: coverage?.plays ? current.totalPlays : null,
      totalHours: coverage?.playtime ? Math.round(current.totalListenDurationSeconds / 3600) : null,
      peakActive: coverage?.activeUsers ? current.uniqueActiveUsers : null,
      newRegistrations: coverage?.registrations ? current.newRegistrations : null,
    };
  }, [analyticsData]);

  // ── Top 5 Popular Bhajans (sorted by plays, NOT creation date) ─────────

  const topBhajans = useMemo(() => {
    return [...bhajans]
      .sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0))
      .slice(0, 5);
  }, [bhajans]);

  // ── Category Distribution ──────────────────────────────────────────────

  const categoryShare = useMemo(() => {
    const counts = new Map<string, number>();
    bhajans.forEach((b) => {
      const cat = b.category || 'अन्य';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    const totalCount = bhajans.length || 1;
    return Array.from(counts.entries())
      .slice(0, CATEGORY_COLORS.length)
      .map(([name, count], idx) => ({
        name,
        percent: Math.round((count / totalCount) * 100),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }));
  }, [bhajans]);

  // ── Chart Data ─────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    const daily = analyticsData?.daily ?? [];
    const peakPlays = daily.reduce((max, d) => Math.max(max, d.totalPlays ?? 0), 0);
    const points = daily.map((d) => ({
      label: formatDateLabel(d.date),
      value: d.totalPlays ?? 0,
      displayValue: formatCompact(d.totalPlays ?? 0),
    }));
    return { points, maxValue: Math.max(1, peakPlays * 1.15) };
  }, [analyticsData]);

  // ── Chart SVG Path Generation ──────────────────────────────────────────

  const chartPaths = useMemo(() => {
    const points = chartData.points;
    const maxVal = chartData.maxValue;
    if (!points || points.length === 0) return { areaPath: '', linePath: '', coords: [] as { x: number; y: number }[] };

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
  }, [chartData]);

  // ── Alerts / Attention Items ────────────────────────────────────────────

  const alerts = useMemo(() => {
    const items: { id: string; text: string; severity: 'warning' | 'info'; route?: string }[] = [];

    const unreadNotifs = notifications.filter((n) => !n.isRead).length;
    if (unreadNotifs > 0) {
      items.push({
        id: 'unread-notifs',
        text: `${unreadNotifs} अपठित सूचनाएँ`,
        severity: 'warning',
        route: '/admin/notifications',
      });
    }

    if (bhajans.length > 0) {
      const noAudio = bhajans.filter((b) => !b.audioUrl).length;
      if (noAudio > 0) {
        items.push({
          id: 'no-audio',
          text: `${noAudio} भजनों में ऑडियो फ़ाइल नहीं`,
          severity: 'warning',
          route: '/admin/bhajan-list',
        });
      }
    }

    if (bhajans.length > 0) {
      const noLyrics = bhajans.filter((b) => !b.lyrics || b.lyrics.trim() === '').length;
      if (noLyrics > 0) {
        items.push({
          id: 'no-lyrics',
          text: `${noLyrics} भजनों में बोल/lyrics नहीं`,
          severity: 'info',
          route: '/admin/bhajan-list',
        });
      }
    }

    if (bhajans.length > 0) {
      const noImage = bhajans.filter((b) => !b.imageUrl).length;
      if (noImage > 0) {
        items.push({
          id: 'no-image',
          text: `${noImage} भजनों में थंबनेल नहीं`,
          severity: 'info',
          route: '/admin/bhajan-list',
        });
      }
    }

    return items;
  }, [notifications, bhajans]);

  // ── Content Health ──────────────────────────────────────────────────────

  const contentHealth = useMemo(() => {
    const items = [
      { label: 'भजन', count: bhajans.length, route: '/admin/bhajan-list', icon: <Music className="w-4 h-4" /> },
      { label: 'स्तुति', count: stutis.length, route: '/admin/stuti-vinati', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'पुस्तकें', count: booksCount ?? 0, route: '/admin/books', icon: <BookMarked className="w-4 h-4" />, loading: booksCount === null },
      { label: 'सुविचार', count: suvichars.length, route: '/admin/banners', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'बैनर', count: bannersCount ?? 0, route: '/admin/banners', icon: <Image className="w-4 h-4" />, loading: bannersCount === null },
      { label: 'श्रेणियाँ', count: categories.length, route: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
      { label: 'प्लेलिस्ट', count: playlists.length, route: '/admin/playlists', icon: <ListMusic className="w-4 h-4" /> },
    ];
    return items;
  }, [bhajans, stutis, booksCount, suvichars, bannersCount, categories, playlists]);

  // ── Quick Actions (role-gated) ─────────────────────────────────────────

  const quickActions = useMemo(() => {
    const actions: { label: string; description: string; icon: React.ReactNode; route: string; color: string; permission?: string }[] = [];

    if (hasPermission('audio.upload')) {
      actions.push({
        label: 'नया भजन प्रकाशित करें',
        description: 'ऑडियो, बोल एवं थंबनेल जोड़ें',
        icon: <Music className="w-5 h-5" />,
        route: '/admin/add-bhajan',
        color: 'bg-[#EA580C]',
        permission: 'audio.upload',
      });
    }
    if (hasPermission('audio.manage')) {
      actions.push({
        label: 'भजन प्रबंधन',
        description: 'भजन सूची देखें एवं संपादित करें',
        icon: <ListMusic className="w-5 h-5" />,
        route: '/admin/bhajan-list',
        color: 'bg-orange-600',
        permission: 'audio.manage',
      });
    }
    if (hasPermission('stuti.manage')) {
      actions.push({
        label: 'स्तुति-विनती प्रबंधन',
        description: 'प्रातः व संध्या स्तुति पद संभालें',
        icon: <NamasteIcon className="w-5 h-5" />,
        route: '/admin/stuti-vinati',
        color: 'bg-purple-600',
        permission: 'stuti.manage',
      });
    }
    if (hasPermission('banners.manage')) {
      actions.push({
        label: 'होम बैनर एवं विचार वाणी',
        description: 'कस्टम इमेज एवं सुविचार बदलें',
        icon: <Layers className="w-5 h-5" />,
        route: '/admin/banners',
        color: 'bg-amber-600',
        permission: 'banners.manage',
      });
    }
    if (hasPermission('books.manage')) {
      actions.push({
        label: 'पुस्तक प्रबंधन',
        description: 'PDF पुस्तकें अपलोड एवं प्रबंधित करें',
        icon: <BookMarked className="w-5 h-5" />,
        route: '/admin/books',
        color: 'bg-emerald-600',
        permission: 'books.manage',
      });
    }
    if (hasPermission('notifications.manage')) {
      actions.push({
        label: 'सूचनाएँ एवं घोषणाएँ',
        description: 'भक्तों को तत्काल अलर्ट भेजें',
        icon: <Smartphone className="w-5 h-5" />,
        route: '/admin/notifications',
        color: 'bg-emerald-700',
        permission: 'notifications.manage',
      });
    }
    if (hasPermission('users.view')) {
      actions.push({
        label: 'उपयोगकर्ता प्रबंधन',
        description: 'सत्संगी भक्त समुदाय देखें',
        icon: <Users className="w-5 h-5" />,
        route: '/admin/users',
        color: 'bg-sky-600',
        permission: 'users.view',
      });
    }
    if (hasPermission('reports.view')) {
      actions.push({
        label: 'विस्तृत रिपोर्ट',
        description: 'एनालिटिक्स एवं प्रदर्शन रिपोर्ट देखें',
        icon: <BarChart3 className="w-5 h-5" />,
        route: '/admin/reports',
        color: 'bg-indigo-600',
        permission: 'reports.view',
      });
    }

    return actions;
  }, [hasPermission]);

  // ── Timeline Tabs ──────────────────────────────────────────────────────

  const timelineTabs: { id: TimelineRange; label: string }[] = [
    { id: '7d', label: '7 दिन' },
    { id: '30d', label: '30 दिन' },
    { id: '180d', label: '180 दिन' },
    { id: '1y', label: '1 वर्ष' },
    { id: '2y', label: '2 वर्ष' },
    { id: '5y', label: '5 वर्ष' },
    { id: 'lifetime', label: 'सर्वकालिक' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Canonical AdminPageHeader + Timeline Selector            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminPageHeader
        title="विश्लेषण डैशबोर्ड (Analytics Dashboard)"
        badgeText="संतमत सत्संग प्रचार • एडमिन सांख्यिकी केंद्र"
        badgeVariant="primary"
        icon={<TrendingUp className="w-4 h-4" />}
        subtitle={
          <span>
            समयावधि: <strong className="text-stone-800 font-bold">{timelineLabel(selectedTimeline)}</strong>
            {analyticsLoading && <span className="text-stone-500 ml-2">लोड हो रहा…</span>}
            {!analyticsLoading && analyticsError && (
              <span className="text-red-600 ml-2" role="alert">{analyticsError}</span>
            )}
            {!analyticsLoading && !analyticsError && (
              <span className="text-emerald-600 ml-2">लाइव डेटा (Live Data)</span>
            )}
          </span>
        }
        actions={
          <nav aria-label="समयावधि चयन" className="flex flex-wrap items-center gap-1 bg-stone-100/80 p-1.5 rounded-[0.625rem] border border-stone-200/80 shrink-0">
            {timelineTabs.map((tab) => {
              const isActive = selectedTimeline === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTimeline(tab.id)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded-[0.625rem] text-xs font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/40 cursor-pointer ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Analytics KPI Strip (4 cards from Cloud Function)       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="एनालिटिक्स सांख्यिकी" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={formatIndian(analyticsKpis.totalPlays)}
          label="कुल भजन प्ले (Total Plays)"
          icon={<Headphones className="w-6 h-6" />}
          drillDown="/admin/bhajan-list"
          loading={analyticsLoading}
          error={!!analyticsError}
          onRetry={fetchAnalytics}
          iconBg="bg-orange-50 border-orange-200 text-orange-600"
        />
        <StatCard
          value={analyticsKpis.totalHours === null ? '—' : `${formatIndian(analyticsKpis.totalHours)} घंटे`}
          label="सत्संग श्रवण समय (Listening Hours)"
          icon={<Clock className="w-6 h-6" />}
          drillDown="/admin/reports"
          loading={analyticsLoading}
          error={!!analyticsError}
          onRetry={fetchAnalytics}
          iconBg="bg-amber-50 border-amber-200 text-amber-700"
        />
        <StatCard
          value={formatIndian(analyticsKpis.peakActive)}
          label="सक्रिय सत्संगी भक्त (Active Devotees)"
          icon={<Users className="w-6 h-6" />}
          trend={analyticsKpis.newRegistrations !== null && analyticsKpis.newRegistrations > 0 ? { value: `+${formatIndian(analyticsKpis.newRegistrations)} नए`, positive: true } : undefined}
          drillDown="/admin/users"
          loading={analyticsLoading}
          error={!!analyticsError}
          onRetry={fetchAnalytics}
          iconBg="bg-emerald-50 border-emerald-200 text-emerald-700"
        />
        <StatCard
          value={`${formatIndian(bhajans.length)} भजन`}
          label="संग्रह स्थिति (Collection Status)"
          icon={<Music className="w-6 h-6" />}
          trend={{ value: `${stutis.length} स्तुति • ${categories.length} श्रेणियाँ`, positive: true }}
          drillDown="/admin/categories"
          loading={appDataLoading}
          error={!!appDataError}
          iconBg="bg-purple-50 border-purple-200 text-purple-700"
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Alerts / Attention Center                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {alerts.length > 0 && (
        <section aria-label="ध्यान दें" className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CircleAlert className="w-5 h-5 text-amber-700" aria-hidden="true" />
            <h2 className="font-black text-sm text-amber-900">ध्यान दें (Attention Required)</h2>
            <span className="ml-auto text-[0.68rem] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => alert.route && navigate(alert.route)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  alert.route ? 'hover:bg-amber-100/70 cursor-pointer' : 'cursor-default'
                } ${
                  alert.severity === 'warning' ? 'bg-amber-100/50 border border-amber-200' : 'bg-stone-50 border border-stone-200'
                }`}
              >
                <CircleAlert className={`w-4 h-4 shrink-0 ${
                  alert.severity === 'warning' ? 'text-amber-700' : 'text-stone-500'
                }`} aria-hidden="true" />
                <span className="text-xs font-bold text-stone-800">{alert.text}</span>
                {alert.route && (
                  <span className="ml-auto text-[0.68rem] font-bold text-amber-800 hover:underline shrink-0">
                    देखें →
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Content Overview (health counts)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="सामग्री स्वास्थ्य" className="bg-white rounded-xl p-4 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <h2 className="font-black text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>सामग्री स्वास्थ्य (Content Health)</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {contentHealth.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-white hover:shadow-xs transition-all text-center group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1 text-stone-500 group-hover:text-[#EA580C] transition-colors">
                {item.icon}
              </div>
              <p className="font-black text-lg text-stone-900 leading-tight">
                {item.loading ? (
                  <span className="inline-block w-8 h-5 bg-stone-200 rounded animate-pulse" />
                ) : (
                  formatIndian(item.count)
                )}
              </p>
              <p className="text-[0.68rem] font-bold text-stone-500 mt-0.5">{item.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Playback Trend Chart + Category Distribution            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Playback Trend Chart (8 cols) */}
        <section aria-label="भजन श्रवण रुझान" className="lg:col-span-8 bg-white rounded-xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#EA580C]" aria-hidden="true" />
              <h3 className="font-black text-base text-stone-900">
                भजन श्रवण रुझान ग्राफ (Playback Curve)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {timelineLabel(selectedTimeline)}
            </span>
          </div>

          {analyticsLoading ? (
            <div className="h-60 w-full flex items-center justify-center" aria-busy="true">
              <div className="text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto" />
                <p className="text-xs text-stone-500">चार्ट लोड हो रहा…</p>
              </div>
            </div>
          ) : analyticsError ? (
            <div className="h-60 w-full flex items-center justify-center" role="alert">
              <p className="text-xs text-red-600">{analyticsError}</p>
            </div>
          ) : chartData.points.length === 0 ? (
            <div className="h-60 w-full flex items-center justify-center">
              <p className="text-xs text-stone-500">इस समयावधि में कोई डेटा नहीं</p>
            </div>
          ) : (
            <div className="h-60 w-full pt-2" role="img" aria-label="भजन श्रवण रुझान ग्राफ">
              <svg viewBox="0 0 620 190" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#EA580C" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="40" y1="25" x2="580" y2="25" stroke="#F3F4F6" strokeDasharray="4 4" />
                <line x1="40" y1="65" x2="580" y2="65" stroke="#F3F4F6" strokeDasharray="4 4" />
                <line x1="40" y1="105" x2="580" y2="105" stroke="#F3F4F6" strokeDasharray="4 4" />
                <line x1="40" y1="145" x2="580" y2="145" stroke="#E5E7EB" />

                <path d={chartPaths.areaPath} fill="url(#dashboardAreaGrad)" />
                <path
                  d={chartPaths.linePath}
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPaths.coords.map((c, idx) => {
                  const pt = chartData.points[idx];
                  return (
                    <g key={idx}>
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="5.5"
                        fill="#FFFFFF"
                        stroke="#EA580C"
                        strokeWidth="2.5"
                      />
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
          )}

          <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" aria-hidden="true" />
            <span>सत्संग भजन श्रवण संख्या</span>
          </div>
        </section>

        {/* Category Distribution (4 cols) */}
        <section aria-label="श्रेणी अनुसार वितरण" className="lg:col-span-4 bg-white rounded-xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>श्रेणी वितरण (Category Distribution)</span>
            </h3>
            <button
              onClick={() => navigate('/admin/categories')}
              className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
            >
              प्रबंधन →
            </button>
          </div>

          {categoryShare.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-stone-500">कोई भजन उपलब्ध नहीं</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryShare.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-800">{cat.name}</span>
                    <span className="text-stone-900 font-black">{cat.percent}%</span>
                  </div>
                  <div
                    className="h-2 bg-stone-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={cat.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name}: ${cat.percent}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-xs text-amber-950">नई श्रेणी जोड़ें</p>
                <p className="text-[0.68rem] text-amber-800">मोबाइल ऐप पर नई भक्ति श्रेणी प्रकाशित करें</p>
              </div>
              <button
                onClick={() => navigate('/admin/categories')}
                className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-[0.625rem] text-xs font-bold shadow-xs shrink-0 cursor-pointer"
              >
                + जोड़ें
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: Top Popular Bhajans (6 cols) + Quick Actions (6 cols)   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top 5 Bhajans by Plays (6 cols) */}
        <section aria-label="शीर्ष लोकप्रिय भजन" className="lg:col-span-6 bg-white rounded-xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <span>शीर्ष लोकप्रिय भजन (Top by Plays)</span>
              </h3>
              <p className="text-[0.72rem] text-stone-500 mt-0.5">
                भक्तों द्वारा सर्वाधिक श्रवण किए गए अमृतमयी भजन
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/bhajan-list')}
              className="text-xs font-bold text-amber-800 hover:underline shrink-0 cursor-pointer"
            >
              सभी {bhajans.length} भजन देखें →
            </button>
          </div>

          {topBhajans.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-stone-500">कोई भजन उपलब्ध नहीं</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topBhajans.map((track) => {
                const isPlayingThis = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-stone-50/70 border border-stone-200/70 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-stone-200">
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
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label={isPlayingThis ? `${track.title} रोकें` : `${track.title} चलाएँ`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4 fill-white stroke-none" />
                          ) : (
                            <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                          )}
                        </button>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-stone-900 truncate">{track.title}</h4>
                        <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                          {track.artist} • <span className="text-amber-800 font-semibold">{track.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-stone-900 block">
                        {formatIndian(track.plays ?? 0)} प्ले
                      </span>
                      <span className="text-[0.65rem] text-stone-400">{track.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Admin Actions (6 cols) */}
        <section aria-label="त्वरित कार्य" className="lg:col-span-6 bg-white rounded-xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-black text-base text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="w-5 h-5 text-orange-600" aria-hidden="true" />
            <span>त्वरित प्रबंधन कार्य (Quick Actions)</span>
          </h3>

          {quickActions.length === 0 ? (
            <div className="py-8 text-center">
              <Shield className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500">आपकी भूमिका के लिए कोई त्वरित कार्य उपलब्ध नहीं</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickAction
                  key={action.route}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                  route={action.route}
                  color={action.color}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
