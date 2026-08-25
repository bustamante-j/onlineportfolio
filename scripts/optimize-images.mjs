import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewWidths = [480, 800];
const collections = [
  {
    source: ["public", "uploads", "commissions"],
    output: ["public", "uploads", "thumbnails", "commissions"]
  },
  {
    source: ["public", "uploads", "flyers"],
    output: ["public", "uploads", "thumbnails", "flyers"]
  },
  {
    source: ["public", "uploads", "canva-projects"],
    output: ["public", "uploads", "thumbnails", "canva-projects"]
  },
  {
    source: ["images", "social-media", "rm-tiles-center"],
    output: ["images", "social-media", "thumbnails", "rm-tiles-center"]
  },
  {
    source: ["images", "social-media", "ja-tiles-trading"],
    output: ["images", "social-media", "thumbnails", "ja-tiles-trading"]
  },
  {
    source: ["images", "social-media", "inkpoint-prints-services"],
    output: ["images", "social-media", "thumbnails", "inkpoint-prints-services"]
  }
];
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const isCurrent = async (sourcePath, outputPath) => {
  try {
    const [sourceInfo, outputInfo] = await Promise.all([stat(sourcePath), stat(outputPath)]);
    return outputInfo.mtimeMs >= sourceInfo.mtimeMs;
  } catch {
    return false;
  }
};

const createPreview = async (sourcePath, outputPath, width, format) => {
  if (await isCurrent(sourcePath, outputPath)) return false;

  const pipeline = sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true, fit: "inside" });

  if (format === "avif") {
    await pipeline.avif({ quality: 58, effort: 4 }).toFile(outputPath);
  } else {
    await pipeline.webp({ quality: 78, smartSubsample: true }).toFile(outputPath);
  }

  return true;
};

let generatedCount = 0;

for (const collection of collections) {
  const sourceDirectory = path.join(projectRoot, ...collection.source);
  const outputDirectory = path.join(projectRoot, ...collection.output);
  await mkdir(outputDirectory, { recursive: true });

  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  const images = entries.filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()));

  for (const image of images) {
    const sourcePath = path.join(sourceDirectory, image.name);
    const baseName = path.parse(image.name).name;

    for (const width of previewWidths) {
      for (const format of ["avif", "webp"]) {
        const outputPath = path.join(outputDirectory, `${baseName}-${width}.${format}`);
        if (await createPreview(sourcePath, outputPath, width, format)) generatedCount += 1;
      }
    }
  }
}

console.log(generatedCount > 0
  ? `Generated ${generatedCount} optimized portfolio previews.`
  : "Portfolio previews are already optimized.");
