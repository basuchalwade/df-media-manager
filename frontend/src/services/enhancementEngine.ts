
import { MediaItem, MediaVariant, EnhancementType } from '../types';

export const applyEnhancement = async (media: MediaItem, type: EnhancementType): Promise<MediaVariant> => {
  if (media.type === 'video') {
    // Mock video enhancement for Phase 4A (Preview Only)
    return {
      id: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      parentId: media.id,
      platform: 'All',
      url: media.url,
      thumbnailUrl: media.thumbnailUrl || media.url,
      width: media.metadata?.width || 1920,
      height: media.metadata?.height || 1080,
      createdAt: new Date().toISOString(),
      generatedBy: 'ai',
      status: 'ready',
      enhancementType: type
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

      // Default dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply Filter Logic
      ctx.filter = 'none'; // reset
      
      switch (type) {
        case 'auto_brightness':
          ctx.filter = 'brightness(115%) saturate(105%)';
          break;
        case 'auto_contrast':
          ctx.filter = 'contrast(120%) brightness(105%)';
          break;
        case 'smart_crop':
          // Simulate smart center crop (1:1)
          const dim = Math.min(img.width, img.height);
          canvas.width = dim;
          canvas.height = dim;
          break;
      }

      // Draw original image with filter
      // For smart crop, calculate center offsets
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
      
      if (type === 'smart_crop') {
        const dim = Math.min(img.width, img.height);
        sx = (img.width - dim) / 2;
        sy = (img.height - dim) / 2;
        sWidth = dim;
        sHeight = dim;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

      // Post-Processing Overlays
      if (type === 'brand_overlay') {
        // Add semi-transparent watermark
        ctx.filter = 'none'; // Don't filter the text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `bold ${Math.max(12, canvas.width * 0.04)}px Inter, sans-serif`;
        const text = "ContentCaster";
        const metrics = ctx.measureText(text);
        const padding = canvas.width * 0.02;
        
        // Draw bottom right
        const x = canvas.width - metrics.width - padding;
        const y = canvas.height - padding;
        
        // Shadow for readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(text, x, y);
      }

      // Export
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Enhancement blob generation failed'));
          return;
        }
        const variantUrl = URL.createObjectURL(blob);
        
        resolve({
          id: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          parentId: media.id,
          platform: 'All', // Enhancements are generic by default
          url: variantUrl,
          thumbnailUrl: variantUrl,
          width: canvas.width,
          height: canvas.height,
          createdAt: new Date().toISOString(),
          generatedBy: 'ai',
          status: 'ready',
          enhancementType: type
        });
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => reject(new Error('Failed to load image for enhancement'));
  });
};
