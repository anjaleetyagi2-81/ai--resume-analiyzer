const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extracts raw text content from a resume file buffer.
 * Supports PDF and DOCX (and legacy DOC via mammoth's best-effort support).
 *
 * @param {Buffer} buffer - The uploaded file's binary content.
 * @param {string} originalName - Original filename (used to infer type).
 * @returns {Promise<string>} extracted plain text
 */
async function extractTextFromResume(buffer, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();

  if (ext === '.pdf') {
    return extractFromPdf(buffer);
  }

  if (ext === '.docx' || ext === '.doc') {
    return extractFromDocx(buffer);
  }

  const err = new Error('Unsupported file extension for parsing.');
  err.status = 400;
  throw err;
}

async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    if (!text) {
      const err = new Error(
        'Could not extract any text from the PDF. It may be a scanned image without a text layer.'
      );
      err.status = 422;
      throw err;
    }
    return text;
  } catch (err) {
    if (err.status) throw err;
    const parseErr = new Error('Failed to parse the PDF file.');
    parseErr.status = 422;
    throw parseErr;
  }
}

async function extractFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    if (!text) {
      const err = new Error('Could not extract any text from the Word document.');
      err.status = 422;
      throw err;
    }
    return text;
  } catch (err) {
    if (err.status) throw err;
    const parseErr = new Error('Failed to parse the DOCX file.');
    parseErr.status = 422;
    throw parseErr;
  }
}

/**
 * Cleans and normalizes extracted resume text:
 * - collapses excessive whitespace
 * - removes non-printable characters
 * - trims to a safe max length for LLM context
 */
function normalizeResumeText(rawText, maxChars = 15000) {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned.length > maxChars ? cleaned.slice(0, maxChars) : cleaned;
}

module.exports = { extractTextFromResume, normalizeResumeText };
