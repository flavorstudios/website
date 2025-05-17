const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sourceDir = path.join(__dirname, "../public");
const targetDir = path.join(sourceDir, "optimized");

const validExtensions = [".jpg", ".jpeg", ".png"];

function walk(dir) {
  let files = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getOutputPath(inputPath) {
  const relative = path.relative(sourceDir, inputPath);
  return path.join(targetDir, relative).replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

async function convertToWebP(file) {
  const outputPath = getOutputPath(file);
  ensureDir(path.dirname(outputPath));

  if (fs.existsSync(outputPath)) return; // Skip if already optimized

  try {
    await sharp(file).webp({ quality: 80 }).toFile(outputPath);
    console.log(`✅ Converted: ${file} → ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to convert ${file}: ${error.message}`);
  }
}

async function optimizeAll() {
  const allFiles = walk(sourceDir).filter((f) =>
    validExtensions.includes(path.extname(f).toLowerCase())
  );
  for (const file of allFiles) {
    await convertToWebP(file);
  }
}

optimizeAll();
