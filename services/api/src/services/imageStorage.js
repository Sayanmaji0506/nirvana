const fs = require('fs');
const path = require('path');
let ImageKit = null;
try {
  ImageKit = require('imagekit');
} catch (e) {
  // ImageKit module optional
}

class StorageService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (ImageKit && publicKey && privateKey && urlEndpoint) {
      this.imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint
      });
      console.log('[STORAGE] Initialized with ImageKit.io provider');
    } else {
      this.imagekit = null;
      console.log('[STORAGE] ImageKit credentials not configured; using local disk storage fallback (/uploads)');
    }
  }

  async saveFile(file, folder = 'reports') {
    if (!file) return null;

    // 1. If ImageKit is configured, upload to cloud
    if (this.imagekit) {
      try {
        const result = await this.imagekit.upload({
          file: file.buffer,
          fileName: `nirvana_${Date.now()}_${file.originalname || 'file.jpg'}`,
          folder: `/${folder}`
        });
        return result.url;
      } catch (error) {
        console.warn('[STORAGE] ImageKit upload error, falling back to disk:', error.message);
      }
    }

    // 2. Local disk fallback
    const filename = `${Date.now()}-${file.originalname || 'upload.bin'}`;
    const destinationPath = path.join(this.uploadsDir, filename);

    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, destinationPath);
    }

    return `/uploads/${filename}`;
  }
}

module.exports = new StorageService();
