/**
 * ============================================================================
 * Santmat Satsang Prachar - Quick Action Component Tests
 * ============================================================================
 * Unit tests for the redesigned quick action component ensuring correct
 * rendering and behavior in different states.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuickAction } from '../QuickAction';
import { Users } from 'lucide-react';

describe('QuickAction', () => {
  const mockIcon = <Users />;
  const mockRoute = '/admin/users';

  it('renders correctly with label and description', () => {
    render(
      <BrowserRouter>
        <QuickAction
          label="User Management"
          description="Manage users and permissions"
          icon={mockIcon}
          route={mockRoute}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage users and permissions')).toBeInTheDocument();
  });

  it('applies correct styling when disabled', () => {
    render(
      <BrowserRouter>
        <QuickAction
          label="User Management"
          description="Manage users and permissions"
          icon={mockIcon}
          route={mockRoute}
          disabled={true}
        />
      </BrowserRouter>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('applies correct styling when enabled', () => {
    render(
      <BrowserRouter>
        <QuickAction
          label="User Management"
          description="Manage users and permissions"
          icon={mockIcon}
          route={mockRoute}
        />
      </BrowserRouter>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:shadow-md');
    expect(button).toHaveClass('cursor-pointer');
  });

  it('uses default color when none provided', () => {
    render(
      <BrowserRouter>
        <QuickAction
          label="User Management"
          description="Manage users and permissions"
          icon={mockIcon}
          route={mockRoute}
        />
      </BrowserRouter>
    );

    const iconContainer = screen.getByTestId('quick-action-icon-container');
    expect(iconContainer).toHaveClass('bg-brand/10');
    expect(iconContainer).toHaveClass('text-brand');
  });

  it('applies custom color when provided', () => {
    render(
      <BrowserRouter>
        <QuickAction
          label="User Management"
          description="Manage users and permissions"
          icon={mockIcon}
          route={mockRoute}
          color="bg-blue-100 text-blue-600"
        />
      </BrowserRouter>
    );

    const iconContainer = screen.getByTestId('quick-action-icon-container');
    expect(iconContainer).toHaveClass('bg-blue-100');
    expect(iconContainer).toHaveClass('text-blue-600');
  });
});
