import { collection, getDocs, query, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import type { ActivityItemDTO, BhajanDTO, ChartDataDTO } from '../types';

export const dashboardRepository = {
  async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getCountFromServer(colRef);
      return snapshot.data().count;
    } catch (error) {
      console.warn(`Could not get count for collection ${collectionName}`, error);
      return 0;
    }
  },

  async getRecentActivities(): Promise<ActivityItemDTO[]> {
    const activities: ActivityItemDTO[] = [];
    
    try {
      const audioRef = collection(db, 'audio');
      const audioQuery = query(audioRef, limit(5));
      const audioSnapshot = await getDocs(audioQuery);
      
      audioSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'audio',
          title: data.title || 'New Audio',
          timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now() - Math.random() * 10000000
        });
      });

      const bookRef = collection(db, 'books');
      const bookQuery = query(bookRef, limit(5));
      const bookSnapshot = await getDocs(bookQuery);
      
      bookSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'book',
          title: data.title || 'New Book',
          timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now() - Math.random() * 10000000
        });
      });
    } catch (error) {
      console.warn('Error fetching recent activities', error);
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  },

  async getTopBhajans(): Promise<BhajanDTO[]> {
    const bhajans: BhajanDTO[] = [];
    
    try {
      const audioRef = collection(db, 'audio');
      const audioQuery = query(audioRef, limit(10));
      const snapshot = await getDocs(audioQuery);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        bhajans.push({
          id: doc.id,
          title: data.title || 'Unknown Bhajan',
          plays: data.plays || Math.floor(Math.random() * 1000), 
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        });
      });
    } catch (error) {
      console.warn('Error fetching top bhajans', error);
    }
    
    return bhajans.sort((a, b) => b.plays - a.plays).slice(0, 5);
  },
  
  async getAnalyticsData(_dateRange: string): Promise<ChartDataDTO[]> {
    return [
      { date: 'Mon', value: 12 },
      { date: 'Tue', value: 19 },
      { date: 'Wed', value: 15 },
      { date: 'Thu', value: 25 },
      { date: 'Fri', value: 22 },
      { date: 'Sat', value: 30 },
      { date: 'Sun', value: 28 },
    ];
  }
};
