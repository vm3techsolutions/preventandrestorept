'use client';

import { useRef, useState } from 'react';
import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '../Toast';
import { ConfirmDialog, Field, Spinner } from '../ui';

const MAX_MB = 5;
const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// Upload, replace and remove happen immediately; the label is saved with the form.
export default function PdfField({ item, label, onLabel }) {
  const input = useRef(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pdf, setPdf] = useState(() => (item?.hasPdf ? { pdfFileName: item.pdfFileName, pdfSize: item.pdfSize } : null));

  if (!item) return <p className="text-sm text-slate-500" data-testid="pdf-save-first">Save this condition first, then you can upload a PDF.</p>;

  const upload = async (file) => {
    if (!file) return;
    input.current.value = '';
    if (file.type !== 'application/pdf' || !/\.pdf$/i.test(file.name)) { toast('Please choose a PDF file', 'error'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast(`PDFs must be ${MAX_MB} MB or smaller`, 'error'); return; }
    setBusy(true);
    try {
      const { data } = await api.conditionPdf.upload(item.id, file);
      setPdf(data);
      toast(pdf ? 'PDF replaced' : 'PDF uploaded');
    } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.conditionPdf.remove(item.id); setPdf(null); toast('PDF removed'); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); setConfirm(false); }
  };

  return (
    <div className="space-y-4" data-testid="pdf-field">
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <FileText className="h-8 w-8 shrink-0 text-teal" />
        <div className="min-w-0 flex-1">
          {pdf ? (
            <><p className="truncate text-sm font-medium text-navy" data-testid="pdf-file-name">{pdf.pdfFileName}</p><p className="text-xs text-slate-500">{fmtSize(pdf.pdfSize)}</p></>
          ) : <p className="text-sm text-slate-500" data-testid="pdf-empty">No PDF uploaded. PDF only, up to {MAX_MB} MB.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary py-2" onClick={() => input.current.click()} disabled={busy} data-testid="pdf-upload-button">{busy ? <Spinner /> : <Upload className="h-4 w-4" />} {pdf ? 'Replace' : 'Upload PDF'}</button>
          {pdf && <a href={api.conditionPdf.openUrl(item.id)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-2" data-testid="pdf-open-link"><ExternalLink className="h-4 w-4" /> Open</a>}
          {pdf && <button type="button" className="btn-ghost py-2 text-rose-600" onClick={() => setConfirm(true)} disabled={busy} data-testid="pdf-remove-button"><Trash2 className="h-4 w-4" /> Remove</button>}
        </div>
        <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(e.target.files[0])} data-testid="pdf-file-input" />
      </div>
      <Field label="PDF label" htmlFor="pdfLabel" hint="Shown under “Download Treatment Guide”. Uses the file name if empty. Saved with the form.">
        <input id="pdfLabel" className="input" value={label || ''} onChange={(e) => onLabel(e.target.value)} placeholder="e.g. Neck Pain Home Exercise Guide" data-testid="pdf-label-input" />
      </Field>
      <ConfirmDialog open={confirm} title="Remove PDF?" message="The PDF is deleted and the download section disappears from the public page." confirmLabel="Remove" danger busy={busy} onConfirm={remove} onCancel={() => setConfirm(false)} />
    </div>
  );
}
