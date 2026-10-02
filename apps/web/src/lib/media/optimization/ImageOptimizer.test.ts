import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageOptimizer } from './ImageOptimizer';

// Mock browser APIs for Node Vitest
const mockToBlob = vi.fn((callback, type, _quality) => {
  callback(new Blob([new ArrayBuffer(100)], { type }));
});

const mockDrawImage = vi.fn();
const mockGetContext = vi.fn(() => ({
  drawImage: mockDrawImage,
}));

global.document = {
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: mockGetContext,
        toBlob: mockToBlob,
      };
    }
    return {};
  }),
} as any;

let imageWidthMock = 4000;
let imageHeightMock = 3000;

global.Image = class {
  onload: () => void = () => {};
  
  get naturalWidth() {
    return imageWidthMock;
  }
  
  get naturalHeight() {
    return imageHeightMock;
  }
  
  set src(_url: string) {
    setTimeout(() => {
      this.onload();
    }, 0);
  }
} as any;

describe('ImageOptimizer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    imageWidthMock = 4000;
    imageHeightMock = 3000;
    // Set a large original file size so optimization isn't bypassed by small size check
  });

  it('successfully downscales and compresses a large JPEG image proportionally', async () => {
    const originalFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'original.jpg', { type: 'image/jpeg' });
    imageWidthMock = 4000;
    imageHeightMock = 3000;

    const result = await ImageOptimizer.optimize(originalFile, {
      maxWidth: 1920,
      maxHeight: 1080,
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimized.width).toBe(1440); // 4000 * (1080/3000) = 1440
    expect(result.data?.optimized.height).toBe(1080);
    expect(result.data?.optimized.mimeType).toBe('image/jpeg');
  });

  it('keeps native resolution and does NOT upscale if image is smaller than target max', async () => {
    const originalFile = new File([new ArrayBuffer(50 * 1024)], 'small.jpg', { type: 'image/jpeg' });
    imageWidthMock = 800;
    imageHeightMock = 600;

    // Set mock toBlob to return a tiny blob so size efficiency check passes
    mockToBlob.mockImplementationOnce((callback, type) => {
      callback(new Blob([new ArrayBuffer(10 * 1024)], { type }));
    });

    const result = await ImageOptimizer.optimize(originalFile, {
      maxWidth: 1920,
      maxHeight: 1080,
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimized.width).toBe(800);
    expect(result.data?.optimized.height).toBe(600);
  });

  it('bypasses optimization if output size is larger than original file size', async () => {
    const originalFile = new File([new ArrayBuffer(10 * 1024)], 'small.jpg', { type: 'image/jpeg' });
    imageWidthMock = 800;
    imageHeightMock = 600;

    // Set mock toBlob to return a larger size
    mockToBlob.mockImplementationOnce((callback, type) => {
      callback(new Blob([new ArrayBuffer(20 * 1024)], { type }));
    });

    const result = await ImageOptimizer.optimize(originalFile, {
      maxWidth: 1920,
      maxHeight: 1080,
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimized.sizeBytes).toBe(originalFile.size);
    expect(result.data?.optimized.compressionRatio).toBe(1.0);
  });

  it('preserves transparent format for png input', async () => {
    const originalFile = new File([new ArrayBuffer(1 * 1024 * 1024)], 'transparent.png', { type: 'image/png' });
    imageWidthMock = 1200;
    imageHeightMock = 1200;

    const result = await ImageOptimizer.optimize(originalFile, {
      maxWidth: 512,
      maxHeight: 512,
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimized.mimeType).toBe('image/webp'); // transparent png converted to transparent webp
  });
});
