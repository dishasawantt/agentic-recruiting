import mammoth from "mammoth";

function isPdfBuffer(buf: Buffer) {
  return buf.length >= 5 && buf.subarray(0, 5).toString() === "%PDF-";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mime: string,
  name: string
): Promise<string> {
  const lower = name.toLowerCase();
  const mimeLower = (mime || "").toLowerCase();

  if (mimeLower === "text/plain" || lower.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  const treatAsPdf =
    mimeLower === "application/pdf" ||
    lower.endsWith(".pdf") ||
    (mimeLower === "application/octet-stream" && isPdfBuffer(buffer));

  if (treatAsPdf) {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return data.text?.trim() ?? "";
    } catch {
      throw new Error(
        "Could not read this PDF (try DOCX/TXT or paste resume text). Some hosts cannot parse all PDFs."
      );
    }
  }

  const treatAsDocx =
    mimeLower ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx");

  if (treatAsDocx) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }
  if (mimeLower === "application/msword" || lower.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc is not supported. Please save as .docx or PDF."
    );
  }
  throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
}
