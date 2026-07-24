import { Check, AlertTriangle } from 'lucide-react';

export default function SkillsPanel({ detectedSkills = [], missingSkills = [] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <Check size={16} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Detected skills ({detectedSkills.length})
          </h3>
        </div>
        {detectedSkills.length ? (
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill) => (
              <span key={skill} className="pill bg-success-soft text-success capitalize">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">No clear skill keywords detected.</p>
        )}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-highlighter/20 text-highlighter-strong">
            <AlertTriangle size={16} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Missing / recommended ({missingSkills.length})
          </h3>
        </div>
        {missingSkills.length ? (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span key={skill} className="pill bg-highlighter/15 text-highlighter-strong capitalize">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">
            No obvious gaps found — add a job description for tailored keyword matching.
          </p>
        )}
      </div>
    </div>
  );
}
