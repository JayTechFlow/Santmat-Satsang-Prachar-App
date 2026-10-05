import { describe, it, expect } from 'vitest';
import {
  IMAGE_PROFILES,
  getImageProfile,
  validateImageAgainstProfile,
} from '../lib/media/profiles/imageProfiles';

describe('Enterprise Image Profiles & Android UI Alignment', () => {
  it('defines all canonical Android-aligned image profiles', () => {
    const profileKeys = Object.keys(IMAGE_PROFILES);
    expect(profileKeys).toContain('banner');
    expect(profileKeys).toContain('audio_artwork');
    expect(profileKeys).toContain('stuti_artwork');
    expect(profileKeys).toContain('book_cover');
    expect(profileKeys).toContain('category_icon');
    expect(profileKeys).toContain('avatar');
  });

  describe('Banner Profile (16:9 Ratio Lock)', () => {
    const profile = IMAGE_PROFILES.banner;

    it('has exact 16:9 aspect ratio and resolution', () => {
      expect(profile.aspectRatio).toBeCloseTo(16 / 9, 4);
      expect(profile.aspectRatioLabel).toBe('16:9');
      expect(profile.targetWidth).toBe(1280);
      expect(profile.targetHeight).toBe(720);
      expect(profile.minWidth).toBe(960);
      expect(profile.minHeight).toBe(540);
    });

    it('specifies Android carousel presentation context', () => {
      expect(profile.androidContext.componentName).toContain('HomeBanner');
      expect(profile.androidContext.renderMode).toBe('BoxFit.cover');
      expect(profile.androidContext.borderRadiusPx).toBe(20);
    });
  });

  describe('Audio Artwork Profile (1:1 Square Lock)', () => {
    const profile = IMAGE_PROFILES.audio_artwork;

    it('has exact 1:1 aspect ratio matching Android AudioCard & NowPlaying', () => {
      expect(profile.aspectRatio).toBe(1.0);
      expect(profile.aspectRatioLabel).toBe('1:1');
      expect(profile.targetWidth).toBe(600);
      expect(profile.targetHeight).toBe(600);
      expect(profile.minWidth).toBe(300);
      expect(profile.minHeight).toBe(300);
    });

    it('defines 128x128 thumbnail variant for high-density list rendering', () => {
      expect(profile.thumbnailVariants?.thumb).toEqual({ width: 128, height: 128 });
      expect(profile.androidContext.componentName).toContain('AudioCard');
      expect(profile.androidContext.componentName).toContain('NowPlaying');
    });
  });

  describe('Stuti-Vinati Artwork Profile (1:1 Square Lock)', () => {
    const profile = IMAGE_PROFILES.stuti_artwork;

    it('has 1:1 aspect ratio matching Android 64x64 Stuti prayer card', () => {
      expect(profile.aspectRatio).toBe(1.0);
      expect(profile.aspectRatioLabel).toBe('1:1');
      expect(profile.targetWidth).toBe(600);
      expect(profile.targetHeight).toBe(600);
    });

    it('specifies Android presentation context for morning & evening slots', () => {
      expect(profile.androidContext.componentName).toContain('StutiVinatiHomePage');
      expect(profile.androidContext.renderMode).toBe('BoxFit.cover');
    });
  });

  describe('Book Cover Profile (2:3 Ratio Lock)', () => {
    const profile = IMAGE_PROFILES.book_cover;

    it('has exact 2:3 aspect ratio matching Android BookCard portrait layout', () => {
      expect(profile.aspectRatio).toBeCloseTo(2 / 3, 4);
      expect(profile.aspectRatioLabel).toBe('2:3');
      expect(profile.targetWidth).toBe(600);
      expect(profile.targetHeight).toBe(900);
      expect(profile.minWidth).toBe(300);
      expect(profile.minHeight).toBe(450);
    });
  });

  describe('getImageProfile resolution', () => {
    it('returns the registered profile by ID', () => {
      const banner = getImageProfile('banner');
      expect(banner.id).toBe('banner');
      expect(banner.aspectRatioLabel).toBe('16:9');
    });

    it('falls back gracefully to banner for unknown profile IDs', () => {
      const fallback = getImageProfile('unknown_custom_id');
      expect(fallback.id).toBe('banner');
    });
  });

  describe('validateImageAgainstProfile validation logic', () => {
    it('rejects an image exceeding maximum allowed file size', async () => {
      const fakeFile = new File(['a'.repeat(100)], 'huge.webp', { type: 'image/webp' });
      Object.defineProperty(fakeFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB > 3MB banner limit

      const result = await validateImageAgainstProfile(fakeFile, IMAGE_PROFILES.banner);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('फ़ाइल साइज़'))).toBe(true);
    });
  });
});
