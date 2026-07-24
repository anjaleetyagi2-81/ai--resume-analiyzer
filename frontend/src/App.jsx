import { useState } from 'react';
import { ShieldCheck, Sparkles, Gauge, AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import AnalysisResult from './components/AnalysisResult';
import { analyzeResume } from './services/api';

const HOW_IT_WORKS = [
  {
    icon: Gauge,
    title: 'Upload & parse',
    detail: 'We extract clean text from your PDF or DOCX resume in-memory — nothing is stored.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS scoring',
    detail: 'A rule-based engine checks structure, keywords, formatting, and quantified impact.',
  },
  {
    icon: Sparkles,
    title: 'AI feedback',
    detail: 'GPT reviews your resume like a recruiter, surfacing strengths, gaps, and rewrites.',
  },
];

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setError('');
    setProgress(0);
    try {
      const data = await analyzeResume(file, jobDescription, setProgress);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {!result && (
          <section className="mx-auto max-w-6xl px-5 pb-6 pt-14 sm:px-8 sm:pt-20">
            <div className="max-w-2xl">
              <span className="eyebrow">AI-Powered · Free · Private</span>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl">
                Will your resume pass the scanner{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">before a human sees it?</span>
                  <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-highlighter/60" />
                </span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                Upload your resume and get an instant ATS compatibility score, detected skills,
                gap analysis, and AI-written suggestions — modeled on how real Applicant
                Tracking Systems and recruiters actually read your resume.
              </p>
            </div>

            <div id="how-it-works" className="mt-10 grid gap-4 scroll-mt-24 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ icon: Icon, title, detail }, idx) => (
                <div key={title} className="card p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-highlighter">
                      <Icon size={16} />
                    </span>
                    <span className="font-mono text-[11px] text-ink-300">0{idx + 1}</span>
                  </div>
                  <p className="font-display text-sm font-semibold text-ink-900">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3.5 text-sm text-danger">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && <Loader />}

          {!isLoading && !result && (
            <FileUpload onAnalyze={handleAnalyze} isLoading={isLoading} progress={progress} />
          )}

          {!isLoading && result && (
            <div className="mx-auto max-w-5xl">
              <AnalysisResult result={result} onReset={handleReset} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
