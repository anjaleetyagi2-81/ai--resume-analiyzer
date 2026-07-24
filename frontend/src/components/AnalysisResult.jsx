import { ThumbsUp, ThumbsDown, FileDown } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SkillsPanel from './SkillsPanel';
import SuggestionsPanel from './SuggestionsPanel';
import { downloadAnalysisReport } from '../utils/pdfReport';

const BREAKDOWN_LABELS = {
  contactInfo: 'Contact info',
  professionalProfile: 'Professional profile',
  sectionStructure: 'Section structure',
  actionVerbs: 'Action verbs',
  quantifiedImpact: 'Quantified impact',
  skillsCoverage: 'Skills coverage',
  lengthAppropriateness: 'Length',
  formattingCleanliness: 'Formatting',
};

const BREAKDOWN_MAX = {
  contactInfo: 10,
  professionalProfile: 5,
  sectionStructure: 20,
  actionVerbs: 15,
  quantifiedImpact: 15,
  skillsCoverage: 20,
  lengthAppropriateness: 10,
  formattingCleanliness: 5,
};

export default function AnalysisResult({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Header row: score + summary + actions */}
      <div className="card grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center md:justify-start">
          <ScoreGauge score={result.atsScore} size={180} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="eyebrow">Analysis complete</span>
          <h2 className="mt-1.5 font-display text-xl font-semibold text-ink-900 sm:text-2xl">
            {result.fileMeta?.originalName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">{result.summary}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => downloadAnalysisReport(result)}
              className="btn-primary"
            >
              <FileDown size={16} />
              Download PDF report
            </button>
            <button onClick={onReset} className="btn-secondary">
              Analyze another resume
            </button>
          </div>
        </div>
      </div>

      {/* ATS breakdown */}
      <div className="card p-6 sm:p-8">
        <h3 className="mb-5 font-display text-sm font-semibold text-ink-900">
          Score breakdown
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(result.atsBreakdown || {}).map(([key, value]) => {
            const max = BREAKDOWN_MAX[key] || 10;
            const pct = Math.round((value / max) * 100);
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-500">
                    {BREAKDOWN_LABELS[key] || key}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink-900">
                    {value}/{max}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.06]">
                  <div
                    className="h-full rounded-full bg-scan transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {result.atsCompatibilityNotes && (
          <p className="mt-6 rounded-xl bg-scan/[0.06] p-4 text-sm text-ink-600">
            <span className="font-semibold text-scan">ATS note: </span>
            {result.atsCompatibilityNotes}
          </p>
        )}
      </div>

      {/* Strengths / weaknesses */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <ThumbsUp size={16} />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink-900">Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {(result.strengths || []).map((s, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <ThumbsDown size={16} />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink-900">Areas to improve</h3>
          </div>
          <ul className="space-y-2.5">
            {(result.weaknesses || []).map((w, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {result.roleFitSummary && (
        <div className="card p-6 sm:p-8">
          <h3 className="mb-2 font-display text-sm font-semibold text-ink-900">Role fit</h3>
          <p className="text-sm leading-relaxed text-ink-500">{result.roleFitSummary}</p>
        </div>
      )}

      <SkillsPanel detectedSkills={result.detectedSkills} missingSkills={result.missingSkills} />

      <SuggestionsPanel
        suggestions={result.suggestions}
        improvedBulletExamples={result.improvedBulletExamples}
      />
    </div>
  );
}
