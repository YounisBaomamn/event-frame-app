export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Enable CORS for remote frames
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error(`فشل تحميل الصورة: ${url}`));
    image.src = url;
  });

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Calculate the bounding box of a rotated rectangle
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface MergeOptions {
  imageSrc: string;
  frameSrc: string;
  cropPixels: Area;
  rotation?: number;
  flipHorizontal?: boolean;
  outputFormat?: 'image/png' | 'image/jpeg';
  quality?: number;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Merges the user's photo (with pan, zoom, rotation, and flip)
 * with the event frame overlay onto a single high-resolution HTML5 Canvas.
 */
export async function mergeImagesWithFrame({
  imageSrc,
  frameSrc,
  cropPixels,
  rotation = 0,
  flipHorizontal = false,
  outputFormat = 'image/png',
  quality = 0.95,
  targetWidth,
  targetHeight,
}: MergeOptions): Promise<Blob> {
  const [userImg, frameImg] = await Promise.all([
    createImage(imageSrc),
    createImage(frameSrc),
  ]);

  // Output size: optimal high-resolution for mobile and social media (up to 2160px)
  const maxDim = 2160;
  const naturalW = frameImg.naturalWidth || 2048;
  const naturalH = frameImg.naturalHeight || 2048;
  const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
  const outputW = targetWidth || Math.round(naturalW * scale);
  const outputH = targetHeight || Math.round(naturalH * scale);

  // 1. Create an intermediate canvas for rotating & flipping user's photo
  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    userImg.naturalWidth,
    userImg.naturalHeight,
    rotation
  );

  const intermediateCanvas = document.createElement('canvas');
  intermediateCanvas.width = Math.round(bBoxWidth);
  intermediateCanvas.height = Math.round(bBoxHeight);
  const intermediateCtx = intermediateCanvas.getContext('2d');

  if (!intermediateCtx) {
    throw new Error('تعذر إنشاء سياق الرسم للكانفاس المؤقت');
  }

  // Smooth scaling
  intermediateCtx.imageSmoothingEnabled = true;
  intermediateCtx.imageSmoothingQuality = 'high';

  // Apply rotation and flip around the center
  intermediateCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  intermediateCtx.rotate(rotRad);
  intermediateCtx.scale(flipHorizontal ? -1 : 1, 1);
  intermediateCtx.translate(-userImg.naturalWidth / 2, -userImg.naturalHeight / 2);
  intermediateCtx.drawImage(userImg, 0, 0);

  // 2. Create the final canvas with target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = outputW;
  finalCanvas.height = outputH;
  const finalCtx = finalCanvas.getContext('2d');

  if (!finalCtx) {
    throw new Error('تعذر إنشاء سياق الرسم للكانفاس النهائي');
  }

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';

  // 3. Draw the cropped portion of the user's transformed photo to fill the canvas
  finalCtx.drawImage(
    intermediateCanvas,
    Math.round(cropPixels.x),
    Math.round(cropPixels.y),
    Math.round(cropPixels.width),
    Math.round(cropPixels.height),
    0,
    0,
    outputW,
    outputH
  );

  // 4. Draw the event frame overlay on top
  finalCtx.drawImage(frameImg, 0, 0, outputW, outputH);

  // 5. Convert to Blob
  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('فشل تصدير الكانفاس إلى ملف صورة'));
        }
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Triggers a direct browser file download for a given Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
