import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_OPTIMIZED_IMAGE_BYTES = 1024 * 1024;
export const MAX_PROFILE_IMAGE_DIMENSION = 1024;

const MAX_INPUT_PIXELS = 25_000_000;

export class ImageOptimizationError extends Error {}

export function hasValidImageSignature(type: string, buffer: Buffer) {
  if (type === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return type === "image/webp" && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
}

/** Normalizes profile images and deliberately drops EXIF metadata. */
export async function optimizeProfileImage(input: Buffer) {
  try {
    const image = sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({
        width: MAX_PROFILE_IMAGE_DIMENSION,
        height: MAX_PROFILE_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    for (const quality of [82, 72, 62]) {
      const output = await image.clone().webp({ quality, effort: 4 }).toBuffer();
      if (output.length <= MAX_OPTIMIZED_IMAGE_BYTES) return output;
    }

    throw new ImageOptimizationError("Fotoğraf 1 MB sınırına indirilemedi. Lütfen daha küçük bir fotoğraf seçin.");
  } catch (error) {
    if (error instanceof ImageOptimizationError) throw error;
    throw new ImageOptimizationError("Fotoğraf işlenemedi. Lütfen geçerli bir JPG, PNG veya WebP dosyası seçin.");
  }
}
