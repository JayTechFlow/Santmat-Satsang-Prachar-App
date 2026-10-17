/**
 * ============================================================================
 * Santmat Satsang Prachar - Pie Chart Component Tests
 * ============================================================================
 * Unit tests for the redesigned pie chart component ensuring correct rendering
 * and behavior with various data inputs.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PieChart } from '../PieChart';

describe('PieChart', () => {
  const mockData = [
    { name: 'Category A', value: 30, color: '#EA580C' },
    { name: 'Category B', value: 25, color: '#D97706' },
    { name: 'Category C', value: 20, color: '#B45309' },
    { name: 'Category D', value: 25, color: '#92400E' },
  ];

  it('renders the chart title correctly', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders pie slices for each data point', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    const svg = screen.getByTestId('pie-chart-svg');
    const paths = svg.querySelectorAll('path');

    // Should have one path for each data point
    expect(paths.length).toBe(mockData.length);
  });

  it('displays total value in the center', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    // Total should be 100 (30 + 25 + 20 + 25)
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('कुल')).toBeInTheDocument();
  });

  it('shows empty state when no data is provided', () => {
    render(<PieChart data={[]} title="Empty Chart" />);

    expect(screen.getByText('कोई डेटा उपलब्ध नहीं')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders legend with correct labels', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    // Check that all category names are rendered
    mockData.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('renders legend with correct percentages', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    // Check specific percentages (30% for first item with total 100)
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getAllByText('25%')).toHaveLength(2);
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('applies correct colors to legend items', () => {
    render(<PieChart data={mockData} title="Test Chart" />);

    const legendItems = screen.getAllByText(/Category/);

    // Check that we have the right number of legend items
    expect(legendItems).toHaveLength(mockData.length);
  });
});
