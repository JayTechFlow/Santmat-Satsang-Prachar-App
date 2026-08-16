import { useState } from 'react';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { StatCard } from '../features/dashboard/components/StatCard';
import { AnalyticsChart } from '../features/dashboard/components/AnalyticsChart';
import { ActivityFeed } from '../features/dashboard/components/ActivityFeed';
import { TopBhajansList } from '../features/dashboard/components/TopBhajansList';
import { ContentDistribution } from '../features/dashboard/components/ContentDistribution';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { PlusCircle, Music, Bell, BookOpen, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiyaIcon } from '../components/ui/DiyaIcon';

export function Dashboard() {
  const { data, loading, error, isEmpty, setDateFilter, refetch } = useDashboardData();
  const [selectedTimeline, setSelectedTimeline] = useState<'7d' | '30d' | '180d' | '1y' | 'lifetime'>('7d');

  if (loading) {
    return <LoadingOverlay message="डैशबोर्ड डेटा लोड हो रहा है..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="डैशबोर्ड लोड करने में विफल"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="कोई डेटा उपलब्ध नहीं है"
        message="वर्तमान में प्रदर्शित करने के लिए डैशबोर्ड में कोई डेटा नहीं है।"
      />
    );
  }

  const handleTimelineChange = (timeline: '7d' | '30d' | '180d' | '1y' | 'lifetime') => {
    setSelectedTimeline(timeline);
    if (timeline === '7d') setDateFilter('7days');
    else setDateFilter('30days');
  };

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      {/* Top Banner & Timeline Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
            <DiyaIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
              संतमत सत्संग प्रचार - एडमिन ओवरव्यू
            </h1>
            <p className="text-xs text-stone-600 font-medium">
              प्लेटफॉर्म गतिविधि, सामग्री स्वास्थ्य एवं भक्त जुड़ाव सांख्यिकी
            </p>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: '7d', label: '7 दिन' },
            { id: '30d', label: '30 दिन' },
            { id: '180d', label: '6 माह' },
            { id: '1y', label: '1 वर्ष' },
            { id: 'lifetime', label: 'सर्वकालिक' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTimelineChange(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedTimeline === item.id
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/audio"
          className="flex items-center gap-2.5 p-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-xs font-bold text-xs hover:opacity-95 transition-all no-underline"
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया भजन जोड़ें</span>
        </Link>

        <Link
          to="/stuti-vinati"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200 hover:border-amber-300 text-stone-800 rounded-xl shadow-xs font-bold text-xs transition-all no-underline"
        >
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>स्तुति प्रबंधन</span>
        </Link>

        <Link
          to="/notifications"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200 hover:border-amber-300 text-stone-800 rounded-xl shadow-xs font-bold text-xs transition-all no-underline"
        >
          <Bell className="w-4 h-4 text-amber-700" />
          <span>सूचनाएँ भेजें</span>
        </Link>

        <Link
          to="/users"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200 hover:border-amber-300 text-stone-800 rounded-xl shadow-xs font-bold text-xs transition-all no-underline"
        >
          <Users className="w-4 h-4 text-amber-700" />
          <span>भक्त समुदाय</span>
        </Link>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, index) => (
          <StatCard key={`${stat.label}-${index}`} stat={stat} />
        ))}
      </div>

      {/* Main Grid: Analytics Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-base text-stone-900">
                भक्ति भजन स्ट्रीम एवं श्रोता रुझान
              </h2>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              लाइव सिंक
            </span>
          </div>
          <AnalyticsChart data={data.analytics} />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-stone-900">
              हाल की गतिविधियाँ
            </h2>
          </div>
          <ActivityFeed activities={data.activities} />
        </div>
      </div>

      {/* Secondary Grid: Top Songs & Content Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Music className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold text-base text-stone-900">
              सर्वाधिक सुने गए प्रिय भजन
            </h2>
          </div>
          <TopBhajansList bhajans={data.topBhajans} />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <ContentDistribution stats={data.stats} />
        </div>
      </div>
    </div>
  );
}