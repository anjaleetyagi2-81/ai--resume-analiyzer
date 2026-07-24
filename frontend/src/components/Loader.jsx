import { useEffect, useState } from 'react';

const STEPS = [
  'Extracting text from your document...',
  'Detecting skills and keywords...',
  'Scoring ATS compatibility...',
  'Generating AI-powered suggestions...',
];

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card flex flex-col items-center gap-5 p-10 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-scan/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink-900">
          <div className="h-8 w-8 overflow-hidden rounded-sm bg-paper">
            <div className="h-2 w-full bg-highlighter animate-scanline" />
          </div>
        </div>
      </div>
      <div>
        <p className="font-display text-base font-semibold text-ink-900">Analyzing your resume</p>
        <p className="mt-1 font-mono text-xs text-ink-400">{STEPS[stepIndex]}</p>
      </div>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ink-900/10">
        <div className="h-full w-1/3 animate-loadbar rounded-full bg-scan" />
      </div>

    </div>
  );
}
