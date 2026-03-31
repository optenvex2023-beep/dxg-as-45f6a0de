import { supabase } from "@/integrations/supabase/client";

const BUCKET = "report-files";
const PHOTO_PREFIX = "report-photos";

/**
 * Upload a photo file to Supabase Storage.
 * Returns the storage path (not a blob URL).
 */
export async function uploadReportPhoto(
  file: File,
  reportType: "first" | "final",
  reportId: string,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext) ? ext : "jpg";
  const storagePath = `${PHOTO_PREFIX}/${reportType}/${reportId}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[reportPhotoStorage] upload error:", error);
    throw error;
  }
  return storagePath;
}

/**
 * Given a file_url value from DB, return a displayable image URL.
 * - If it's already an http(s) URL → return as-is
 * - If it's a blob: URL → return as-is (will only work in current session)
 * - Otherwise treat as a storage path → resolve to public URL
 */
export function resolvePhotoUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
  if (fileUrl.startsWith("blob:")) return fileUrl; // session-only preview
  // Treat as storage path
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileUrl);
  return data.publicUrl;
}
