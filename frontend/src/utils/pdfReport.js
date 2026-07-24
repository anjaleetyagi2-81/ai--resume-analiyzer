import { jsPDF } from 'jspdf';

const INK = [16, 24, 39];
const SCAN = [15, 118, 110];
const AMBER = [228, 154, 27];
const MUTED = [100, 116, 139];
const LINE = [225, 220, 205];

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5.2) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function ensureSpace(doc, y, needed, margin = 15) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    return margin + 5;
  }
  return y;
}

function sectionHeading(doc, title, y, margin) {
  y = ensureSpace(doc, y, 14, margin);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...INK);
  doc.text(title.toUpperCase(), margin, y);
  return y + 7;
}

/**
 * Generates a polished, multi-page PDF report from the analysis
 * result returned by the backend, and triggers a browser download.
 */
export function downloadAnalysisReport(result, fileName = 'resume-analysis-report.pdf') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ---- Header ----
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AI Resume Analyzer', margin, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text('Analysis Report', margin, 23);
  doc.setFontSize(8.5);
  doc.text(new Date(result.generatedAt || Date.now()).toLocaleString(), margin, 28);

  // Score badge top-right
  doc.setFillColor(...AMBER);
  doc.roundedRect(pageWidth - margin - 34, 7, 34, 18, 3, 3, 'F');
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${result.atsScore ?? '--'}/100`, pageWidth - margin - 17, 16, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('ATS SCORE', pageWidth - margin - 17, 22, { align: 'center' });

  y = 42;

  // ---- File meta ----
  doc.setTextColor(...MUTED);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`File: ${result.fileMeta?.originalName || 'resume'}`, margin, y);
  y += 8;

  // ---- Summary ----
  y = sectionHeading(doc, 'Summary', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  y = addWrappedText(doc, result.summary || 'No summary available.', margin, y, contentWidth);
  y += 4;

  // ---- ATS Compatibility ----
  y = ensureSpace(doc, y, 20, margin);
  y = sectionHeading(doc, 'ATS Compatibility Notes', y, margin);
  y = addWrappedText(
    doc,
    result.atsCompatibilityNotes || 'No ATS notes available.',
    margin,
    y,
    contentWidth
  );
  y += 4;

  // ---- Strengths / Weaknesses ----
  y = ensureSpace(doc, y, 20, margin);
  y = sectionHeading(doc, 'Strengths', y, margin);
  (result.strengths || []).forEach((s) => {
    y = ensureSpace(doc, y, 8, margin);
    doc.setTextColor(...SCAN);
    doc.text('+', margin, y);
    doc.setTextColor(...INK);
    y = addWrappedText(doc, s, margin + 5, y, contentWidth - 5);
  });
  y += 3;

  y = ensureSpace(doc, y, 20, margin);
  y = sectionHeading(doc, 'Areas to Improve', y, margin);
  (result.weaknesses || []).forEach((w) => {
    y = ensureSpace(doc, y, 8, margin);
    doc.setTextColor(200, 60, 40);
    doc.text('-', margin, y);
    doc.setTextColor(...INK);
    y = addWrappedText(doc, w, margin + 5, y, contentWidth - 5);
  });
  y += 3;

  // ---- Skills ----
  y = ensureSpace(doc, y, 24, margin);
  y = sectionHeading(doc, 'Detected Skills', y, margin);
  doc.setFontSize(9.5);
  y = addWrappedText(
    doc,
    (result.detectedSkills || []).join('  •  ') || 'None detected.',
    margin,
    y,
    contentWidth
  );
  y += 4;

  y = ensureSpace(doc, y, 20, margin);
  y = sectionHeading(doc, 'Missing / Recommended Skills', y, margin);
  doc.setFontSize(9.5);
  y = addWrappedText(
    doc,
    (result.missingSkills || []).join('  •  ') || 'None — great keyword coverage!',
    margin,
    y,
    contentWidth
  );
  y += 4;

  // ---- Suggestions ----
  y = ensureSpace(doc, y, 20, margin);
  y = sectionHeading(doc, 'Suggestions to Improve Your Resume', y, margin);
  doc.setFontSize(10);
  (result.suggestions || []).forEach((s, idx) => {
    y = ensureSpace(doc, y, 14, margin);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    y = addWrappedText(doc, `${idx + 1}. ${s.title || ''}`, margin, y, contentWidth);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    y = addWrappedText(doc, s.detail || '', margin + 4, y, contentWidth - 4);
    y += 2;
  });

  // ---- Improved bullet examples ----
  if ((result.improvedBulletExamples || []).length) {
    y = ensureSpace(doc, y, 20, margin);
    y = sectionHeading(doc, 'Bullet Point Rewrites', y, margin);
    result.improvedBulletExamples.forEach((ex) => {
      y = ensureSpace(doc, y, 20, margin);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...MUTED);
      y = addWrappedText(doc, `Before: ${ex.original}`, margin, y, contentWidth);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SCAN);
      y = addWrappedText(doc, `After: ${ex.improved}`, margin, y, contentWidth);
      y += 3;
    });
  }

  // ---- Footer on every page ----
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Generated by AI Resume Analyzer  •  Page ${i} of ${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(fileName);
}
