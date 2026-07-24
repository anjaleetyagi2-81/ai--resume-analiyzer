const { v4: uuidv4 } = require('uuid');
const { extractTextFromResume, normalizeResumeText } = require('../services/parser.service');
const { analyzeResumeWithAI } = require('../services/openai.service');
const { detectSkills, findMissingSkills, computeAtsScore } = require('../utils/atsScore');

/**
 * POST /api/resume/analyze
 * Accepts a multipart/form-data upload with field "resume" (PDF/DOCX)
 * and an optional "jobDescription" text field.
 */
async function analyzeResume(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No resume file was uploaded. Please attach a PDF or DOCX file.',
    });
  }

  const { originalname, buffer, size, mimetype } = req.file;
  const jobDescription = (req.body.jobDescription || '').trim().slice(0, 6000);

  // 1. Extract raw text from the uploaded document
  const rawText = await extractTextFromResume(buffer, originalname);
  const resumeText = normalizeResumeText(rawText);

  // 2. Deterministic, rule-based skill detection + ATS scoring
  const detectedSkills = detectSkills(resumeText);
  const missingSkills = findMissingSkills(detectedSkills, jobDescription);
  const ruleBasedAts = computeAtsScore(resumeText, detectedSkills);

  // 3. AI-powered qualitative analysis (strengths, weaknesses, suggestions, etc.)
  const aiResult = await analyzeResumeWithAI(resumeText, jobDescription);

  // 4. Blend the deterministic score with the AI's own estimate for a
  //    final score that is both explainable and context-aware.
  const finalAtsScore = aiResult.estimatedAtsScore
    ? Math.round(ruleBasedAts.score * 0.6 + aiResult.estimatedAtsScore * 0.4)
    : ruleBasedAts.score;

  // 5. Merge skill lists (dictionary-based + AI-detected), deduplicated
  const mergedDetectedSkills = Array.from(
    new Set([...detectedSkills, ...aiResult.detectedSkills].map((s) => s.trim()).filter(Boolean))
  );
  const mergedMissingSkills = Array.from(
    new Set([...missingSkills, ...aiResult.missingSkills].map((s) => s.trim()).filter(Boolean))
  );

  const response = {
    success: true,
    analysisId: uuidv4(),
    fileMeta: {
      originalName: originalname,
      sizeBytes: size,
      mimeType: mimetype,
    },
    atsScore: finalAtsScore,
    atsBreakdown: ruleBasedAts.breakdown,
    atsStats: ruleBasedAts.stats,
    summary: aiResult.summary,
    atsCompatibilityNotes: aiResult.atsCompatibilityNotes,
    roleFitSummary: aiResult.roleFitSummary,
    strengths: aiResult.strengths,
    weaknesses: aiResult.weaknesses,
    detectedSkills: mergedDetectedSkills,
    missingSkills: mergedMissingSkills,
    suggestions: aiResult.suggestions,
    improvedBulletExamples: aiResult.improvedBulletExamples,
    jobDescriptionProvided: Boolean(jobDescription),
    generatedAt: new Date().toISOString(),
  };

  return res.status(200).json(response);
}

/**
 * GET /api/resume/health
 * Lightweight liveness/readiness probe for load balancers and container orchestrators.
 */
function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
}

module.exports = { analyzeResume, healthCheck };
