import { ScanLine } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-900/[0.06] bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-highlighter">
            <ScanLine size={18} strokeWidth={2.4} />
          </span>
          <div className="leading-none">
            <p className="font-display text-[15px] font-semibold text-ink-900">
              Resume<span className="text-scan">Scan</span>
            </p>
            <p className="font-mono text-[10px] tracking-wide text-ink-400">AI ATS ANALYZER</p>
          </div>
        </div>

        <nav className="hidden items-center gap-7 sm:flex">
          <a href="#how-it-works" className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors">
            How it works
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="#analyzer"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700 transition-colors"
          >
            Analyze resume
          </a>
        </nav>
      </div>
    </header>
  );
}
