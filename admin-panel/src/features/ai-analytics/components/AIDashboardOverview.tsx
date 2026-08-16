// Sprint M7.7 — AI Dashboard Overview Header Component

import { Sparkles, Target, Search, Cpu, TrendingUp, Users, PlayCircle, Layers } from 'lucide-react';
import type { AIPersonalizationDashboardData } from '../types/aiAnalytics.types';

interface AIDashboardOverviewProps {
  data: AIPersonalizationDashboardData;
}

export function AIDashboardOverview({ data }: AIDashboardOverviewProps) {
  return (
    <div className="flex-col gap-6">
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(232, 116, 18, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          borderColor: 'rgba(232, 116, 18, 0.2)',
        }}
      >
        <div className="flex-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-heading" style={{ margin: 0 }}>
                AI & Personalization Engine Console
              </h2>
              <p className="text-sm text-muted" style={{ margin: '2px 0 0 0' }}>
                Real-time recommendation performance, vector search telemetry, ML inference throughput, and engagement analytics.
              </p>
            </div>
          </div>
          <div className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Timeframe: {data.period.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Top 7 Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Rec CTR Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Recommendation CTR</span>
            <Target size={18} color="var(--primary)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.recommendations.recommendationCtrPct}%
          </div>
          <div className="text-xs text-muted">
            Hit Rate: <strong className="text-heading">{data.recommendations.algorithmHitRatePct}%</strong> ({data.recommendations.totalRecommendations.toLocaleString()} recs)
          </div>
        </div>

        {/* Search Latency Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Search Performance</span>
            <Search size={18} color="var(--info)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.search.avgSearchLatencyMs} <span className="text-sm font-medium text-muted">ms avg</span>
          </div>
          <div className="text-xs text-muted">
            CTR: <strong className="text-heading">{data.search.searchCtrPct}%</strong> | Zero Results: <strong className="text-heading">{data.search.zeroResultRatePct}%</strong>
          </div>
        </div>

        {/* AI Inferences Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">AI Inferences</span>
            <Cpu size={18} color="#8B5CF6" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.ai.totalInferences.toLocaleString()}
          </div>
          <div className="text-xs text-muted">
            Est Cost: <strong className="text-heading">${data.ai.estimatedCostUSD}</strong> | Accuracy: <strong className="text-heading">{data.ai.modelAccuracyPct}%</strong>
          </div>
        </div>

        {/* Trending Velocity Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Trending Viral Items</span>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.trending.viralItemsCount}
          </div>
          <div className="text-xs text-muted">
            Top Category: <strong className="text-heading">{data.trending.topCategoriesByVelocity[0]?.category || 'Bhajans'}</strong>
          </div>
        </div>

        {/* Personalized Users Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Personalized User Ratio</span>
            <Users size={18} color="var(--warning)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.userInsights.personalizedUsersPct}%
          </div>
          <div className="text-xs text-muted">
            Active Users: <strong className="text-heading">{data.userInsights.activeUsers.toLocaleString()}</strong>
          </div>
        </div>

        {/* Playback Watch Time Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Total Watch Time</span>
            <PlayCircle size={18} color="var(--primary)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {data.playbackAnalytics.totalWatchTimeHours.toLocaleString()} <span className="text-sm font-medium text-muted">hrs</span>
          </div>
          <div className="text-xs text-muted">
            Completion: <strong className="text-heading">{data.playbackAnalytics.overallCompletionRatePct}%</strong>
          </div>
        </div>

        {/* Top Category Shares Card */}
        <div className="card flex-col gap-2">
          <div className="flex-between">
            <span className="text-xs text-muted font-medium">Category Views</span>
            <Layers size={18} color="var(--info)" />
          </div>
          <div className="text-xl font-semibold text-heading" style={{ fontSize: '1.6rem' }}>
            {(data.categoryAnalytics.categoryViews.reduce((acc, c) => acc + c.views, 0)).toLocaleString()}
          </div>
          <div className="text-xs text-muted">
            Top Shares: <strong className="text-heading">{data.categoryAnalytics.totalCategoryShares[0]?.category || 'Suvichar'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
