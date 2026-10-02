import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  MediaProcessingJobStatus,
  type MediaProcessingJob,
} from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaJobsRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_JOBS;

  async createJob(job: Omit<MediaProcessingJob, 'id'> & { id?: string }): Promise<MediaProcessingJob> {
    const docRef = job.id ? doc(db, this.collectionName, job.id) : doc(collection(db, this.collectionName));
    const now = new Date();

    const jobDoc: MediaProcessingJob = {
      ...job,
      id: docRef.id,
      status: job.status || MediaProcessingJobStatus.QUEUED,
      retryCount: job.retryCount || 0,
      maxRetries: job.maxRetries || 3,
      scheduledAt: job.scheduledAt || now,
      createdAt: job.createdAt || now,
    };

    await setDoc(docRef, jobDoc);
    return jobDoc;
  }

  async getJobById(jobId: string): Promise<MediaProcessingJob | null> {
    const docRef = doc(db, this.collectionName, jobId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.parseDoc(snap);
  }

  async getJobsByMediaId(mediaId: string): Promise<MediaProcessingJob[]> {
    const q = query(
      collection(db, this.collectionName),
      where('mediaId', '==', mediaId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  async updateJobStatus(
    jobId: string,
    status: MediaProcessingJobStatus,
    output?: Record<string, unknown>,
    errorMessage?: string
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, jobId);
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };

    if (status === MediaProcessingJobStatus.RUNNING) {
      updates.startedAt = new Date();
    } else if (status === MediaProcessingJobStatus.COMPLETED) {
      updates.completedAt = new Date();
    }

    if (output) updates.output = output;
    if (errorMessage) updates.errorMessage = errorMessage;

    await updateDoc(docRef, updates);
  }

  private parseDoc(snap: DocumentSnapshot): MediaProcessingJob {
    const data = snap.data()!;
    return {
      ...data,
      id: snap.id,
      scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date(data.scheduledAt || Date.now()),
      startedAt: data.startedAt?.toDate ? data.startedAt.toDate() : data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt ? new Date(data.completedAt) : undefined,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
    } as MediaProcessingJob;
  }
}

export const mediaJobsRepository = new MediaJobsRepository();
