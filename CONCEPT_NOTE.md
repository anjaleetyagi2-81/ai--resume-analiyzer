# Concept Note: AI Resume Analyzer (ResumeScan)

## The idea, in one sentence

A free, private, instant tool that shows job seekers exactly how an Applicant Tracking System
and a recruiter would read their resume — and tells them precisely what to fix.

## The problem

Most job applications never reach a human. Automated ATS software filters candidates before a
recruiter opens the resume, and the criteria it uses — keyword matching, section parsing,
formatting compatibility — are invisible to applicants. A strong candidate can be filtered out
simply because their resume uses a table layout the parser can't read, or omits a keyword the
job posting emphasizes. Job seekers are left optimizing blind.

## The solution

ResumeScan gives candidates the same lens recruiters and ATS systems use:

- **An ATS Score (0–100)** that is both trustworthy and explainable — built from a transparent,
  rule-based scoring engine (structure, keywords, quantified impact, formatting) blended with an
  AI model's independent read of the document.
- **Skills detection**, so candidates see exactly what technical and soft skills their resume
  currently signals.
- **Missing-skills analysis** against a target job description, turning "why didn't I get an
  interview" into a concrete, closeable gap list.
- **AI-generated, recruiter-style feedback** — strengths, weaknesses, and role fit — written in
  plain, constructive language.
- **Actionable next steps**: ranked suggestions and literal before/after bullet-point rewrites,
  so feedback isn't abstract advice but something a candidate can paste directly into their
  resume.
- **A downloadable PDF report**, so the analysis isn't locked in a browser tab.

## Who it's for

- Active job seekers preparing applications for specific roles.
- Career changers unsure how their transferable skills read to an ATS.
- Students and early-career professionals building their first resumes.
- Career coaches and university career centers looking for a lightweight diagnostic tool.

## Why now

Large Language Models have made it possible to generate nuanced, recruiter-quality feedback at
near-zero marginal cost and in seconds — something that previously required paying a human
resume reviewer $50–200 per pass. Pairing that qualitative feedback with a deterministic,
explainable ATS score (rather than relying purely on an LLM's score, which can be inconsistent)
produces a tool that is both fast and trustworthy.

## What makes this approach different

Many "resume checker" tools either (a) rely entirely on a black-box AI score with no
explanation, or (b) use purely rule-based keyword matching with no real understanding of
context or writing quality. ResumeScan deliberately blends both:

- The **rule-based layer** is transparent, fast, free to compute, and works even if the AI
  service is unavailable — it's the safety net.
- The **AI layer** adds the nuance a pure keyword-matcher can't: is this bullet point actually
  well-written? Does this candidate's experience genuinely fit this role? What's the single
  highest-impact change they should make first?

## Product principles

1. **Privacy by default** — resumes are processed in memory and never persisted to disk or a
   database. No accounts, no tracking of resume content.
2. **Explainability over black-box scores** — every score component is visible and labeled.
3. **Actionable, not just descriptive** — every piece of feedback should map to something the
   user can do in the next five minutes.
4. **Fast** — from upload to full report in under 15–20 seconds in typical conditions.
5. **Accessible** — no sign-up wall; the core value is available immediately.

## Success looks like

- A user uploads a resume and, within seconds, understands their ATS risk level and the top 3
  changes that would most improve their odds.
- A user pastes a job description and immediately sees which keywords they're missing.
- A user downloads a PDF report and takes it into their next resume revision session.

## Scope boundaries (what this is not)

- Not a resume *builder* — it analyzes existing resumes rather than generating one from scratch
  (though the rewrite suggestions move in that direction for individual bullets).
- Not a guarantee of interview outcomes — it approximates ATS behavior; real systems vary by
  vendor and employer configuration.
- Not a data-retention or CRM product — no login, no resume history, no analytics on personal
  content.

## One-line pitch (elevator version)

"ResumeScan is the resume review you'd get from a recruiter friend and an ATS audit, combined —
delivered in under 20 seconds, for free, with nothing saved."
