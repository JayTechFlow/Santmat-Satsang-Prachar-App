import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { storageService } from '../storage/storageService';
import { ServiceResponse } from '../../types/common/index';

export type UploadPhase =
  | 'IDLE'
  | 'SELECTED'
  | 'VALIDATING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'MEDIA_STORED'
  | 'METADATA_SAVING'
  | 'DRAFT_SAVED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'COMPLETE'
  | 'VALIDATION_ERROR'
  | 'UPLOAD_ERROR'
  | 'MEDIA_REGISTRATION_ERROR'
  | 'METADATA_ERROR'
  | 'PUBLISH_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_ERROR';

export interface PublishProgress {
  phase: UploadPhase;
  percentage: number;
  message: string;
  uploadedBytes?: number;
  totalBytes?: number;
  fileName?: string;
  fileType?: string;
  error?: string;
}

export type ProgressCallback = (progress: PublishProgress) => void;

export interface PublishRequest {
  contentType: 'bhajan' | 'banner' | 'stuti' | 'book';
  payload: Record<string, any>;
  files: {
    audio?: File | null;
    image?: File | null;
    pdf?: File | null;
  };
  existingUrls?: {
    audio?: string;
    image?: string;
    pdf?: string;
  };
  actionType: 'publish' | 'draft' | 'schedule';
}

export class ContentPublishingService {
  /**
   * Orchestrates the coordinated content publishing pipeline
   */
  async publishContent(
    request: PublishRequest,
    onProgress: ProgressCallback
  ): Promise<ServiceResponse<any>> {
    const uploadedPaths: string[] = [];
    
    try {
      // Clean undefined values from the incoming payload first
      request.payload = this.sanitizePayload(request.payload);

      // 1. Initial State / Selection Check
      onProgress({
        phase: 'SELECTED',
        percentage: 5,
        message: 'सामग्री चयनित, अपलोड प्रक्रिया प्रारंभ हो रही है...',
      });

      // 2. Validate metadata and files locally
      onProgress({
        phase: 'VALIDATING',
        percentage: 10,
        message: 'सामग्री और फ़ाइलों की वैधता जाँची जा रही है...',
      });

      const validationError = this.validateRequest(request);
      if (validationError) {
        onProgress({
          phase: 'VALIDATION_ERROR',
          percentage: 10,
          message: `वैधता त्रुटि: ${validationError}`,
          error: validationError,
        });
        return { success: false, error: validationError };
      }

      // 3. Media Upload Phase
      onProgress({
        phase: 'UPLOADING',
        percentage: 20,
        message: 'फ़ाइलें स्टोरेज में अपलोड की जा रही हैं...',
      });

      const finalUrls: Record<string, string> = {};
      const finalStoragePaths: Record<string, string> = {};

      // Calculate path prefixes based on entity type
      const paths = this.getStoragePaths(request);

      // Upload Audio file if present
      if (request.files.audio) {
        onProgress({
          phase: 'UPLOADING',
          percentage: 30,
          message: 'ऑडियो फ़ाइल अपलोड की जा रही है...',
          fileName: request.files.audio.name,
          fileType: request.files.audio.type,
          totalBytes: request.files.audio.size,
        });

        const uploadRes = await storageService.uploadFile(
          request.files.audio,
          paths.audioFolder,
          (prog) => {
            const p = 30 + Math.round(prog * 0.4); // audio takes up to 40% of progress (from 30% to 70%)
            onProgress({
              phase: 'UPLOADING',
              percentage: p,
              message: `ऑडियो अपलोड हो रहा है: ${prog}%`,
              fileName: request.files.audio!.name,
              fileType: request.files.audio!.type,
              uploadedBytes: Math.round((prog / 100) * request.files.audio!.size),
              totalBytes: request.files.audio!.size,
            });
          }
        );

        if (!uploadRes.success || !uploadRes.data) {
          throw { phase: 'UPLOAD_ERROR', message: uploadRes.error || 'ऑडियो अपलोड विफल रहा।' };
        }

        finalUrls.audio = uploadRes.data.downloadUrl;
        finalStoragePaths.audio = uploadRes.data.storagePath;
        uploadedPaths.push(uploadRes.data.storagePath);
      } else if (request.existingUrls?.audio) {
        finalUrls.audio = request.existingUrls.audio;
        finalStoragePaths.audio = this.extractStoragePath(request.existingUrls.audio);
      }

      // Upload PDF file if present
      if (request.files.pdf) {
        onProgress({
          phase: 'UPLOADING',
          percentage: 70,
          message: 'PDF फ़ाइल अपलोड की जा रही है...',
          fileName: request.files.pdf.name,
          fileType: request.files.pdf.type,
          totalBytes: request.files.pdf.size,
        });

        const uploadRes = await storageService.uploadFile(
          request.files.pdf,
          paths.pdfFolder,
          (prog) => {
            const p = 70 + Math.round(prog * 0.15); // PDF takes 15% of progress (from 70% to 85%)
            onProgress({
              phase: 'UPLOADING',
              percentage: p,
              message: `PDF अपलोड हो रहा है: ${prog}%`,
              fileName: request.files.pdf!.name,
              fileType: request.files.pdf!.type,
              uploadedBytes: Math.round((prog / 100) * request.files.pdf!.size),
              totalBytes: request.files.pdf!.size,
            });
          }
        );

        if (!uploadRes.success || !uploadRes.data) {
          throw { phase: 'UPLOAD_ERROR', message: uploadRes.error || 'PDF अपलोड विफल रहा।' };
        }

        finalUrls.pdf = uploadRes.data.downloadUrl;
        finalStoragePaths.pdf = uploadRes.data.storagePath;
        uploadedPaths.push(uploadRes.data.storagePath);
      } else if (request.existingUrls?.pdf) {
        finalUrls.pdf = request.existingUrls.pdf;
        finalStoragePaths.pdf = this.extractStoragePath(request.existingUrls.pdf);
      }

      // Upload Image file if present
      if (request.files.image) {
        onProgress({
          phase: 'UPLOADING',
          percentage: 85,
          message: 'इमेज फ़ाइल अपलोड की जा रही है...',
          fileName: request.files.image.name,
          fileType: request.files.image.type,
          totalBytes: request.files.image.size,
        });

        const uploadRes = await storageService.uploadFile(
          request.files.image,
          paths.imageFolder,
          (prog) => {
            const p = 85 + Math.round(prog * 0.05); // Image takes 5% of progress (from 85% to 90%)
            onProgress({
              phase: 'UPLOADING',
              percentage: p,
              message: `इमेज अपलोड हो रहा है: ${prog}%`,
              fileName: request.files.image!.name,
              fileType: request.files.image!.type,
              uploadedBytes: Math.round((prog / 100) * request.files.image!.size),
              totalBytes: request.files.image!.size,
            });
          }
        );

        if (!uploadRes.success || !uploadRes.data) {
          throw { phase: 'UPLOAD_ERROR', message: uploadRes.error || 'इमेज अपलोड विफल रहा।' };
        }

        finalUrls.image = uploadRes.data.downloadUrl;
        finalStoragePaths.image = uploadRes.data.storagePath;
        uploadedPaths.push(uploadRes.data.storagePath);
      } else if (request.existingUrls?.image) {
        finalUrls.image = request.existingUrls.image;
        finalStoragePaths.image = this.extractStoragePath(request.existingUrls.image);
      }

      onProgress({
        phase: 'MEDIA_STORED',
        percentage: 90,
        message: 'सभी फ़ाइलें सफलतापूर्वक संग्रहीत कर ली गई हैं।',
      });

      // 4. Save/Update domain record in Firestore
      onProgress({
        phase: 'METADATA_SAVING',
        percentage: 93,
        message: 'डेटाबेस में विवरण सहेजा जा रहा है...',
      });

      const collectionName = this.getCollectionName(request.contentType);
      const documentPayload = this.buildFirestorePayload(
        request,
        finalUrls,
        finalStoragePaths
      );

      const sanitizedDocumentPayload = this.sanitizePayload(documentPayload);
      this.checkForUndefined(sanitizedDocumentPayload);

      let savedDoc;
      try {
        if (request.payload.id) {
          const docRef = doc(db, collectionName, request.payload.id);
          await updateDoc(docRef, {
            ...sanitizedDocumentPayload,
            updatedAt: serverTimestamp(),
          });
          savedDoc = { id: request.payload.id, ...sanitizedDocumentPayload };
        } else {
          const docRef = await addDoc(collection(db, collectionName), {
            ...sanitizedDocumentPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          savedDoc = { id: docRef.id, ...sanitizedDocumentPayload };
        }
      } catch (dbErr: any) {
        console.error('Firestore Save Error:', dbErr);
        throw {
          phase: 'METADATA_ERROR',
          message: dbErr.message || 'डेटाबेस में सहेजने की प्रक्रिया विफल रही।',
        };
      }

      // 5. Final Status Handling
      const finalPhase = request.actionType === 'draft' ? 'DRAFT_SAVED' : 'PUBLISHED';
      onProgress({
        phase: finalPhase,
        percentage: 97,
        message: request.actionType === 'draft' ? 'ड्राफ्ट सहेज लिया गया है।' : 'सामग्री सफलतापूर्वक प्रकाशित हो गई है!',
      });

      onProgress({
        phase: 'COMPLETE',
        percentage: 100,
        message: 'प्रक्रिया पूर्ण।',
      });

      return { success: true, data: savedDoc };
    } catch (err: any) {
      console.error('Publish pipeline error:', err);
      
      const errorPhase: UploadPhase = err.phase || 'PUBLISH_ERROR';
      const errorMessage = err.message || 'प्रकाशन प्रक्रिया में त्रुटि उत्पन्न हुई।';

      onProgress({
        phase: errorPhase,
        percentage: 90,
        message: `त्रुटि: ${errorMessage}`,
        error: errorMessage,
      });

      // Perform rollback/cleanup of uploaded files if there was a database failure
      if (uploadedPaths.length > 0) {
        console.log('Rolling back uploaded storage files:', uploadedPaths);
        await Promise.all(
          uploadedPaths.map((p) =>
            storageService.deleteFile(p).catch((delErr) => {
              console.error(`Failed to delete orphan file ${p} during rollback:`, delErr);
            })
          )
        );
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Decides which collection target based on content type
   */
  private getCollectionName(contentType: string): string {
    switch (contentType) {
      case 'bhajan':
        return 'audio';
      case 'banner':
        return 'banners';
      case 'stuti':
        return 'stuti_vinati';
      case 'book':
        return 'books';
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  /**
   * Decides folder structure based on content type
   */
  private getStoragePaths(request: PublishRequest) {
    switch (request.contentType) {
      case 'bhajan':
        return {
          audioFolder: `audio/bhajans`,
          imageFolder: `thumbnails`,
          pdfFolder: `pdfs`,
        };
      case 'stuti':
        return {
          audioFolder: `audio/stutis`,
          imageFolder: `thumbnails`,
          pdfFolder: `pdfs`,
        };
      case 'book':
        return {
          audioFolder: `audio/books`,
          imageFolder: `book_covers`,
          pdfFolder: `book_pdfs`,
        };
      case 'banner':
        return {
          audioFolder: `audio/banners`,
          imageFolder: `banners`,
          pdfFolder: `pdfs`,
        };
      default:
        return {
          audioFolder: `audio`,
          imageFolder: `images`,
          pdfFolder: `pdfs`,
        };
    }
  }

  /**
   * Validates target content metadata
   */
  private validateRequest(request: PublishRequest): string | null {
    const { contentType, payload, files, existingUrls } = request;

    if (!payload.title) {
      return 'शीर्षक (Title) आवश्यक है।';
    }

    if (contentType === 'bhajan') {
      if (!payload.artist) return 'कलाकार/गायक का नाम आवश्यक है।';
      if (!payload.category) return 'श्रेणी आवश्यक है।';
      if (!files.audio && !existingUrls?.audio) {
        return 'ऑडियो फ़ाइल या मौजूदा ऑडियो लिंक आवश्यक है।';
      }
      if (request.actionType === 'publish' && !files.image && !existingUrls?.image) {
        return 'प्रकाशित करने के लिए थंबनेल आवश्यक है।';
      }

      if (request.actionType === 'schedule') {
        if (!payload.scheduledDate || String(payload.scheduledDate).trim() === '') {
          return 'अनुसूचित प्रकाशन की तारीख आवश्यक है';
        }
        if (!payload.scheduledTime || String(payload.scheduledTime).trim() === '') {
          return 'अनुसूचित प्रकाशन का समय आवश्यक है';
        }
        const parsedDate = new Date(`${payload.scheduledDate}T${payload.scheduledTime}`);
        if (isNaN(parsedDate.getTime())) {
          return 'अमान्य अनुसूचित तारीख या समय';
        }
      }
    }

    if (contentType === 'banner') {
      if (!files.image && !existingUrls?.image) {
        return 'बैनर इमेज आवश्यक है।';
      }
    }

    if (contentType === 'stuti') {
      if (!payload.type) return 'स्तुति का प्रकार (morning/evening) आवश्यक है।';
      if (!payload.lyrics) return 'स्तुति के बोल (Lyrics) आवश्यक हैं।';
    }


    if (contentType === 'book') {
      if (!payload.author) return 'लेखक का नाम आवश्यक है।';
      if (!files.pdf && !existingUrls?.pdf) {
        return 'पुस्तक की PDF फ़ाइल आवश्यक है।';
      }
    }

    return null;
  }

  /**
   * Builds the exact payload format based on target Firestore collection mappings
   */
  private buildFirestorePayload(
    request: PublishRequest,
    urls: Record<string, string>,
    storagePaths: Record<string, string>
  ): Record<string, any> {
    const { contentType, payload, actionType } = request;
    const commonFields = { ...payload };
    delete commonFields.id;

    if (contentType === 'bhajan') {
      const bhajanStatus =
        actionType === 'draft'
          ? 'ड्राफ्ट'
          : actionType === 'schedule'
            ? 'शेड्यूल किया गया'
            : 'प्रकाशित';

      let scheduledAt: string | undefined = commonFields.scheduledAt;
      if (actionType === 'schedule' && commonFields.scheduledDate && commonFields.scheduledTime) {
        try {
          const parsed = new Date(`${commonFields.scheduledDate}T${commonFields.scheduledTime}:00+05:30`);
          if (!isNaN(parsed.getTime())) {
            scheduledAt = parsed.toISOString();
          }
        } catch (_) {
          // ignore
        }
      }

      return {
        ...commonFields,
        audioUrl: urls.audio || commonFields.audioUrl || '',
        storagePath: storagePaths.audio || commonFields.storagePath || '',
        imageUrl: urls.image || commonFields.imageUrl || '',
        status: bhajanStatus,
        scheduledDate: commonFields.scheduledDate || undefined,
        scheduledTime: commonFields.scheduledTime || undefined,
        scheduledAt: scheduledAt || undefined,
        plays: commonFields.plays || 0,
        addedDate: commonFields.addedDate || new Date().toISOString().split('T')[0],
        type: commonFields.type || 'भजन',
      };
    }

    if (contentType === 'stuti') {
      return {
        ...commonFields,
        audioUrl: urls.audio || commonFields.audioUrl || '',
        storagePath: storagePaths.audio || commonFields.storagePath || '',
        bannerImage: urls.image || commonFields.bannerImage || commonFields.imageUrl || '',
      };
    }


    if (contentType === 'book') {
      return {
        ...commonFields,
        coverUrl: urls.image || commonFields.coverUrl || '',
        pdfUrl: urls.pdf || commonFields.pdfUrl || '',
        storagePath: storagePaths.pdf || commonFields.storagePath || '',
        status: actionType === 'draft' ? 'draft' : 'published',
      };
    }

    if (contentType === 'banner') {
      return {
        ...commonFields,
        imageUrl: urls.image || commonFields.imageUrl || '',
        active: actionType === 'publish',
      };
    }

    return commonFields;
  }

  /**
   * Sanitizes the payload to omit undefined values recursively
   */
  private sanitizePayload<T extends Record<string, any>>(obj: T): T {
    const cleaned = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val === undefined) {
          continue;
        }
        if (val === null) {
          cleaned[key] = null;
          continue;
        }
        if (Array.isArray(val)) {
          cleaned[key] = val.map(item => 
            (item && typeof item === 'object') ? this.sanitizePayload(item) : item
          );
        } else if (typeof val === 'object' && !((val as any) instanceof Date)) {
          cleaned[key] = this.sanitizePayload(val);
        } else {
          cleaned[key] = val;
        }
      }
    }
    return cleaned;
  }

  /**
   * Asserts that no undefined values exist in the object
   */
  private checkForUndefined(obj: any, path: string = ''): void {
    if (obj === undefined) {
      throw new Error(`Developer Error: Unsupported undefined value found at ${path || 'root'}`);
    }
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          this.checkForUndefined(obj[key], path ? `${path}.${key}` : key);
        }
      }
    }
  }

  /**
   * Helper to parse and extract the storage path from a full Firebase Storage download URL
   */
  private extractStoragePath(url: string): string {
    if (!url || !url.includes('/o/')) return url;
    try {
      return decodeURIComponent(url.split('/o/')[1].split('?')[0]);
    } catch (_) {
      return url;
    }
  }
}

export const contentPublishingService = new ContentPublishingService();
export default contentPublishingService;
