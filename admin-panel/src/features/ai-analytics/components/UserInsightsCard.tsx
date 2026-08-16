// Sprint M7.7 — User Insights Component

import { Users, UserCheck, Heart } from 'lucide-react';
import type { UserInsights } from '../types/aiAnalytics.types';

interface UserInsightsCardProps {
  insights: UserInsights;
}

export function UserInsightsCard({ insights }: UserInsightsCardProps) {
  return (
    <div className="card flex-col gap-6">
      <div className="card-header border-b pb-4">
        <div className="flex items-center gap-3">
          <Users size={22} color="var(--warning)" />
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>User Insights & Personalization Distribution</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              User retention, preference distribution, engagement segments, and personalized user adoption
            </p>
          </div>
        </div>
        <span className="badge badge-warning">Behavioral Analytics</span>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Total Registered Users</span>
          <span className="text-xl font-semibold text-heading">{insights.totalUsers.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Active Listening Users</span>
          <span className="text-xl font-semibold text-heading">{insights.activeUsers.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Personalized Users</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>{insights.personalizedUsersPct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">30-Day Retention Rate</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--success)' }}>{insights.retentionRate30dPct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Churn Risk Users</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--danger)' }}>{insights.churnRiskCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* User Engagement Segments */}
        <div className="bg-background p-4 rounded-md flex-col gap-4">
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
            <UserCheck size={16} color="var(--primary)" /> Engagement Segments
          </h4>
          <div className="flex-col gap-3">
            <div>
              <div className="flex-between text-xs mb-1">
                <span className="font-semibold text-heading">Power Listeners (&gt;10 hrs/wk)</span>
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>{insights.userEngagementSegments.powerUsersPct}%</span>
              </div>
              <div className="bg-surface rounded-md overflow-hidden" style={{ height: 8 }}>
                <div style={{ height: '100%', width: `${insights.userEngagementSegments.powerUsersPct}%`, backgroundColor: 'var(--primary)' }} />
              </div>
            </div>

            <div>
              <div className="flex-between text-xs mb-1">
                <span className="font-semibold text-heading">Regular Satsangi (2-10 hrs/wk)</span>
                <span className="font-semibold text-heading">{insights.userEngagementSegments.regularUsersPct}%</span>
              </div>
              <div className="bg-surface rounded-md overflow-hidden" style={{ height: 8 }}>
                <div style={{ height: '100%', width: `${insights.userEngagementSegments.regularUsersPct}%`, backgroundColor: 'var(--info)' }} />
              </div>
            </div>

            <div>
              <div className="flex-between text-xs mb-1">
                <span className="font-semibold text-heading">Casual Listeners (&lt;2 hrs/wk)</span>
                <span className="font-semibold text-muted">{insights.userEngagementSegments.casualUsersPct}%</span>
              </div>
              <div className="bg-surface rounded-md overflow-hidden" style={{ height: 8 }}>
                <div style={{ height: '100%', width: `${insights.userEngagementSegments.casualUsersPct}%`, backgroundColor: 'var(--border-focus)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Category Distribution */}
        <div className="bg-background p-4 rounded-md flex-col gap-4">
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
            <Heart size={16} color="var(--danger)" /> User Category Preference Distribution
          </h4>
          <div className="flex-col gap-3">
            {insights.preferredCategoryDistribution.map((item, idx) => (
              <div key={idx} className="flex-col gap-1">
                <div className="flex-between text-xs">
                  <span className="font-semibold text-heading">{item.category}</span>
                  <span className="text-muted">{item.userCount.toLocaleString()} users ({item.percentage}%)</span>
                </div>
                <div className="bg-surface rounded-md overflow-hidden" style={{ height: 6 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--info)' : idx === 2 ? 'var(--success)' : 'var(--warning)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
