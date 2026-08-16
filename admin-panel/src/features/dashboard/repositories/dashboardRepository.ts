import { collection, getDocs, query, limit, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../../../firebase/config';
import type { ActivityItemDTO, BhajanDTO, ChartDataDTO } from '../types';

const ACTIVITY_COLLECTIONS = ['audio', 'books', 'stuti_vinati', 'suvichar'] as const;

function docTimestamp(doc: { data: () => Record<string, any>; createTime?: { toMillis: () => number } }): number {
  const data = doc.data();
  if (data?.createdAt?.toMillis) return data.createdAt.toMillis();
  if (typeof data?.createdAt === 'number') return data.createdAt;
  if (doc.createTime?.toMillis) return doc.createTime.toMillis();
  return 0;
}

export const dashboardRepository = {
  async getCollectionCount(collectionName: string): Promise<number> {
    try {
      if (collectionName === 'users') {
        const currentUser = auth.currentUser;
        if (!currentUser) return 0;
        const tokenResult = await currentUser.getIdTokenResult();
        const claims = tokenResult.claims;
        const isAdmin = claims.admin === true ||
                        claims.role === 'developer_super_admin' ||
                        claims.role === 'client_super_admin';
        if (!isAdmin) return 0;
      }
      const colRef = collection(db, collectionName);
      const snapshot = await getCountFromServer(colRef);
      return snapshot.data().count;
    } catch {
      return 0;
    }
  },

  async getRecentActivities(): Promise<ActivityItemDTO[]> {
    const activities: ActivityItemDTO[] = [];

    await Promise.all(
      ACTIVITY_COLLECTIONS.map(async (collectionName) => {
        try {
          const colRef = collection(db, collectionName);
          const snapshot = await getDocs(query(colRef, limit(5)));
          snapshot.forEach((doc) => {
            const data = doc.data();
            activities.push({
              id: doc.id,
              type: collectionName === 'audio' ? 'audio' : collectionName === 'books' ? 'book' : collectionName,
              title: data.title || (collectionName === 'suvichar' ? 'New Suvichar' : 'New Item'),
              timestamp: docTimestamp(doc),
            } as ActivityItemDTO);
          });
        } catch {
          // Skip collections that fail
        }
      })
    );

    return activities
      .filter((a) => a.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  },

  async getTopBhajans(): Promise<BhajanDTO[]> {
    const bhajans: BhajanDTO[] = [];

    try {
      const audioRef = collection(db, 'audio');
      const audioQuery = query(audioRef, limit(50));
      const snapshot = await getDocs(audioQuery);

      snapshot.forEach((doc) => {
        const data = doc.data();
        bhajans.push({
          id: doc.id,
          title: data.title || 'Unknown Bhajan',
          plays: typeof data.plays === 'number' ? data.plays : 0,
          createdAt: docTimestamp(doc),
        });
      });
    } catch {
      // Return accumulated bhajans on error
    }

    return bhajans
      .sort((a, b) => b.plays - a.plays || b.createdAt - a.createdAt)
      .slice(0, 5);
  },

  async getAnalyticsData(dateRange: string): Promise<ChartDataDTO[]> {
    const days = dateRange === '30days' ? 30 : 7;
    const now = Date.now();
    const dayMs = 86400000;
    const start = now - days * dayMs;

    const bucketKey = (d: Date) =>
      days <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;

    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      buckets.set(bucketKey(d), 0);
    }

    await Promise.all(
      ACTIVITY_COLLECTIONS.map(async (collectionName) => {
        try {
          const colRef = collection(db, collectionName);
          const snapshot = await getDocs(query(colRef, limit(500)));
          snapshot.forEach((doc) => {
            const ts = docTimestamp(doc);
            if (ts >= start && ts <= now) {
              const key = bucketKey(new Date(ts));
              if (buckets.has(key)) {
                buckets.set(key, (buckets.get(key) ?? 0) + 1);
              }
            }
          });
        } catch {
          // Skip collections that fail
        }
      })
    );

    return [...buckets.entries()].map(([date, value]) => ({ date, value }));
  },
};
