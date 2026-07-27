import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, getCountFromServer, where } from 'firebase/firestore';
import type { OrderByDirection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import type { BhajanDTO } from '../types';

export const bhajanRepository = {
  fetchBhajans: async (
    search: string = '', 
    sort: string = 'newest', 
    pageSize: number = 10, 
    lastDoc: any = null
  ): Promise<{ data: BhajanDTO[], totalCount: number, lastDoc: any }> => {
    const colRef = collection(db, 'audio');
    
    // Calculate total count (with search filter if applicable)
    let qCount = query(colRef);
    if (search) {
      const lowerSearch = search.toLowerCase();
      // Basic prefix search using >= and <=
      qCount = query(colRef, where('title', '>=', lowerSearch), where('title', '<=', lowerSearch + '\uf8ff'));
    }
    const countSnapshot = await getCountFromServer(qCount);
    const totalCount = countSnapshot.data().count;

    // Build the main query
    let orderField = 'createdAt';
    let orderDir: OrderByDirection = 'desc';

    if (sort === 'oldest') {
      orderField = 'createdAt';
      orderDir = 'asc';
    } else if (sort === 'a-z') {
      orderField = 'title';
      orderDir = 'asc';
    } else if (sort === 'z-a') {
      orderField = 'title';
      orderDir = 'desc';
    }

    let q = query(colRef);
    if (search) {
      const lowerSearch = search.toLowerCase();
      // If we use an inequality filter on 'title', we must order by 'title' first
      q = query(colRef, 
        where('title', '>=', lowerSearch), 
        where('title', '<=', lowerSearch + '\uf8ff'),
        orderBy('title', orderDir)
      );
      if (orderField !== 'title') {
         q = query(q, orderBy(orderField, orderDir));
      }
    } else {
      q = query(colRef, orderBy(orderField, orderDir));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    const data = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BhajanDTO[];

    const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

    return {
      data,
      totalCount,
      lastDoc: newLastDoc
    };
  },

  findByTitle: async (title: string): Promise<BhajanDTO[]> => {
    const q = query(collection(db, 'audio'), where('title', '==', title));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BhajanDTO[];
  },

  createBhajan: async (data: Partial<BhajanDTO>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'audio'), data);
    return docRef.id;
  },

  updateBhajan: async (id: string, data: Partial<BhajanDTO>): Promise<void> => {
    await updateDoc(doc(db, 'audio', id), data);
  },

  deleteBhajan: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'audio', id));
  },

  uploadFile: async (file: File, folder: string, onProgress?: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(prog);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }
};
