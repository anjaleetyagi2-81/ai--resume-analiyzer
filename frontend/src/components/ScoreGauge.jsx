import { useEffect, useState } from 'react';

/**
 * Signature visual element: a circular "scanner dial" that reads out
 * the ATS compatibility score, with animated tick marks and a
 * count-up numeral rendered in monospace (like a scanner readout).
 */
export default function ScoreGauge({ score = 0, size = 200 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  useEffect(() => {
    let frame;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * clamped));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const color = clamped >= 75 ? '#15803D' : clamped >= 50 ? '#E29A1B' : '#B91C1C';
  const label = clamped >= 75 ? 'Strong match' : clamped >= 50 ? 'Needs work' : 'High risk';

  const tickCount = 40;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const angle = (i / tickCount) * 360;
    const isMajor = i % 5 === 0;
    const litUpTo = (clamped / 100) * tickCount;
    const isLit = i <= litUpTo;
    return { angle, isMajor, isLit };
  });

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE7D8"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.33,1,0.68,1), stroke 0.4s' }}
        />
      </svg>

      {/* Tick ring (decorative, evokes a scanner dial) */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="pointer-events-none absolute left-0 top-0"
      >
        {ticks.map((t, i) => {
          const inner = radius + 9;
          const outer = radius + (t.isMajor ? 15 : 12);
          const rad = (t.angle * Math.PI) / 180;
          const cx = size / 2;
          const cy = size / 2;
          const x1 = cx + inner * Math.cos(rad);
          const y1 = cy + inner * Math.sin(rad);
          const x2 = cx + outer * Math.cos(rad);
          const y2 = cy + outer * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={t.isLit ? color : '#DCD5C2'}
              strokeWidth={t.isMajor ? 2 : 1}
              opacity={t.isLit ? 0.9 : 0.5}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold tabular-nums text-ink-900">
          {displayScore}
        </span>
        <span className="font-mono text-[11px] tracking-wide text-ink-400">/ 100</span>
        <span
          className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color, backgroundColor: `${color}1A` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
