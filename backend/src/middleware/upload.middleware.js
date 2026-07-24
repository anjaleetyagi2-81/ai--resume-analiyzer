const multer = require('multer');
const path = require('path');

// We keep uploaded files in memory (Buffer) rather than writing to disk.
// This is safer for containerized / stateless deployments (e.g. AWS App Runner)
// where the filesystem may be ephemeral.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeOk && extOk) {
    return cb(null, true);
  }

  const err = new Error(
    'Unsupported file type. Please upload a PDF or DOCX resume.'
  );
  err.status = 400;
  return cb(err, false);
}

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
});

module.exports = { upload };
