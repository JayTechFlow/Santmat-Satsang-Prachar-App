/**
 * ============================================================================
 * Santmat Satsang Prachar - Admin Layout Component Tests
 * ============================================================================
 * Smoke tests for the redesigned admin layout components ensuring basic
 * rendering and functionality without breaking existing behavior.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../AdminLayout';
import { useSidebarState } from '../../../hooks/useSidebarState';

// Mock the sidebar state hook
vi.mock('../../../hooks/useSidebarState', () => ({
  useSidebarState: () => ({
    isOpen: true,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
  }),
}));

// Mock child components
vi.mock('../AdminSidebar', () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">Sidebar</div>,
}));

vi.mock('../AdminHeader', () => ({
  AdminHeader: () => <div data-testid="admin-header">Header</div>,
}));

vi.mock('../../shared/GlobalSearchModal', () => ({
  GlobalSearchModal: () => <div data-testid="global-search-modal">Search Modal</div>,
}));

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
  };
});

describe('AdminLayout', () => {
  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders the main layout structure', () => {
    renderWithRouter(<AdminLayout />);

    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = renderWithRouter(<AdminLayout />);

    expect(container.firstChild).toHaveClass('flex', 'min-h-screen', 'bg-background');
  });

  it('includes global search modal', () => {
    renderWithRouter(<AdminLayout />);

    expect(screen.getByTestId('global-search-modal')).toBeInTheDocument();
  });
});
