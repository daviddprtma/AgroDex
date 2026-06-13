import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve('public/images');

const assetsToOptimize = [
  {
    url: 'https://assets-gen.codenut.dev/images/1761634617_bb2f7a28.png',
    dest: 'hero.webp',
    width: 1000,
    height: 1000,
    fit: 'cover'
  },
  {
    url: 'https://assets-gen.codenut.dev/images/1761555183_d10ca27c.png',
    dest: 'verify-hero.webp',
    width: 1200,
    height: 500,
    fit: 'cover'
  },
  {
    url: 'https://assets-gen.codenut.dev/images/1761557179_721de6c2.png',
    dest: 'auth-hero.webp',
    width: 600,
    height: null,
    fit: 'inside'
  }
];

async function main() {
  try {
    // Ensure public/images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log(`✓ Directory verified: ${IMAGES_DIR}`);

    for (const asset of assetsToOptimize) {
      console.log(`Downloading ${asset.url}...`);
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Failed to download ${asset.url}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const destPath = path.join(IMAGES_DIR, asset.dest);

      console.log(`Optimizing ${asset.dest}...`);
      let pipeline = sharp(buffer);
      
      if (asset.width || asset.height) {
        pipeline = pipeline.resize({
          width: asset.width || undefined,
          height: asset.height || undefined,
          fit: asset.fit,
          withoutEnlargement: true
        });
      }

      await pipeline
        .webp({ quality: 80 })
        .toFile(destPath);

      const stats = await fs.stat(destPath);
      const originalSizeKb = (buffer.length / 1024).toFixed(2);
      const optimizedSizeKb = (stats.size / 1024).toFixed(2);
      console.log(`✓ Saved ${asset.dest} (${optimizedSizeKb} KB vs original ${originalSizeKb} KB)`);
    }

    console.log('✓ All assets optimized successfully!');
  } catch (error) {
    console.error('Error during asset optimization:', error);
    process.exit(1);
  }
}

main();
