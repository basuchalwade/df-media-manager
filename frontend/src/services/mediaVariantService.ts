
import { MediaItem, MediaVariant, PlatformConfig } from '../types';

export const generateVariant = async (media: MediaItem, platformConfig: PlatformConfig): Promise<MediaVariant> => {
  const rules = platformConfig.validation;

  // Ideal target is the midpoint of the range or default to 1:1 if not flexible
  const range = rules.aspectRatioRanges ? rules.aspectRatioRanges[0] : [1, 1];
  
  // Target Aspect Ratio Heuristic
  let targetRatio = 1;
  if (range[1] < 1) targetRatio = range[1]; // Vertical only
  else if (range[0] > 1) targetRatio = range[0]; // Horizontal only
  else targetRatio = 1; // Square supported

  if (media.type === 'video') {
    // Mock Video Variant (Preview Only)
    return {
      id: `var-${Date.now()}`,
      parentId: media.id,
      platform: platformConfig.id,
      url: media.url, // Re-use URL for mock
      thumbnailUrl: media.thumbnailUrl || media.url,
      width: media.metadata?.width || 1920,
      height: media.metadata?.height || 1080,
      createdAt: new Date().toISOString(),
      generatedBy: 'ai',
      status: 'ready'
    };
  }

  // Image Processing
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = media.url;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate Crop Dimensions (Center Weighted)
      const srcRatio = img.width / img.height;
      let drawWidth = img.width;
      let drawHeight = img.height;
      let offsetX = 0;
      let offsetY = 0;

      if (srcRatio > targetRatio) {
        // Source is wider than target: Crop width
        drawWidth = img.height * targetRatio;
        offsetX = (img.width - drawWidth) / 2;
      } else {
        // Source is taller than target: Crop height
        drawHeight = img.width / targetRatio;
        offsetY = (img.height - drawHeight) / 2;
      }

      // Set Canvas to target dimensions (max 1080px for performance)
      const MAX_DIM = 1080;
      let outWidth = drawWidth;
      let outHeight = drawHeight;
      
      if (outWidth > MAX_DIM || outHeight > MAX_DIM) {
          const scale = Math.min(MAX_DIM / outWidth, MAX_DIM / outHeight);
          outWidth *= scale;
          outHeight *= scale;
      }

      canvas.width = outWidth;
      canvas.height = outHeight;

      // Draw
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, outWidth, outHeight);

      // Export
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Blob generation failed'));
          return;
        }
        const variantUrl = URL.createObjectURL(blob);
        
        resolve({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          parentId: media.id,
          platform: platformConfig.id,
          url: variantUrl,
          thumbnailUrl: variantUrl,
          width: outWidth,
          height: outHeight,
          createdAt: new Date().toISOString(),
          generatedBy: 'ai',
          status: 'ready'
        });
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => reject(new Error('Failed to load image for processing'));
  });
};
