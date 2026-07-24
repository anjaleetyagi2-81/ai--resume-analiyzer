const express = require('express');
const { upload } = require('../middleware/upload.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { analyzeResume, healthCheck } = require('../controllers/resume.controller');

const router = express.Router();

// GET /api/resume/health
router.get('/health', healthCheck);

// POST /api/resume/analyze  (multipart/form-data: resume=<file>, jobDescription=<text>)
router.post('/analyze', upload.single('resume'), asyncHandler(analyzeResume));

module.exports = router;
