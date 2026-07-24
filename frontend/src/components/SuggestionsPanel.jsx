import { Lightbulb, ArrowRight } from 'lucide-react';

export default function SuggestionsPanel({ suggestions = [], improvedBulletExamples = [] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="card p-6 lg:col-span-3">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-scan/10 text-scan">
            <Lightbulb size={16} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Suggestions, ranked by impact
          </h3>
        </div>
        <ol className="space-y-4">
          {suggestions.map((s, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-[11px] font-bold text-paper">
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-ink-900">{s.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{s.detail}</p>
              </div>
            </li>
          ))}
          {!suggestions.length && (
            <p className="text-sm text-ink-400">No suggestions available.</p>
          )}
        </ol>
      </div>

      <div className="card p-6 lg:col-span-2">
        <h3 className="mb-5 font-display text-sm font-semibold text-ink-900">
          Bullet point rewrites
        </h3>
        <div className="space-y-5">
          {improvedBulletExamples.map((ex, idx) => (
            <div key={idx} className="rounded-xl bg-paper-soft p-4">
              <p className="text-xs text-ink-400 line-through decoration-danger/50">
                {ex.original}
              </p>
              <div className="my-2 flex items-center gap-1.5 text-scan">
                <ArrowRight size={13} />
                <span className="font-mono text-[10px] uppercase tracking-wide">Improved</span>
              </div>
              <p className="text-sm font-medium text-ink-900">{ex.improved}</p>
            </div>
          ))}
          {!improvedBulletExamples.length && (
            <p className="text-sm text-ink-400">No rewrite examples available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
