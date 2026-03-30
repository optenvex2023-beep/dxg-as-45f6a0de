import { supabase } from "@/integrations/supabase/client";

type ReportVersionUploadType = "first" | "final";

interface UploadReportVersionParams {
  file: File;
  reportId: string | null | undefined;
  reportType: ReportVersionUploadType;
}

function sanitizeFileName(fileName: string) {
  const trimmed = fileName.trim();
  const normalized = trimmed.normalize("NFC").replace(/\s+/g, "_");
  return encodeURIComponent(normalized);
}

function resolveContentType(file: File) {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  return "application/octet-stream";
}

export async function uploadReportVersionFile({ file, reportId, reportType }: UploadReportVersionParams) {
  console.log("[ReportVersionUpload] 1) 파일 선택됨:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  console.log("[ReportVersionUpload] 2) report_id 확인:", reportId);

  if (!reportId) {
    const message = "report_id가 없어 파일을 업로드할 수 없습니다.";
    console.error("[ReportVersionUpload] report_id missing:", message);
    throw new Error(message);
  }

  const safeFileName = sanitizeFileName(file.name);
  const storagePath = `${reportType}/${reportId}/${Date.now()}_${safeFileName}`;
  const contentType = resolveContentType(file);
  const fileBuffer = await file.arrayBuffer();

  console.log("[ReportVersionUpload] 3) Storage upload 실행:", {
    bucket: "report-files",
    storagePath,
    contentType,
  });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("report-files")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  console.log("[ReportVersionUpload] 4) Storage upload 결과:", {
    uploadData,
    error: uploadError
      ? {
          message: uploadError.message,
          name: uploadError.name,
        }
      : null,
  });

  if (uploadError) {
    throw new Error(`Storage 업로드 실패: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("report-files").getPublicUrl(storagePath);

  return {
    fileUrl: publicUrlData.publicUrl,
    storagePath,
  };
}