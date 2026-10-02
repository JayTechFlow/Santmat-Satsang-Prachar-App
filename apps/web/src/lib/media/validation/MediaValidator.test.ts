import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaValidator, MEDIA_VALIDATION_CONFIGS } from './MediaValidator';
import { MediaType } from '../types/media.types';

// 1. Mock standard browser APIs for Node Vitest environment
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
} as any;

let simulateLoadFailure = false;
let imageWidthMock = 1200;
let imageHeightMock = 1200;

global.Image = class {
  onload: () => void = () => {};
  onerror: () => void = () => {};
  
  get naturalWidth() {
    return imageWidthMock;
  }
  
  get naturalHeight() {
    return imageHeightMock;
  }
  
  set src(_url: string) {
    setTimeout(() => {
      if (simulateLoadFailure) {
        this.onerror();
      } else {
        this.onload();
      }
    }, 0);
  }
} as any;

describe('MediaValidator Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simulateLoadFailure = false;
    imageWidthMock = 1200;
    imageHeightMock = 1200;
  });

  it('validates a correct image successfully', async () => {
    const file = new File(['image-content'], 'test-avatar.png', { type: 'image/png' });
    imageWidthMock = 512;
    imageHeightMock = 512;

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects an oversized image file size', async () => {
    const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test-avatar.png', { type: 'image/png' });
    imageWidthMock = 512;
    imageHeightMock = 512;

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('IMAGE_TOO_LARGE');
    expect(result.errors[0].field).toBe('size');
  });

  it('rejects an image with oversized dimensions', async () => {
    const file = new File(['image-content'], 'test-avatar.png', { type: 'image/png' });
    imageWidthMock = 1000; // max is 512 for avatar
    imageHeightMock = 1000;

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('IMAGE_DIMENSION_TOO_LARGE');
  });

  it('rejects an image with an invalid aspect ratio', async () => {
    const file = new File(['image-content'], 'test-avatar.png', { type: 'image/png' });
    imageWidthMock = 512;
    imageHeightMock = 300; // aspect ratio is 1.70, expected 1.0

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('IMAGE_ASPECT_RATIO_INVALID');
  });

  it('rejects an image with an invalid MIME type', async () => {
    const file = new File(['image-content'], 'test-avatar.tiff', { type: 'image/tiff' });

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_MIME_TYPE');
  });

  it('detects a corrupted image file', async () => {
    const file = new File(['corrupted-content'], 'corrupt.png', { type: 'image/png' });
    simulateLoadFailure = true;

    const result = await mediaValidator.validate(file, MediaType.IMAGE, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('IMAGE_CORRUPTED');
  });
});
