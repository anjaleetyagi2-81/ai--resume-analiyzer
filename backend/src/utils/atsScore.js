/**
 * Rule-based ATS (Applicant Tracking System) compatibility scoring.
 *
 * This is intentionally deterministic and independent of the LLM so that:
 *  1. Users get a consistent, explainable score even if the AI call fails.
 *  2. The AI-generated qualitative analysis can be blended with this
 *     objective score for a more trustworthy final number.
 */

const COMMON_SECTION_HEADERS = [
  'experience',
  'work experience',
  'employment history',
  'education',
  'skills',
  'projects',
  'certifications',
  'summary',
  'objective',
  'achievements',
  'awards',
  'publications',
];

const ACTION_VERBS = [
  'led', 'managed', 'built', 'designed', 'developed', 'implemented',
  'created', 'launched', 'improved', 'increased', 'decreased', 'reduced',
  'optimized', 'architected', 'automated', 'delivered', 'drove', 'spearheaded',
  'collaborated', 'analyzed', 'streamlined', 'mentored', 'negotiated',
  'coordinated', 'executed', 'engineered', 'deployed', 'scaled',
];

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_REGEX = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const LINKEDIN_REGEX = /linkedin\.com\/in\//i;
const METRIC_REGEX = /\b\d+(\.\d+)?\s?(%|percent|x|k|m|\+)?\b/gi;

// A broad, extensible technical + soft skills dictionary used for
// keyword-based skill detection when cross-referencing a job description.
const SKILLS_DICTIONARY = [
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
  'ruby', 'php', 'swift', 'kotlin', 'rust', 'scala', 'r', 'sql', 'html', 'css',
  // Frameworks / libraries
  'react', 'react.js', 'angular', 'vue', 'next.js', 'nuxt', 'node.js', 'express',
  'django', 'flask', 'spring', 'spring boot', '.net', 'laravel', 'rails',
  'tailwind', 'bootstrap', 'redux', 'graphql', 'rest api', 'fastapi',
  // Data / AI
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch',
  'scikit-learn', 'pandas', 'numpy', 'data analysis', 'data science',
  'artificial intelligence', 'llm', 'openai', 'computer vision',
  // Cloud / DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform',
  'ci/cd', 'jenkins', 'github actions', 'devops', 'linux', 'nginx',
  // Databases
  'mongodb', 'postgresql', 'mysql', 'redis', 'dynamodb', 'firebase', 'elasticsearch',
  // Tools / practices
  'git', 'github', 'gitlab', 'jira', 'agile', 'scrum', 'kanban', 'unit testing',
  'test-driven development', 'tdd', 'microservices', 'system design',
  // Soft skills
  'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
  'time management', 'stakeholder management', 'mentoring', 'collaboration',
];

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.filter((p) => lower.includes(p.toLowerCase())).length;
}

function detectSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of SKILLS_DICTIONARY) {
    // word-boundary-ish match to avoid partial substring false positives
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

function findMissingSkills(resumeSkills, jobDescriptionText) {
  if (!jobDescriptionText) return [];
  const jdSkills = detectSkills(jobDescriptionText);
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  return jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
}

/**
 * Computes a deterministic 0-100 ATS compatibility score based on
 * structural and content heuristics widely used by real ATS systems.
 */
function computeAtsScore(resumeText, detectedSkills) {
  const breakdown = {};
  let score = 0;

  // 1. Contact info present (10 pts)
  const hasEmail = EMAIL_REGEX.test(resumeText);
  const hasPhone = PHONE_REGEX.test(resumeText);
  const contactPoints = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0);
  breakdown.contactInfo = contactPoints;
  score += contactPoints;

  // 2. LinkedIn / professional profile (5 pts)
  const hasLinkedIn = LINKEDIN_REGEX.test(resumeText);
  breakdown.professionalProfile = hasLinkedIn ? 5 : 0;
  score += breakdown.professionalProfile;

  // 3. Section headers present (20 pts, ~1.7 pts per common header up to cap)
  const sectionMatches = countMatches(resumeText, COMMON_SECTION_HEADERS);
  const sectionScore = Math.min(20, Math.round((sectionMatches / 6) * 20));
  breakdown.sectionStructure = sectionScore;
  score += sectionScore;

  // 4. Action verbs / strong language (15 pts)
  const verbMatches = countMatches(resumeText, ACTION_VERBS);
  const verbScore = Math.min(15, Math.round((verbMatches / 10) * 15));
  breakdown.actionVerbs = verbScore;
  score += verbScore;

  // 5. Quantified achievements / metrics (15 pts)
  const metricMatches = (resumeText.match(METRIC_REGEX) || []).length;
  const metricScore = Math.min(15, Math.round((metricMatches / 8) * 15));
  breakdown.quantifiedImpact = metricScore;
  score += metricScore;

  // 6. Skills density (20 pts)
  const skillScore = Math.min(20, Math.round((detectedSkills.length / 12) * 20));
  breakdown.skillsCoverage = skillScore;
  score += skillScore;

  // 7. Length appropriateness (10 pts) - penalize very short or very long resumes
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  let lengthScore = 10;
  if (wordCount < 150) lengthScore = 3;
  else if (wordCount < 250) lengthScore = 6;
  else if (wordCount > 1200) lengthScore = 6;
  breakdown.lengthAppropriateness = lengthScore;
  score += lengthScore;

  // 8. Formatting red flags (5 pts) - tables/columns/images can't be reliably
  // checked from extracted text alone, so we look for proxy signals like
  // excessive special characters which often indicate broken table parsing.
  const specialCharRatio =
    (resumeText.match(/[^\w\s.,;:()\-@/]/g) || []).length / Math.max(resumeText.length, 1);
  const formattingScore = specialCharRatio < 0.02 ? 5 : specialCharRatio < 0.05 ? 3 : 0;
  breakdown.formattingCleanliness = formattingScore;
  score += formattingScore;

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    breakdown,
    stats: {
      wordCount,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      sectionMatches,
      verbMatches,
      metricMatches,
    },
  };
}

module.exports = {
  detectSkills,
  findMissingSkills,
  computeAtsScore,
  SKILLS_DICTIONARY,
};
