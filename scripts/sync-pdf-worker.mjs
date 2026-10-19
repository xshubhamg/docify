import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const targetDirectory = join(root, "public");
const target = join(targetDirectory, "pdf.worker.min.mjs");

await mkdir(targetDirectory, { recursive: true });
await copyFile(source, target);

console.log("Synced pdfjs worker to public/pdf.worker.min.mjs");
