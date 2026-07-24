export default function Footer() {
  return (
    <footer className="border-t border-ink-900/[0.06] bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-sm font-semibold text-ink-900">
              Resume<span className="text-scan">Scan</span>
            </p>
            <p className="mt-1 max-w-sm text-xs text-ink-400">
              Your resume is analyzed in memory and never stored. Built to help you pass the
              scanners and land the interview.
            </p>
          </div>
          <div className="flex gap-6 font-mono text-[11px] uppercase tracking-wide text-ink-400">
            <span>Privacy-first</span>
            <span>No sign-up</span>
            <span>Instant results</span>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-ink-300">
          © {new Date().getFullYear()} ResumeScan. For demonstration purposes — not affiliated
          with any employer's actual ATS system.
        </p>
      </div>
    </footer>
  );
}
