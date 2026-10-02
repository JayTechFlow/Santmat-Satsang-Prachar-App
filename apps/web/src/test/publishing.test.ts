import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentPublishingService, PublishRequest } from '../services/shared/ContentPublishingService';

// Mock Firebase Config
vi.mock('../lib/firebase/config', () => ({
  db: {},
}));

// Mock Firestore Methods
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
}));

// Mock Storage Service
const mockUploadFile = vi.fn();
const mockDeleteFile = vi.fn();
vi.mock('../services/storage/storageService', () => ({
  storageService: {
    uploadFile: (...args: any[]) => mockUploadFile(...args),
    deleteFile: (...args: any[]) => mockDeleteFile(...args),
  },
}));

describe('Content Ingestion Pipeline Tests (Hardened Rules & Undefined Guards)', () => {
  let service: ContentPublishingService;

  beforeEach(() => {
    service = new ContentPublishingService();
    vi.clearAllMocks();
    
    // Default mock setup for storage uploads
    mockUploadFile.mockResolvedValue({
      success: true,
      data: {
        downloadUrl: 'https://storage/mock-file.mp3',
        storagePath: 'audio/bhajans/mock-file.mp3',
      },
    });
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-123' });
  });

  // 1. Published Bhajan without scheduledDate -> EXPECTED: PASS
  it('should allow publishing a bhajan without a scheduledDate', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Published Track',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        scheduledDate: undefined,
        scheduledTime: undefined,
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      existingUrls: {
        image: 'https://storage/thumb.jpg',
      },
      actionType: 'publish',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
    expect(mockAddDoc).toHaveBeenCalled();
    const passedPayload = mockAddDoc.mock.calls[0][1];
    expect(passedPayload.scheduledDate).toBeUndefined(); // Verify field is completely omitted/stripped
  });

  // 2. Draft Bhajan without scheduledDate -> EXPECTED: PASS
  it('should allow draft bhajan without a scheduledDate', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Draft Track',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        scheduledDate: undefined,
        scheduledTime: undefined,
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      actionType: 'draft',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
  });

  // 3. Scheduled Bhajan without scheduledDate -> EXPECTED: VALIDATION ERROR
  it('should reject scheduled bhajan when scheduledDate is missing', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Scheduled Track Fail',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        scheduledDate: undefined, // missing
        scheduledTime: '06:00',
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      actionType: 'schedule',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(false);
    expect(res.error).toBe('अनुसूचित प्रकाशन की तारीख आवश्यक है');
  });

  // 4. Scheduled Bhajan with valid scheduledDate -> EXPECTED: PASS
  it('should allow scheduled bhajan with valid scheduledDate and time', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Scheduled Track Success',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        scheduledDate: '2026-09-01',
        scheduledTime: '06:00',
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      actionType: 'schedule',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
    const passedPayload = mockAddDoc.mock.calls[0][1];
    expect(passedPayload.scheduledDate).toBe('2026-09-01');
    expect(passedPayload.scheduledTime).toBe('06:00');
  });

  // 5. Undefined optional metadata field -> EXPECTED: field omitted
  it('should omit optional metadata fields that are undefined', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Track With Undefined Optional',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        optionalField: undefined, // Optional undefined
        anotherOptional: null, // Expressly null
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      actionType: 'draft',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
    const passedPayload = mockAddDoc.mock.calls[0][1];
    expect(passedPayload.optionalField).toBeUndefined();
    expect(passedPayload.anotherOptional).toBeNull();
  });

  // 6. Nested undefined -> EXPECTED: sanitized or rejected before Firestore
  it('should clean nested undefined properties from payloads recursively', async () => {
    const request: PublishRequest = {
      contentType: 'bhajan',
      payload: {
        title: 'Nested Clean Track',
        artist: 'Sant Kabir',
        category: 'पदावली भजन',
        nestedData: {
          someKey: 'value',
          undefinedField: undefined,
          deepArray: [
            { arrayKey: 'valueA', arrayUndefined: undefined },
          ]
        }
      },
      files: {
        audio: new File([], 'test.mp3'),
      },
      actionType: 'draft',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
    const passedPayload = mockAddDoc.mock.calls[0][1];
    expect(passedPayload.nestedData.undefinedField).toBeUndefined();
    expect(passedPayload.nestedData.deepArray[0].arrayUndefined).toBeUndefined();
    expect(passedPayload.nestedData.someKey).toBe('value');
    expect(passedPayload.nestedData.deepArray[0].arrayKey).toBe('valueA');
  });

  // 7. All other content types -> EXPECTED: no undefined Firestore fields
  it('should sanitize metadata fields for Books without leaving undefined properties', async () => {
    const request: PublishRequest = {
      contentType: 'book',
      payload: {
        title: 'Satsang Book',
        author: 'Sant Maharshi Mehi',
        category: 'literature',
        pagesCount: undefined, // Omit page count
        publishDate: '2026-01-01',
      },
      files: {
        pdf: new File([], 'book.pdf'),
      },
      actionType: 'publish',
    };

    const res = await service.publishContent(request, () => {});
    expect(res.success).toBe(true);
    const passedPayload = mockAddDoc.mock.calls[0][1];
    expect(passedPayload.pagesCount).toBeUndefined();
    expect(passedPayload.publishDate).toBe('2026-01-01');
  });
});
