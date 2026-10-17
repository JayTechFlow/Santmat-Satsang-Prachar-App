/**
 * ============================================================================
 * Santmat Satsang Prachar - Stat Card Component Tests
 * ============================================================================
 * Unit tests for the redesigned stat card component ensuring correct rendering
 * and behavior in different states (loading, error, normal).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatCard } from '../StatCard';
import { TrendingUp, Users } from 'lucide-react';

describe('StatCard', () => {
  const mockIcon = <Users />;

  it('renders correctly with value and label', () => {
    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders trend indicator when provided', () => {
    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
          trend={{ value: '12%', positive: true }}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('पिछले 30 दिनों में')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
          loading={true}
        />
      </BrowserRouter>
    );

    // Should show skeleton instead of actual content
    expect(screen.getByText('', { selector: '.animate-pulse' })).toBeInTheDocument();
  });

  it('shows error state when error is true', () => {
    const retryMock = vi.fn();

    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
          error={true}
          onRetry={retryMock}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('डेटा लोड होने में समस्या')).toBeInTheDocument();
    expect(screen.getByText('पुनः प्रयास करें')).toBeInTheDocument();
  });

  it('renders custom trend label when provided', () => {
    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
          trend={{ value: '5%', positive: false }}
          trendLabel="पिछले सप्ताह में"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('पिछले सप्ताह में')).toBeInTheDocument();
  });

  it('applies custom icon background class when provided', () => {
    render(
      <BrowserRouter>
        <StatCard
          value="1,234"
          label="Total Users"
          icon={mockIcon}
          iconBg="bg-blue-100"
        />
      </BrowserRouter>
    );

    const iconContainer = screen.getByTestId('stat-card-icon-container');
    expect(iconContainer).toHaveClass('bg-blue-100');
  });
});
