const multer = require('multer');

// Store in memory buffer so we can send to ImageKit or local disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB limit for images and voice notes
  }
});

module.exports = upload;
