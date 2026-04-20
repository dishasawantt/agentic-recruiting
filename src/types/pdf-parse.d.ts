declare module "pdf-parse" {
  import type { Buffer } from "buffer";
  function pdfParse(data: Buffer): Promise<{ text?: string }>;
  export default pdfParse;
}
