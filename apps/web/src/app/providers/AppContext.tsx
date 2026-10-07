import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import { Bhajan, StutiItem, NotificationItem, Playlist, CategoryItem } from '../../types/common/index';
import { BhajanEntity, StutiEntity, CategoryEntity, NotificationEntity } from '../../types/common/index';
import { bhajanService } from '../../features/audio/services/bhajanService';
import { stutiService } from '../../features/stuti/services/stutiService';
import { categoryService } from '../../features/categories/services/categoryService';
import { notificationService } from '../../features/notifications/services/notificationService';
import { playlistService } from '../../features/playlists/services/playlistService';
import { storageService } from '../../services/storage/storageService';

/**
 * Application Context State Definition (Admin Portal)
 * Real Firestore-backed collections, empty initial state, and a lightweight
 * HTML5 audio preview. No mock data, no PIN auth, no mobile preview state.
 */
interface AppContextType {

  // Audio Playback (HTML5 preview of published tracks)
  currentTrack: Bhajan | StutiItem | null;
  isPlaying: boolean;
  playTrack: (track: Bhajan | StutiItem) => void;
  togglePlay: () => void;

  // Data Collections
  bhajans: Bhajan[];
  stutis: StutiItem[];
  categories: CategoryItem[];
  addCategory: (category: Omit<CategoryItem, 'id'>) => void;
  updateCategory: (id: string, data: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  notifications: NotificationItem[];
  addNotification: (item: Omit<NotificationItem, 'id' | 'date' | 'isRead'>) => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  playlists: Playlist[];
  createPlaylist: (name: string, initialBhajanId?: string) => Promise<string>;
  toggleBhajanInPlaylist: (playlistId: string, bhajanId: string) => void;
  addBhajan: (bhajan: Omit<Bhajan, 'id' | 'plays' | 'addedDate'>) => void;
  updateBhajan: (id: string, data: Partial<Bhajan>) => void;
  deleteBhajan: (id: string) => void;

  // Backend Data Loading & Error State
  dataLoading: boolean;
  dataError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Real data collections (empty initial state — Firestore is the source of truth)
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [stutis, setStutis] = useState<StutiItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Playback state (HTML5 audio preview)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Bhajan | StutiItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const ensureAudio = (): HTMLAudioElement => {
    if (!audioRef.current) {
      const el = new Audio();
      el.addEventListener('ended', () => setIsPlaying(false));
      el.addEventListener('error', () => setIsPlaying(false));
      audioRef.current = el;
    }
    return audioRef.current;
  };

  const playTrack = (track: Bhajan | StutiItem) => {
    const el = ensureAudio();
    setCurrentTrack(track);
    if (!track.audioUrl) {
      setIsPlaying(false);
      return;
    }
    el.src = track.audioUrl;
    el.currentTime = 0;
    el.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    const el = ensureAudio();
    if (!currentTrack || !currentTrack.audioUrl) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Connect Real-Time Firebase Subscriptions
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    setDataLoading(true);
    setDataError(null);
    let loaded = 0;
    const total = 6;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= total) setDataLoading(false);
    };

    const unsubBhajans = bhajanService.subscribeBhajans(
      (data: BhajanEntity[]) => {
        setBhajans(data);
        markLoaded();
      },
      () => {
        setDataError('भजन डेटा लोड करने में त्रुटि');
        markLoaded();
      }
    );
    const unsubStuti = stutiService.subscribeStuti(
      (data: StutiEntity[]) => {
        setStutis(data);
        markLoaded();
      },
      () => {
        setDataError('स्तुति डेटा लोड करने में त्रुटि');
        markLoaded();
      }
    );
    const unsubCategories = categoryService.subscribeCategories(
      (data: CategoryEntity[]) => {
        setCategories(data);
        markLoaded();
      },
      () => {
        setDataError('श्रेणी डेटा लोड करने में त्रुटि');
        markLoaded();
      }
    );
    let unsubNotifications: (() => void) | null = null;
    const startNotificationsSub = (uid?: string) => {
      if (unsubNotifications) {
        unsubNotifications();
      }
      unsubNotifications = notificationService.subscribeNotifications(
        uid,
        (data: NotificationEntity[]) => {
          setNotifications(data);
          markLoaded();
        },
        () => {
          setDataError('सूचना डेटा लोड करने में त्रुटि');
          markLoaded();
        }
      );
    };

    startNotificationsSub(auth.currentUser?.uid);

    let unsubPlaylists: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      startNotificationsSub(user?.uid);
      if (user) {
        if (!unsubPlaylists) {
          unsubPlaylists = playlistService.subscribePlaylists(
            (data) => {
              setPlaylists(data);
              markLoaded();
            },
            () => {
              setDataError('प्लेलिस्ट डेटा लोड करने में त्रुटि');
              markLoaded();
            }
          );
        }
      } else {
        if (unsubPlaylists) {
          unsubPlaylists();
          unsubPlaylists = null;
        }
        setPlaylists([]);
        markLoaded();
      }
    });

    return () => {
      unsubBhajans();
      unsubStuti();
      unsubCategories();
      if (unsubNotifications) unsubNotifications();
      if (unsubPlaylists) {
        unsubPlaylists();
      }
      unsubAuth();
    };
  }, []);

  const addBhajan = (data: Omit<Bhajan, 'id' | 'plays' | 'addedDate'>) => {
    const payload: Omit<BhajanEntity, 'id'> = {
      ...data,
      plays: 0,
      addedDate: new Date().toISOString().split('T')[0]
    };
    bhajanService.addBhajan(payload).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'भजन सहेजने में त्रुटि');
      }
    });
  };

  const updateBhajan = (id: string, data: Partial<Bhajan>) => {
    bhajanService.updateBhajan(id, data).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'भजन अपडेट में त्रुटि');
      }
    });
    setBhajans((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));

    if (currentTrack && currentTrack.id === id) {
      setCurrentTrack((prev) => (prev ? ({ ...prev, ...data } as Bhajan) : null));
    }
  };

  const deleteBhajan = (id: string) => {
    const bhajan = bhajans.find((b) => b.id === id);
    if (bhajan?.storagePath) {
      storageService.deleteFile(bhajan.storagePath).catch((err) => {
        console.warn('Storage file deletion failed during cascade:', err);
      });
    }
    bhajanService.deleteBhajan(id).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'भजन हटाने में त्रुटि');
      }
    });
    setBhajans((prev) => prev.filter((b) => b.id !== id));
  };

  const addCategory = (catData: Omit<CategoryItem, 'id'>) => {
    categoryService.addCategory(catData).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'श्रेणी सहेजने में त्रुटि');
      }
    });
  };

  const updateCategory = (id: string, data: Partial<CategoryItem>) => {
    categoryService.updateCategory(id, data).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'श्रेणी अपडेट में त्रुटि');
      }
    });
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)));
  };

  const deleteCategory = (id: string) => {
    categoryService.deleteCategory(id).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'श्रेणी हटाने में त्रुटि');
      }
    });
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'date' | 'isRead'>) => {
    notificationService
      .addNotification({
        ...item,
        date: new Date().toISOString(),
      })
      .then((res) => {
        if (!res.success) {
          setDataError(res.error || 'सूचना सहेजने में त्रुटि');
        }
      });
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'सूचना हटाने में त्रुटि');
      }
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAllNotifications = () => {
    const ids = notifications.map((n) => n.id);
    ids.forEach((id) => {
      notificationService.deleteNotification(id).then((res) => {
        if (!res.success) {
          setDataError(res.error || 'सूचना हटाने में त्रुटि');
        }
      });
    });
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn('Cannot mark notification as read: user not authenticated');
      return;
    }
    notificationService.markAsRead(id, uid).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'सूचना पठन में अपडेट में त्रुटि');
      }
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn('Cannot mark all notifications as read: user not authenticated');
      return;
    }
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;
    notificationService.markAllAsRead(uid, unreadIds).then((res) => {
      if (!res.success) {
        setDataError(res.error || 'सभी सूचनाएँ पठन में अपडेट में त्रुटि');
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const createPlaylist = async (name: string, initialBhajanId?: string): Promise<string> => {
    const res = await playlistService.createPlaylist(name.trim() || 'मेरी प्लेलिस्ट', initialBhajanId ? [initialBhajanId] : []);
    if (!res.success) {
      setDataError(res.error || 'प्लेलिस्ट बनाने में त्रुटि');
    }
    return res.data?.id || '';
  };

  const toggleBhajanInPlaylist = (playlistId: string, bhajanId: string) => {
    setPlaylists((prev) => {
      const target = prev.find((pl) => pl.id === playlistId);
      if (!target) return prev;
      const exists = target.bhajanIds.includes(bhajanId);
      const nextIds = exists
        ? target.bhajanIds.filter((id) => id !== bhajanId)
        : [...target.bhajanIds, bhajanId];
      playlistService.updatePlaylist(playlistId, { bhajanIds: nextIds }).then((res) => {
        if (!res.success) {
          setDataError(res.error || 'प्लेलिस्ट अपडेट में त्रुटि');
        }
      });
      return prev.map((pl) => (pl.id === playlistId ? { ...pl, bhajanIds: nextIds } : pl));
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        bhajans,
        stutis,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        notifications,
        addNotification,
        deleteNotification,
        deleteAllNotifications,
        markAsRead,
        markAllAsRead,
        playlists,
        createPlaylist,
        toggleBhajanInPlaylist,
        addBhajan,
        updateBhajan,
        deleteBhajan,
        dataLoading,
        dataError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
