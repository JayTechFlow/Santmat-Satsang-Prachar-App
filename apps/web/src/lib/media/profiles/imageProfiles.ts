/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Image Profiles (Android Aligned)
 * ============================================================================
 * Defines canonical image configurations derived from the Android Mobile UI.
 * Prevents aspect ratio mismatch, unexpected thumbnail cropping, and
 * oversized payload downloads on Android mobile devices.
 */

export interface AndroidPresentationContext {
  componentName: string;
  renderMode: 'BoxFit.cover' | 'BoxFit.contain';
  borderRadiusPx: number;
  previewWidthPx: number;
  previewHeightPx: number;
  descriptionHi: string;
}

export interface ImageProfile {
  id: string;
  name: string;
  labelHi: string;
  labelEn: string;
  targetWidth: number;
  targetHeight: number;
  aspectRatio: number; // width / height
  aspectRatioLabel: string; // e.g. "16:9", "1:1", "2:3"
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatioTolerance: number; // e.g. 0.05
  fitMode: 'cover' | 'contain';
  quality: number; // 0.1 - 1.0
  maxSizeBytes: number;
  outputFormat: 'image/webp' | 'image/jpeg' | 'image/png';
  androidContext: AndroidPresentationContext;
  thumbnailVariants?: {
    thumb: { width: number; height: number };
    medium?: { width: number; height: number };
  };
}

export const IMAGE_PROFILES: Record<string, ImageProfile> = {
  banner: {
    id: 'banner',
    name: 'Home Carousel Banner',
    labelHi: 'होम स्क्रीन बैनर',
    labelEn: 'Home Carousel Banner',
    targetWidth: 1280,
    targetHeight: 720,
    aspectRatio: 16 / 9,
    aspectRatioLabel: '16:9',
    minWidth: 960,
    minHeight: 540,
    maxWidth: 2560,
    maxHeight: 1440,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 3 * 1024 * 1024, // 3MB
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'DailySuvicharCarousel / HomeBanner',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 20,
      previewWidthPx: 340,
      previewHeightPx: 191,
      descriptionHi: 'एंड्रॉइड होम स्क्रीन पर 16:9 अनुपात में 20px राउंडेड कोनों के साथ प्रदर्शित होगा।',
    },
    thumbnailVariants: {
      thumb: { width: 320, height: 180 },
      medium: { width: 640, height: 360 },
    },
  },

  audio_artwork: {
    id: 'audio_artwork',
    name: 'Audio / Bhajan Artwork',
    labelHi: 'भजन एवं सत्संग आर्टवर्क / थंबनेल',
    labelEn: 'Audio Track Artwork / Thumbnail',
    targetWidth: 600,
    targetHeight: 600,
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 300,
    minHeight: 300,
    maxWidth: 1600,
    maxHeight: 1600,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 2 * 1024 * 1024,
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'AudioCard (64x64) & NowPlaying (260x260)',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 14,
      previewWidthPx: 220,
      previewHeightPx: 220,
      descriptionHi: 'एंड्रॉइड पर भजन सूची में 64×64 वर्ग थंबनेल और प्लेयर में 260×260 पोस्टर के रूप में दिखेगा।',
    },
    thumbnailVariants: {
      thumb: { width: 128, height: 128 },
      medium: { width: 300, height: 300 },
    },
  },

  stuti_artwork: {
    id: 'stuti_artwork',
    name: 'Stuti-Vinati Prayer Artwork',
    labelHi: 'स्तुति-विनती प्रार्थना आर्टवर्क',
    labelEn: 'Daily Prayer Artwork',
    targetWidth: 600,
    targetHeight: 600,
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 300,
    minHeight: 300,
    maxWidth: 1600,
    maxHeight: 1600,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 2 * 1024 * 1024,
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'StutiVinatiHomePage (64x64 Card Artwork)',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 14,
      previewWidthPx: 220,
      previewHeightPx: 220,
      descriptionHi: 'प्रातःकालीन एवं संध्याकालीन स्तुति कार्ड में 64×64 वर्ग आर्टवर्क के रूप में प्रदर्शित होगा।',
    },
    thumbnailVariants: {
      thumb: { width: 128, height: 128 },
      medium: { width: 300, height: 300 },
    },
  },

  book_cover: {
    id: 'book_cover',
    name: 'Book Cover',
    labelHi: 'पुस्तक मुखपृष्ठ (Book Cover)',
    labelEn: 'Spiritual Literature Cover',
    targetWidth: 600,
    targetHeight: 900,
    aspectRatio: 2 / 3,
    aspectRatioLabel: '2:3',
    minWidth: 300,
    minHeight: 450,
    maxWidth: 1600,
    maxHeight: 2400,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 2 * 1024 * 1024,
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'BookCard (60x90)',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 8,
      previewWidthPx: 180,
      previewHeightPx: 270,
      descriptionHi: 'एंड्रॉइड साहित्य संग्रह में 2:3 पोर्ट्रेट पुस्तक आवरण के रूप में दिखेगा।',
    },
    thumbnailVariants: {
      thumb: { width: 120, height: 180 },
      medium: { width: 300, height: 450 },
    },
  },

  category_icon: {
    id: 'category_icon',
    name: 'Category Icon',
    labelHi: 'श्रेणी आइकन / थंबनेल',
    labelEn: 'Category Icon',
    targetWidth: 256,
    targetHeight: 256,
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 128,
    minHeight: 128,
    maxWidth: 512,
    maxHeight: 512,
    aspectRatioTolerance: 0.05,
    fitMode: 'contain',
    quality: 0.90,
    maxSizeBytes: 1 * 1024 * 1024,
    outputFormat: 'image/png',
    androidContext: {
      componentName: 'CategoryActionGrid (56x56 Circle)',
      renderMode: 'BoxFit.contain',
      borderRadiusPx: 28,
      previewWidthPx: 120,
      previewHeightPx: 120,
      descriptionHi: 'होम स्क्रीन ग्रिड में 56×56 गोल आइकन कंटेनर में प्रदर्शित होगा।',
    },
    thumbnailVariants: {
      thumb: { width: 64, height: 64 },
    },
  },

  suvichar_poster: {
    id: 'suvichar_poster',
    name: 'Daily Suvichar Poster',
    labelHi: 'दैनिक सुविचार पोस्टर',
    labelEn: 'Daily Spiritual Poster',
    targetWidth: 1200,
    targetHeight: 675,
    aspectRatio: 16 / 9,
    aspectRatioLabel: '16:9',
    minWidth: 800,
    minHeight: 450,
    maxWidth: 1920,
    maxHeight: 1080,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 2.5 * 1024 * 1024,
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'DailySuvicharCarousel (220px Height Card)',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 19,
      previewWidthPx: 340,
      previewHeightPx: 191,
      descriptionHi: 'होम स्क्रीन पर 5-सेकंड ऑटो-स्क्रॉल सुविचार कैरोसेल में ग्रेडिएंट के साथ दिखेगा।',
    },
    thumbnailVariants: {
      thumb: { width: 320, height: 180 },
      medium: { width: 640, height: 360 },
    },
  },

  avatar: {
    id: 'avatar',
    name: 'User Profile Avatar',
    labelHi: 'उपयोगकर्ता प्रोफाइल अवतार',
    labelEn: 'User Profile Avatar',
    targetWidth: 256,
    targetHeight: 256,
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 128,
    minHeight: 128,
    maxWidth: 1024,
    maxHeight: 1024,
    aspectRatioTolerance: 0.05,
    fitMode: 'cover',
    quality: 0.85,
    maxSizeBytes: 1 * 1024 * 1024,
    outputFormat: 'image/webp',
    androidContext: {
      componentName: 'UserProfile / Drawer Avatar',
      renderMode: 'BoxFit.cover',
      borderRadiusPx: 9999,
      previewWidthPx: 128,
      previewHeightPx: 128,
      descriptionHi: 'मोबाइल ऐप में वृत्ताकार प्रोफ़ाइल चित्र के रूप में दिखेगा।',
    },
    thumbnailVariants: {
      thumb: { width: 64, height: 64 },
    },
  },
};

export function getImageProfile(profileKey: string): ImageProfile {
  return IMAGE_PROFILES[profileKey] || IMAGE_PROFILES.banner;
}

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: { width: number; height: number; aspectRatio: number };
}

/**
 * Validates an image File against an explicit Android-aligned ImageProfile.
 */
export async function validateImageAgainstProfile(
  file: File,
  profile: ImageProfile
): Promise<ImageValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. MIME type validation
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validMimes.includes(file.type)) {
    errors.push(`अमान्य प्रारूप '${file.type}'। केवल JPEG, PNG, या WebP समर्थित हैं।`);
  }

  // 2. File size validation
  if (file.size > profile.maxSizeBytes) {
    const maxMb = (profile.maxSizeBytes / (1024 * 1024)).toFixed(1);
    const actualMb = (file.size / (1024 * 1024)).toFixed(2);
    errors.push(`फ़ाइल साइज़ बहुत बड़ा है (${actualMb} MB)। अधिकतम अनुमत साइज़ ${maxMb} MB है।`);
  }

  // 3. Pixel dimensions & aspect ratio (browser environment)
  if (typeof Image === 'undefined') {
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  return new Promise<ImageValidationResult>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;

      if (width < profile.minWidth || height < profile.minHeight) {
        errors.push(
          `इमेज का रेज़ोल्यूशन बहुत कम है (${width}×${height}px)। ${profile.labelHi} के लिए न्यूनतम ${profile.minWidth}×${profile.minHeight}px आवश्यक है।`
        );
      }

      const ratioDiff = Math.abs(ratio - profile.aspectRatio);
      if (ratioDiff > profile.aspectRatioTolerance) {
        warnings.push(
          `इमेज का अनुपात (${ratio.toFixed(2)}) अपेक्षित अनुपात ${profile.aspectRatioLabel} से भिन्न है। Android पर कटने से बचाने के लिए ऑटो या मैनुअल क्रॉप का उपयोग करें।`
        );
      }

      resolve({
        valid: errors.length === 0,
        errors,
        warnings,
        dimensions: { width, height, aspectRatio: ratio },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      errors.push('इमेज लोड करने में विफल। फ़ाइल भ्रष्ट हो सकती है।');
      resolve({ valid: false, errors, warnings });
    };

    img.src = objectUrl;
  });
}
