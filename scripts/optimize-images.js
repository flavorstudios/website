const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public');
const outputDir = path.join(__dirname, '../public/optimized');

const supportedFormats = ['.png', '.jpg', '.jpeg'];

function getAllImages(dirPath = inputDir, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      arrayOfFiles = getAllImages(fullPath, arrayOfFiles);
    } else if (supportedFormats.includes(path.extname(file).toLowerCase())) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function optimizeImage(filePath) {
  const relativePath = path.relative(inputDir, filePath);
  const outputPath = path.join(outputDir, relativePath).replace(/\.(png|jpg|jpeg)$/i, '.webp');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const buffer = fs.readFileSync(filePath);
  await sharp(buffer).resize({ width: 1280 }).toFormat('webp', { quality: 80 }).toFile(outputPath);
  console.log(`✅ Optimized: ${relativePath}`);
}

(async () => {
  const images = getAllImages();
  console.log(`🔍 Found ${images.length} image(s)...`);
  for (const image of images) {
    await optimizeImage(image);
  }
  console.log('🎉 Optimization complete.');
})();
