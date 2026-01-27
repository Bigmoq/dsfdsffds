/**
 * Compresses an image file before upload
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Compressed image as a Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  // Skip compression for non-image files
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip compression for small files (less than 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }

  // Skip compression for GIFs (to preserve animation)
  if (file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Return original if canvas context fails
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Return original if blob creation fails
              return;
            }

            // Only use compressed version if it's actually smaller
            if (blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression didn't help
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Return original if image loading fails
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("فشل في قراءة الملف"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple images in parallel
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<File[]> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options || {};
  
  const compressionPromises = files.map((file) =>
    compressImage(file, maxWidth, maxHeight, quality)
  );
  
  return Promise.all(compressionPromises);
}

/**
 * Formats file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
