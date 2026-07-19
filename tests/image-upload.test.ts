import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  hasValidImageSignature,
  MAX_OPTIMIZED_IMAGE_BYTES,
  MAX_PROFILE_IMAGE_DIMENSION,
  optimizeProfileImage,
} from "../src/lib/image-upload";

test("profile photo uploads are resized and stored as compact WebP files", async () => {
  const input = await sharp({
    create: { width: 2200, height: 1400, channels: 3, background: { r: 245, g: 110, b: 35 } },
  })
    .png()
    .toBuffer();

  const output = await optimizeProfileImage(input);
  const metadata = await sharp(output).metadata();

  assert.equal(metadata.format, "webp");
  assert.ok((metadata.width ?? Infinity) <= MAX_PROFILE_IMAGE_DIMENSION);
  assert.ok((metadata.height ?? Infinity) <= MAX_PROFILE_IMAGE_DIMENSION);
  assert.ok(output.length <= MAX_OPTIMIZED_IMAGE_BYTES);
});

test("declared image types must match their file signature", () => {
  assert.equal(hasValidImageSignature("image/png", Buffer.from("not an image")), false);
});
