// Sprint M7.6 — Advanced Analytics Engine: Session Analytics Service

export interface UserSession {
  sessionId: string;
  userId: string;
  platform: 'android' | 'ios' | 'web' | 'desktop' | 'unknown';
  device: string;
  location: string;
  ipAddress?: string;
  startTime: string;
  lastHeartbeat: string;
  endTime?: string;
  durationSeconds: number;
  heartbeatCount: number;
  isBounced: boolean;
  active: boolean;
  exitPage?: string;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

export interface PlatformBreakdown {
  platform: string;
  count: number;
  percentage: number;
}

export interface GeoBreakdown {
  location: string;
  count: number;
  percentage: number;
}

export interface SessionMetrics {
  totalSessions: number;
  activeConcurrentSessions: number;
  uniqueUsersCount: number;
  avgDurationSeconds: number;
  bounceRate: number; // percentage of bounced sessions (0 - 100)
  platforms: PlatformBreakdown[];
  devices: DeviceBreakdown[];
  geography: GeoBreakdown[];
}

export class SessionAnalyticsService {
  private sessions: Map<string, UserSession> = new Map();
  private readonly BOUNCE_THRESHOLD_SECONDS = 15;

  /**
   * Start a new user session.
   */
  public startSession(
    userId: string,
    platform: UserSession['platform'] = 'web',
    device: string = 'Unknown Device',
    location: string = 'Unknown Location',
    ipAddress?: string
  ): UserSession {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const session: UserSession = {
      sessionId,
      userId,
      platform,
      device,
      location,
      ipAddress,
      startTime: now,
      lastHeartbeat: now,
      durationSeconds: 0,
      heartbeatCount: 1,
      isBounced: true, // initial state until longer duration or heartbeats
      active: true,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Record a session heartbeat to maintain activity.
   */
  public recordSessionHeartbeat(sessionId: string): UserSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || !session.active) return undefined;

    const now = new Date();
    const startTime = new Date(session.startTime);
    const durationSeconds = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / 1000));

    session.lastHeartbeat = now.toISOString();
    session.durationSeconds = durationSeconds;
    session.heartbeatCount += 1;

    if (durationSeconds >= this.BOUNCE_THRESHOLD_SECONDS || session.heartbeatCount > 2) {
      session.isBounced = false;
    }

    return session;
  }

  /**
   * End an active user session.
   */
  public endSession(sessionId: string, exitPage?: string): UserSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || !session.active) return undefined;

    const now = new Date();
    const startTime = new Date(session.startTime);
    const durationSeconds = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / 1000));

    session.endTime = now.toISOString();
    session.durationSeconds = durationSeconds;
    session.active = false;
    session.exitPage = exitPage;

    if (durationSeconds >= this.BOUNCE_THRESHOLD_SECONDS || session.heartbeatCount > 2) {
      session.isBounced = false;
    } else {
      session.isBounced = true;
    }

    return session;
  }

  /**
   * Get active concurrent sessions (sessions active within the last timeout window, e.g. 5 mins).
   */
  public getActiveSessions(timeoutSeconds: number = 300): UserSession[] {
    const cutoff = Date.now() - timeoutSeconds * 1000;
    const activeList: UserSession[] = [];

    for (const session of this.sessions.values()) {
      if (session.active) {
        const lastHb = new Date(session.lastHeartbeat).getTime();
        if (lastHb >= cutoff) {
          activeList.push(session);
        } else {
          // Auto-expire stale session
          session.active = false;
        }
      }
    }

    return activeList;
  }

  /**
   * Calculate aggregate session metrics.
   */
  public getSessionMetrics(): SessionMetrics {
    const allSessions = Array.from(this.sessions.values());
    const totalSessions = allSessions.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        activeConcurrentSessions: 0,
        uniqueUsersCount: 0,
        avgDurationSeconds: 0,
        bounceRate: 0,
        platforms: [],
        devices: [],
        geography: [],
      };
    }

    const activeSessions = this.getActiveSessions();
    const uniqueUsers = new Set(allSessions.map((s) => s.userId));

    let totalDuration = 0;
    let bouncedCount = 0;

    const platformMap: Map<string, number> = new Map();
    const deviceMap: Map<string, number> = new Map();
    const geoMap: Map<string, number> = new Map();

    for (const s of allSessions) {
      totalDuration += s.durationSeconds;
      if (s.isBounced) bouncedCount++;

      platformMap.set(s.platform, (platformMap.get(s.platform) || 0) + 1);
      deviceMap.set(s.device, (deviceMap.get(s.device) || 0) + 1);
      geoMap.set(s.location, (geoMap.get(s.location) || 0) + 1);
    }

    const platforms: PlatformBreakdown[] = Array.from(platformMap.entries()).map(
      ([platform, count]) => ({
        platform,
        count,
        percentage: Number(((count / totalSessions) * 100).toFixed(2)),
      })
    );

    const devices: DeviceBreakdown[] = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
      percentage: Number(((count / totalSessions) * 100).toFixed(2)),
    }));

    const geography: GeoBreakdown[] = Array.from(geoMap.entries()).map(([location, count]) => ({
      location,
      count,
      percentage: Number(((count / totalSessions) * 100).toFixed(2)),
    }));

    return {
      totalSessions,
      activeConcurrentSessions: activeSessions.length,
      uniqueUsersCount: uniqueUsers.size,
      avgDurationSeconds: Math.round(totalDuration / totalSessions),
      bounceRate: Number(((bouncedCount / totalSessions) * 100).toFixed(2)),
      platforms,
      devices,
      geography,
    };
  }

  /**
   * Get session by ID.
   */
  public getSession(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clear session data.
   */
  public clear(): void {
    this.sessions.clear();
  }
}
