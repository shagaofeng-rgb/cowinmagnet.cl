import { createHash } from "node:crypto";
import fs from "node:fs";

// Verified supplier-brand artwork must never be used as public COWIN media.
// Hash matching keeps the policy independent of misleading file names.
const BLOCKED_MEDIA_SHA256 = new Set([
  "F4549A3847F3D6419F6A0CC94260F9CBEBF47FD46CD28294D7519F0937F92B0A",
  "A330F8E82C34236C21E1EB8B610DD6DA504EBF442EB5DBACBE1F85DF319BEAFF",
  "2FB9A7C199FF9A1DE740CF3F768BBEF696329CF0AE167C9A05FBF8982A6D8C2E"
]);

export function assetHash(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

export function isAllowedProductMedia(filePath) {
  return !BLOCKED_MEDIA_SHA256.has(assetHash(filePath));
}

export { BLOCKED_MEDIA_SHA256 };
