/**
 * File validation middleware
 * Checks MIME type and file size before accepting uploads
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Multer fileFilter — rejects non-image files at the Multer stage
 */
const multerFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Please upload JPEG, PNG, WebP, or GIF images.`), false);
  }
};

/**
 * Express middleware — validates file after Multer has parsed it
 */
const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please select an image.' });
  }

  if (req.file.size > MAX_FILE_SIZE_BYTES) {
    return res.status(413).json({
      error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
    });
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(415).json({
      error: 'Unsupported file type. Please upload JPEG, PNG, WebP, or GIF images.'
    });
  }

  next();
};

module.exports = { multerFileFilter, validateUpload, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };
