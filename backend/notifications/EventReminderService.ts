// Sprint M7.5 — Notification Intelligence: Event Reminder Service

export interface SatsangEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String
  endTime?: string;   // ISO String
  location?: string;
  isLiveStream?: boolean;
  streamUrl?: string;
  speaker?: string;
  topicId?: string;
  tags?: string[];
  reminderOffsetsMinutes?: number[]; // e.g. [1440, 60, 15] for 24h, 1h, 15m
}

export interface UserEventRSVP {
  eventId: string;
  userId: string;
  status: 'going' | 'maybe' | 'declined';
  timestamp: string;
}

export interface ScheduledReminder {
  id: string;
  eventId: string;
  userId?: string;
  topicId?: string;
  scheduledTime: string; // ISO String
  offsetMinutes: number;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  payload: {
    title: string;
    message: string;
    targetScreen: string;
    eventId: string;
    offsetMinutes: number;
    [key: string]: any;
  };
}

export interface ProcessedReminderBatchResult {
  processedCount: number;
  sentReminders: ScheduledReminder[];
  failedReminders: ScheduledReminder[];
  timestamp: string;
}

export class EventReminderService {
  private events: Map<string, SatsangEvent> = new Map();
  private userRSVPs: Map<string, Map<string, UserEventRSVP>> = new Map(); // eventId -> (userId -> RSVP)
  private scheduledReminders: Map<string, ScheduledReminder> = new Map(); // reminderId -> ScheduledReminder

  constructor() {}

  // --- Event Management ---

  public registerEvent(event: SatsangEvent): SatsangEvent {
    if (!event || !event.id) {
      throw new Error('Event must have a valid id');
    }

    const defaultOffsets = event.reminderOffsetsMinutes || [1440, 60, 15]; // 24 hours, 1 hour, 15 minutes before
    const normalized: SatsangEvent = {
      ...event,
      topicId: event.topicId || 'satsang_announcements',
      reminderOffsetsMinutes: defaultOffsets,
      tags: (event.tags || []).map((t) => t.toLowerCase().trim()),
    };

    this.events.set(normalized.id, normalized);
    this.scheduleEventReminders(normalized.id);
    return normalized;
  }

  public updateEvent(update: Partial<SatsangEvent> & { id: string }): SatsangEvent | undefined {
    const existing = this.events.get(update.id);
    if (!existing) return undefined;

    const timeChanged = update.startTime && update.startTime !== existing.startTime;
    const updated: SatsangEvent = {
      ...existing,
      ...update,
    };

    this.events.set(updated.id, updated);

    if (timeChanged) {
      this.cancelEventReminders(updated.id);
      this.scheduleEventReminders(updated.id);
    }

    return updated;
  }

  public cancelEvent(eventId: string, reason?: string): boolean {
    const existing = this.events.get(eventId);
    if (!existing) return false;

    this.cancelEventReminders(eventId);
    this.events.delete(eventId);
    return true;
  }

  public getEvent(eventId: string): SatsangEvent | undefined {
    return this.events.get(eventId);
  }

  public listUpcomingEvents(fromTime?: string, limit: number = 20): SatsangEvent[] {
    const reference = fromTime ? new Date(fromTime).getTime() : Date.now();
    return Array.from(this.events.values())
      .filter((e) => new Date(e.startTime).getTime() >= reference)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }

  // --- RSVP / Attendance Tracking ---

  public registerUserRSVP(
    eventId: string,
    userId: string,
    rsvpStatus: 'going' | 'maybe' | 'declined'
  ): UserEventRSVP {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event with id ${eventId} not found`);
    }

    if (!this.userRSVPs.has(eventId)) {
      this.userRSVPs.set(eventId, new Map());
    }

    const rsvp: UserEventRSVP = {
      eventId,
      userId,
      status: rsvpStatus,
      timestamp: new Date().toISOString(),
    };

    this.userRSVPs.get(eventId)!.set(userId, rsvp);
    return rsvp;
  }

  public getUserRSVP(eventId: string, userId: string): UserEventRSVP | undefined {
    const eventRSVPs = this.userRSVPs.get(eventId);
    if (!eventRSVPs) return undefined;
    return eventRSVPs.get(userId);
  }

  public getEventAttendees(eventId: string): string[] {
    const eventRSVPs = this.userRSVPs.get(eventId);
    if (!eventRSVPs) return [];
    const attendees: string[] = [];
    for (const rsvp of eventRSVPs.values()) {
      if (rsvp.status === 'going' || rsvp.status === 'maybe') {
        attendees.push(rsvp.userId);
      }
    }
    return attendees;
  }

  // --- Dynamic Reminders Scheduling & Execution ---

  public scheduleEventReminders(
    eventId: string,
    offsetsInMinutes?: number[]
  ): ScheduledReminder[] {
    const event = this.events.get(eventId);
    if (!event) return [];

    const offsets = offsetsInMinutes || event.reminderOffsetsMinutes || [1440, 60, 15];
    const eventStartTime = new Date(event.startTime).getTime();
    const createdReminders: ScheduledReminder[] = [];

    for (const offset of offsets) {
      const scheduledTimeMs = eventStartTime - offset * 60 * 1000;
      const scheduledTime = new Date(scheduledTimeMs).toISOString();

      let humanTimeLabel = `${offset} minutes`;
      if (offset >= 1440) {
        humanTimeLabel = `${Math.round(offset / 1440)} day(s)`;
      } else if (offset >= 60) {
        humanTimeLabel = `${Math.round(offset / 60)} hour(s)`;
      }

      const reminder: ScheduledReminder = {
        id: `rem_${eventId}_${offset}m`,
        eventId,
        topicId: event.topicId || 'satsang_announcements',
        scheduledTime,
        offsetMinutes: offset,
        status: 'pending',
        payload: {
          title: `Upcoming Satsang: ${event.title}`,
          message: `${event.title} is starting in ${humanTimeLabel}.${event.location ? ` Location: ${event.location}` : ''}`,
          targetScreen: 'StutiVinati',
          eventId: event.id,
          offsetMinutes: offset,
          isLiveStream: !!event.isLiveStream,
          streamUrl: event.streamUrl,
        },
      };

      this.scheduledReminders.set(reminder.id, reminder);
      createdReminders.push(reminder);
    }

    return createdReminders;
  }

  public cancelEventReminders(eventId: string): void {
    for (const [id, rem] of this.scheduledReminders.entries()) {
      if (rem.eventId === eventId) {
        rem.status = 'cancelled';
        this.scheduledReminders.set(id, rem);
      }
    }
  }

  public getPendingReminders(asOfTime?: string): ScheduledReminder[] {
    const refMs = asOfTime ? new Date(asOfTime).getTime() : Date.now();
    return Array.from(this.scheduledReminders.values()).filter(
      (r) => r.status === 'pending' && new Date(r.scheduledTime).getTime() <= refMs
    );
  }

  public processDueReminders(currentTime: Date = new Date()): ProcessedReminderBatchResult {
    const dueReminders = this.getPendingReminders(currentTime.toISOString());
    const sentReminders: ScheduledReminder[] = [];
    const failedReminders: ScheduledReminder[] = [];

    for (const rem of dueReminders) {
      try {
        rem.status = 'sent';
        sentReminders.push(rem);
      } catch (err) {
        rem.status = 'failed';
        failedReminders.push(rem);
      }
    }

    return {
      processedCount: dueReminders.length,
      sentReminders,
      failedReminders,
      timestamp: currentTime.toISOString(),
    };
  }
}
