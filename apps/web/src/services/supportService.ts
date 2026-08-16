import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import { ServiceResponse } from '../types';

/**
 * Backend contract: admin-panel supportRepository targets the `support_tickets` collection.
 * The `submittedBy` field is always bound to the signed-in user's uid (server-enforced by
 * Firestore security rules); it is never accepted as client input.
 */
const COLLECTION_NAME = 'support_tickets';

export interface SupportTicketEntity {
  id: string;
  subject: string;
  category: 'bug' | 'feature_request' | 'content_issue' | 'account_access' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  message: string;
  submittedBy: string;
  contactEmail: string;
  createdAt: string;
  updatedAt?: string;
}

export type NewSupportTicket = Omit<SupportTicketEntity, 'id' | 'status' | 'createdAt' | 'submittedBy'>;

const TICKET_CATEGORIES: SupportTicketEntity['category'][] = ['bug', 'feature_request', 'content_issue', 'account_access', 'general'];
const TICKET_PRIORITIES: SupportTicketEntity['priority'][] = ['low', 'medium', 'high', 'urgent'];

export class SupportService {
  subscribeTickets(callback: (tickets: SupportTicketEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: SupportTicketEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SupportTicketEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Support ticket subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Support ticket subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async getTickets(): Promise<ServiceResponse<SupportTicketEntity[]>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const data: SupportTicketEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SupportTicketEntity, 'id'>)
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch support tickets' };
    }
  }

  async createTicket(ticket: NewSupportTicket): Promise<ServiceResponse<SupportTicketEntity>> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'Not authenticated' };
      }
      if (!ticket.category || !TICKET_CATEGORIES.includes(ticket.category)) {
        return { success: false, error: 'Invalid ticket category' };
      }
      if (!ticket.priority || !TICKET_PRIORITIES.includes(ticket.priority)) {
        return { success: false, error: 'Invalid ticket priority' };
      }
      if (!ticket.subject.trim() || !ticket.message.trim()) {
        return { success: false, error: 'Subject and message are required' };
      }

      const payload: Omit<SupportTicketEntity, 'id'> = {
        subject: ticket.subject.trim().slice(0, 300),
        category: ticket.category,
        priority: ticket.priority,
        status: 'open',
        message: ticket.message.trim().slice(0, 5000),
        submittedBy: uid,
        contactEmail: ticket.contactEmail ? ticket.contactEmail.trim().slice(0, 200) : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      return { success: true, data: { id: docRef.id, ...payload } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create support ticket' };
    }
  }

  async updateTicket(id: string, updates: Partial<SupportTicketEntity>): Promise<ServiceResponse<void>> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update support ticket' };
    }
  }

  async deleteTicket(id: string): Promise<ServiceResponse<void>> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete support ticket' };
    }
  }
}

export const supportService = new SupportService();
