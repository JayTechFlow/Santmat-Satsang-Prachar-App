// Sprint M7.7 — Search Metrics Component

import { Search, AlertCircle, TrendingUp } from 'lucide-react';
import type { SearchMetrics } from '../types/aiAnalytics.types';

interface SearchMetricsCardProps {
  metrics: SearchMetrics;
}

export function SearchMetricsCard({ metrics }: SearchMetricsCardProps) {
  return (
    <div className="card flex-col gap-6">
      <div className="card-header border-b pb-4">
        <div className="flex items-center gap-3">
          <Search size={22} color="var(--info)" />
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Search Metrics & Analytics</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Full-text search, query latency, autocomplete click-throughs, and zero-result search tracking
            </p>
          </div>
        </div>
        <span className="badge badge-info">Firestore Vector + Token Indexing</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Total Searches</span>
          <span className="text-xl font-semibold text-heading">{metrics.totalSearches.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Search Click-Through Rate</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--info)' }}>{metrics.searchCtrPct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Avg Query Latency</span>
          <span className="text-xl font-semibold text-heading">{metrics.avgSearchLatencyMs} ms</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Zero-Result Query Rate</span>
          <span className="text-xl font-semibold" style={{ color: metrics.zeroResultRatePct > 5 ? 'var(--danger)' : 'var(--success)' }}>
            {metrics.zeroResultRatePct}%
          </span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Autocomplete CTR</span>
          <span className="text-xl font-semibold text-heading">{metrics.autocompleteClickRatePct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Top Search Queries */}
        <div className="flex-col gap-3">
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
            <TrendingUp size={16} color="var(--info)" /> Top Search Queries
          </h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Searches</th>
                  <th>Results</th>
                  <th>CTR</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topSearchQueries.map((q, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-heading">"{q.query}"</td>
                    <td>{q.searchCount.toLocaleString()}</td>
                    <td>{q.resultCount}</td>
                    <td><span className="badge badge-info">{q.ctrPct}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero Result Queries */}
        <div className="flex-col gap-3">
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2" style={{ color: 'var(--warning)' }}>
            <AlertCircle size={16} /> Zero-Result Search Queries (Content Gaps)
          </h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Missing Query</th>
                  <th>Search Count</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {metrics.zeroResultQueries.map((zq, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-heading">"{zq.query}"</td>
                    <td>{zq.searchCount.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Add Content Tags</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
