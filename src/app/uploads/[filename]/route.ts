import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_UPLOAD = /^[A-Za-z0-9_-]+\.(?:webp|jpe?g|png)$/;

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[filename]">) {
  const { filename } = await params;

  // Do not let a URL escape the upload directory.
  if (!ALLOWED_UPLOAD.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const extension = path.extname(filename).toLowerCase();
    const file = await readFile(path.join(process.cwd(), "public", "uploads", filename));

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
