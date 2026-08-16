export interface SupportTicket {
  id: string;
  subject: string;
  category: 'bug' | 'feature_request' | 'content_issue' | 'account_access' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  message: string;
  submittedBy: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateSupportTicketDto = Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
