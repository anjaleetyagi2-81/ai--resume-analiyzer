import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X, ScanLine } from 'lucide-react';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_MB = 5;

export default function FileUpload({ onAnalyze, isLoading, progress }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateAndSetFile = useCallback((candidate) => {
    setError('');
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(candidate);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      validateAndSetFile(dropped);
    },
    [validateAndSetFile]
  );

  const handleSubmit = () => {
    if (!file || isLoading) return;
    onAnalyze(file, jobDescription);
  };

  return (
    <div id="analyzer" className="card scroll-mt-24 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="eyebrow">Step 1</span>
        <span className="h-px flex-1 bg-ink-900/[0.06]" />
      </div>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            isDragging
              ? 'border-scan bg-scan/[0.06]'
              : 'border-ink-900/15 bg-paper-soft hover:border-ink-900/30'
          }`}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-0">
              <div className="h-16 w-full bg-gradient-to-b from-transparent via-scan/25 to-transparent animate-scanline" />
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-highlighter">
            <UploadCloud size={24} />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-ink-900">
            Drop your resume here, or click to browse
          </p>
          <p className="mt-1.5 text-sm text-ink-400">Supports PDF and DOCX, up to {MAX_SIZE_MB}MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-ink-900/[0.08] bg-paper-soft px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-scan/10 text-scan">
            <FileText size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink-900">{file.name}</p>
            <p className="text-xs text-ink-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {!isLoading && (
            <button
              onClick={() => setFile(null)}
              aria-label="Remove file"
              className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ink-900/5 hover:text-ink-900"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

      <div className="mt-6">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
          Target job description
          <span className="pill bg-ink-900/5 text-ink-400">Optional</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste a job description to get tailored missing-skills and keyword matching..."
          rows={4}
          className="w-full resize-none rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:border-scan focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="btn-primary mt-6 w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <ScanLine className="animate-pulse" size={18} />
            Scanning resume{progress ? ` — ${progress}%` : '...'}
          </>
        ) : (
          <>
            <ScanLine size={18} />
            Run ATS analysis
          </>
        )}
      </button>
    </div>
  );
}
