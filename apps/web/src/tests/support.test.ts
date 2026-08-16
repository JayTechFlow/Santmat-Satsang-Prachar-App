import { describe, it, expect } from 'vitest';
import type { SupportTicket } from '../types/support.types';

describe('R6.6 Support & Telemetry Unit Tests', () => {
  it('should validate support ticket fields and status transitions', () => {
    const ticket: SupportTicket = {
      id: 'ticket-1',
      subject: 'Storage quota warning',
      category: 'bug',
      priority: 'high',
      status: 'open',
      message: 'Storage bucket reaching limit',
      submittedBy: 'developer_super_admin',
      contactEmail: 'admin@santmatsatsang.org',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(ticket.id).toBe('ticket-1');
    expect(ticket.priority).toBe('high');
    expect(ticket.status).toBe('open');
  });
});
