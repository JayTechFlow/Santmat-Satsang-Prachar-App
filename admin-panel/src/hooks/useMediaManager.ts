// Enterprise Media Platform — Custom Hooks & Upload Manager
// Sprint M2 — React state hooks for Media Library & Upload Queue management

import { useState, useCallback, useEffect, useRef } from 'react';
import { storage, auth } from '../firebase/config';
import { FirebaseStorageProvider } from '../core/media/providers/FirebaseStorageProvider';
import { MediaUploadPipeline } from '../core/media/pipeline/MediaUploadPipeline';
import { mediaService } from '../core/services/mediaService';
import {
  MediaType,
  MediaFolder,
  MediaCategory,
  MediaVisibility,
  type MediaAsset,
} from '../core/media/types/media.types';

import type { UploadTaskControl } from '../core/media/interfaces/IMediaStorageProvider';

export interface UploadQueueItem {
  id: string;
  file: File;
  type: MediaType;
  category: MediaCategory;
  folder: MediaFolder;
  title?: string;
  description?: string;
  visibility?: MediaVisibility;
  tags?: string[];
  linkedEntityId?: string;
  linkedEntityType?: string;
  progress: number;
  status: 'queued' | 'uploading' | 'paused' | 'completed' | 'error' | 'duplicate' | 'canceled';
  errorMessage?: string;
  asset?: MediaAsset;
  retryCount: number;
  taskControl?: UploadTaskControl;
  allowDuplicate?: boolean;
}

export function useMediaUploadManager() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const activeUploadId = useRef<string | null>(null);

  const storageProviderRef = useRef(new FirebaseStorageProvider(storage));
  const pipelineRef = useRef(
    new MediaUploadPipeline(
      storageProviderRef.current,
      async () => {
        const user = auth.currentUser;
        if (!user) return false;
        const idToken = await user.getIdTokenResult();
        const role = idToken.claims['role'] as string;
        return role === 'developer_super_admin' || role === 'client_super_admin';
      }
    )
  );

  const addToQueue = useCallback((files: File[], options: {
    type?: MediaType;
    category?: MediaCategory;
    folder?: MediaFolder;
    visibility?: MediaVisibility;
    tags?: string[];
    linkedEntityId?: string;
    linkedEntityType?: string;
  } = {}) => {
    const newItems: UploadQueueItem[] = files.map((file) => {
      let type: MediaType = options.type ?? MediaType.DOCUMENT;
      if (file.type.startsWith('image/')) type = MediaType.IMAGE;
      else if (file.type.startsWith('audio/')) type = MediaType.AUDIO;
      else if (file.type === 'application/pdf') type = MediaType.PDF;
      else if (file.type.startsWith('video/')) type = MediaType.VIDEO;

      let folder: MediaFolder = options.folder ?? MediaFolder.DOCUMENTS;
      if (type === MediaType.IMAGE) folder = MediaFolder.IMAGES;
      else if (type === MediaType.AUDIO) folder = MediaFolder.AUDIO;
      else if (type === MediaType.PDF) folder = MediaFolder.BOOKS;
      else if (type === MediaType.VIDEO) folder = MediaFolder.VIDEOS;

      return {
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        type,
        category: options.category ?? MediaCategory.GENERAL,
        folder,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        visibility: options.visibility ?? MediaVisibility.AUTHENTICATED,
        tags: options.tags ?? [],
        linkedEntityId: options.linkedEntityId,
        linkedEntityType: options.linkedEntityType,
        progress: 0,
        status: 'queued',
        retryCount: 0,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const updateQueueItem = useCallback((id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && item.taskControl && item.status === 'uploading') {
        item.taskControl.cancel();
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((item) => item.status !== 'completed'));
  }, []);

  const pauseUpload = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id && item.status === 'uploading') {
          item.taskControl?.pause();
          return { ...item, status: 'paused' };
        }
        return item;
      })
    );
  }, []);

  const resumeUpload = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id && item.status === 'paused') {
          item.taskControl?.resume();
          return { ...item, status: 'uploading' };
        }
        return item;
      })
    );
  }, []);

  const cancelUpload = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === 'uploading' || item.status === 'paused') {
            item.taskControl?.cancel();
          }
          return { ...item, status: 'canceled', errorMessage: 'Upload canceled by user' };
        }
        return item;
      })
    );
  }, []);

  const retryUpload = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'queued',
              progress: 0,
              errorMessage: undefined,
              retryCount: item.retryCount + 1,
            }
          : item
      )
    );
  }, []);

  const forceUpload = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              allowDuplicate: true,
              status: 'queued',
              progress: 0,
              errorMessage: undefined,
            }
          : item
      )
    );
  }, []);

  const pauseAll = useCallback(() => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'uploading') {
          item.taskControl?.pause();
          return { ...item, status: 'paused' };
        }
        return item;
      })
    );
  }, []);

  const resumeAll = useCallback(() => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'paused') {
          item.taskControl?.resume();
          return { ...item, status: 'uploading' };
        }
        return item;
      })
    );
  }, []);

  const cancelAll = useCallback(() => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'uploading' || item.status === 'paused' || item.status === 'queued') {
          item.taskControl?.cancel();
          return { ...item, status: 'canceled', errorMessage: 'Canceled by user' };
        }
        return item;
      })
    );
  }, []);

  // Process next item in queue
  const processQueue = useCallback(async () => {
    if (isUploading) return;

    const nextItem = queue.find((item) => item.status === 'queued');
    if (!nextItem) return;

    setIsUploading(true);
    activeUploadId.current = nextItem.id;

    updateQueueItem(nextItem.id, { status: 'uploading', progress: 0 });

    try {
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid ?? 'admin';
      const userEmail = currentUser?.email ?? undefined;

      const uploadResult = await pipelineRef.current.execute(
        {
          file: nextItem.file,
          type: nextItem.type,
          category: nextItem.category,
          folder: nextItem.folder,
          title: nextItem.title,
          description: nextItem.description,
          visibility: nextItem.visibility,
          tags: nextItem.tags,
          linkedEntityId: nextItem.linkedEntityId,
          linkedEntityType: nextItem.linkedEntityType,
          allowDuplicate: nextItem.allowDuplicate,
          onProgress: (p: number) => {
            updateQueueItem(nextItem.id, { progress: Math.round(p) });
          },
          onTaskCreated: (control) => {
            updateQueueItem(nextItem.id, { taskControl: control });
          },
        },
        userId,
        userEmail
      );

      // Save asset record in Firestore
      const savedAsset = await mediaService.createMediaAsset(uploadResult.asset);

      updateQueueItem(nextItem.id, {
        status: 'completed',
        progress: 100,
        asset: savedAsset,
      });
    } catch (err: any) {
      const errMsg = err?.message ?? 'Upload failed';
      const isDup = errMsg.startsWith('DUPLICATE_DETECTED:');

      updateQueueItem(nextItem.id, {
        status: isDup ? 'duplicate' : 'error',
        errorMessage: errMsg,
      });
    } finally {
      setIsUploading(false);
      activeUploadId.current = null;
    }
  }, [queue, isUploading, updateQueueItem]);

  useEffect(() => {
    processQueue();
  }, [queue, isUploading, processQueue]);

  return {
    queue,
    isUploading,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    forceUpload,
    pauseAll,
    resumeAll,
    cancelAll,
    updateQueueItem,
  };
}
