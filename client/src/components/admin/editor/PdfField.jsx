// 'use client';

// import { useRef, useState } from 'react';
// import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
// import { api } from '@/lib/api';
// import { useToast } from '../Toast';
// import { ConfirmDialog, Field, Spinner } from '../ui';

// const MAX_MB = 5;
// const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// // Upload, replace and remove happen immediately; the label is saved with the form.
// export default function PdfField({ item, label, onLabel }) {
//   const input = useRef(null);
//   const toast = useToast();
//   const [busy, setBusy] = useState(false);
//   const [confirm, setConfirm] = useState(false);
//   const [pdf, setPdf] = useState(() => (item?.hasPdf ? { pdfFileName: item.pdfFileName, pdfSize: item.pdfSize } : null));

//   if (!item) return <p className="text-sm text-slate-500" data-testid="pdf-save-first">Save this condition first, then you can upload a PDF.</p>;

//   const upload = async (file) => {
//     if (!file) return;
//     input.current.value = '';
//     if (file.type !== 'application/pdf' || !/\.pdf$/i.test(file.name)) { toast('Please choose a PDF file', 'error'); return; }
//     if (file.size > MAX_MB * 1024 * 1024) { toast(`PDFs must be ${MAX_MB} MB or smaller`, 'error'); return; }
//     setBusy(true);
//     try {
//       const { data } = await api.conditionPdf.upload(item.id, file);
//       setPdf(data);
//       toast(pdf ? 'PDF replaced' : 'PDF uploaded');
//     } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
//   };

//   const remove = async () => {
//     setBusy(true);
//     try { await api.conditionPdf.remove(item.id); setPdf(null); toast('PDF removed'); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); setConfirm(false); }
//   };

//   return (
//     <div className="space-y-4" data-testid="pdf-field">
//       <div className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
//         <FileText className="h-8 w-8 shrink-0 text-teal" />
//         <div className="min-w-0 flex-1">
//           {pdf ? (
//             <><p className="truncate text-sm font-medium text-navy" data-testid="pdf-file-name">{pdf.pdfFileName}</p><p className="text-xs text-slate-500">{fmtSize(pdf.pdfSize)}</p></>
//           ) : <p className="text-sm text-slate-500" data-testid="pdf-empty">No PDF uploaded. PDF only, up to {MAX_MB} MB.</p>}
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <button type="button" className="btn-secondary py-2" onClick={() => input.current.click()} disabled={busy} data-testid="pdf-upload-button">{busy ? <Spinner /> : <Upload className="h-4 w-4" />} {pdf ? 'Replace' : 'Upload PDF'}</button>
//           {pdf && <a href={api.conditionPdf.openUrl(item.id)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-2" data-testid="pdf-open-link"><ExternalLink className="h-4 w-4" /> Open</a>}
//           {pdf && <button type="button" className="btn-ghost py-2 text-rose-600" onClick={() => setConfirm(true)} disabled={busy} data-testid="pdf-remove-button"><Trash2 className="h-4 w-4" /> Remove</button>}
//         </div>
//         <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(e.target.files[0])} data-testid="pdf-file-input" />
//       </div>
//       <Field label="PDF label" htmlFor="pdfLabel" hint="Shown under “Download Treatment Guide”. Uses the file name if empty. Saved with the form.">
//         <input id="pdfLabel" className="input" value={label || ''} onChange={(e) => onLabel(e.target.value)} placeholder="e.g. Neck Pain Home Exercise Guide" data-testid="pdf-label-input" />
//       </Field>
//       <ConfirmDialog open={confirm} title="Remove PDF?" message="The PDF is deleted and the download section disappears from the public page." confirmLabel="Remove" danger busy={busy} onConfirm={remove} onCancel={() => setConfirm(false)} />
//     </div>
//   );
// }


'use client';

import { useRef, useState } from 'react';
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '../Toast';
import { ConfirmDialog, Field, Spinner } from '../ui';

const MAX_PDF_MB = 5;
const MAX_THUMBNAIL_MB = 2;

const fmtSize = (b) =>
  b >= 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(b / 1024))} KB`;

const isThumbnailTypeValid = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = /\.(jpe?g|png|webp)$/i;

  return (
    allowedTypes.includes(file.type) &&
    allowedExtensions.test(file.name)
  );
};

export default function PdfField({ item, label, onLabel }) {
  const input = useRef(null);
  const thumbnailInput = useRef(null);

  const toast = useToast();

  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const [pdf, setPdf] = useState(() =>
    item?.hasPdf
      ? {
          pdfFileName: item.pdfFileName,
          pdfSize: item.pdfSize,
        }
      : null
  );

  const [thumbnail, setThumbnail] = useState(() =>
    item?.hasThumbnail
      ? {
          thumbnailFileName: item.thumbnailFileName,
          thumbnailUploadedAt: item.thumbnailUploadedAt,
        }
      : null
  );

  if (!item) {
    return (
      <p
        className="text-sm text-slate-500"
        data-testid="pdf-save-first"
      >
        Save this condition first, then you can upload a PDF.
      </p>
    );
  }

  // Update local state using the latest backend PDF information.
  const syncResponse = (data) => {
    if (data?.pdfFileName) {
      setPdf({
        pdfFileName: data.pdfFileName,
        pdfSize: data.pdfSize,
      });
    } else if (data?.hasPdf === false) {
      setPdf(null);
    }

    if (typeof data?.hasThumbnail === 'boolean') {
      setThumbnail(
        data.hasThumbnail
          ? {
              thumbnailFileName: data.thumbnailFileName,
              thumbnailUploadedAt: data.thumbnailUploadedAt,
            }
          : null
      );
    } else if (data?.thumbnailFileName) {
      setThumbnail({
        thumbnailFileName: data.thumbnailFileName,
        thumbnailUploadedAt: data.thumbnailUploadedAt,
      });
    }
  };

  // Upload or replace the PDF.
  const upload = async (file) => {
    if (!file) return;

    input.current.value = '';

    if (
      file.type !== 'application/pdf' ||
      !/\.pdf$/i.test(file.name)
    ) {
      toast('Please choose a PDF file', 'error');
      return;
    }

    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast(`PDFs must be ${MAX_PDF_MB} MB or smaller`, 'error');
      return;
    }

    setBusy(true);

    try {
      const { data } = await api.conditionPdf.upload(
        item.id,
        file
      );

      syncResponse(data);

      toast(pdf ? 'PDF replaced' : 'PDF uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Upload or replace the optional thumbnail.
  const uploadThumbnail = async (file) => {
    if (!file) return;

    thumbnailInput.current.value = '';

    if (!pdf) {
      toast('Upload a PDF before adding its thumbnail', 'error');
      return;
    }

    if (!isThumbnailTypeValid(file)) {
      toast(
        'Please choose a JPG, JPEG, PNG or WebP image',
        'error'
      );
      return;
    }

    if (file.size > MAX_THUMBNAIL_MB * 1024 * 1024) {
      toast(
        `Thumbnail images must be ${MAX_THUMBNAIL_MB} MB or smaller`,
        'error'
      );
      return;
    }

    setBusy(true);

    try {
      const { data } = await api.conditionPdf.upload(
        item.id,
        null,
        file
      );

      syncResponse(data);

      toast(thumbnail ? 'Thumbnail replaced' : 'Thumbnail uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Remove the PDF. The backend also removes its thumbnail.
  const remove = async () => {
    setBusy(true);

    try {
      await api.conditionPdf.remove(item.id);

      setPdf(null);
      setThumbnail(null);

      toast('PDF and thumbnail removed');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  // Remove only the thumbnail. Keep the PDF.
  const removeThumbnail = async () => {
    setBusy(true);

    try {
      await api.conditionPdf.removeThumbnail(item.id);

      setThumbnail(null);

      toast('Thumbnail removed');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="pdf-field">

      {/* PDF upload section */}
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">

        <FileText className="h-8 w-8 shrink-0 text-teal" />

        <div className="min-w-0 flex-1">
          {pdf ? (
            <>
              <p
                className="truncate text-sm font-medium text-navy"
                data-testid="pdf-file-name"
              >
                {pdf.pdfFileName}
              </p>

              {pdf.pdfSize != null && (
                <p className="text-xs text-slate-500">
                  {fmtSize(pdf.pdfSize)}
                </p>
              )}
            </>
          ) : (
            <p
              className="text-sm text-slate-500"
              data-testid="pdf-empty"
            >
              No PDF uploaded. PDF only, up to {MAX_PDF_MB} MB.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            className="btn-secondary py-2"
            onClick={() => input.current.click()}
            disabled={busy}
            data-testid="pdf-upload-button"
          >
            {busy ? <Spinner /> : <Upload className="h-4 w-4" />}
            {pdf ? 'Replace' : 'Upload PDF'}
          </button>

          {pdf && (
            <a
              href={api.conditionPdf.openUrl(item.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost py-2"
              data-testid="pdf-open-link"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          )}

          {pdf && (
            <button
              type="button"
              className="btn-ghost py-2 text-rose-600"
              onClick={() => setConfirm(true)}
              disabled={busy}
              data-testid="pdf-remove-button"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>

        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files[0])}
          data-testid="pdf-file-input"
        />
      </div>

      {/* Optional PDF thumbnail section */}
      {pdf && (
        <div className="space-y-3">

          <div>
            <p className="text-sm font-medium text-navy">
              PDF Thumbnail (Optional)
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Upload a preview image for this treatment guide.
              Supported formats: JPG, JPEG, PNG and WebP.
              Maximum size: {MAX_THUMBNAIL_MB} MB.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 sm:flex-row sm:items-center">

            {thumbnail ? (
              <img
                src={api.conditionPdf.thumbnailOpenUrl(item.id)}
                alt={thumbnail.thumbnailFileName || 'PDF thumbnail preview'}
                className="h-32 w-24 shrink-0 rounded-md border border-slate-200 bg-slate-50 object-contain"
                data-testid="pdf-thumbnail-preview"
              />
            ) : (
              <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {thumbnail ? (
                <p
                  className="truncate text-sm font-medium text-navy"
                  data-testid="pdf-thumbnail-file-name"
                >
                  {thumbnail.thumbnailFileName}
                </p>
              ) : (
                <p
                  className="text-sm text-slate-500"
                  data-testid="pdf-thumbnail-empty"
                >
                  No thumbnail uploaded.
                </p>
              )}

              <p className="mt-1 text-xs text-slate-500">
                {thumbnail
                  ? 'This image is used as the PDF preview.'
                  : 'You can upload a thumbnail now or leave it empty.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                className="btn-secondary py-2"
                onClick={() => thumbnailInput.current.click()}
                disabled={busy}
                data-testid="pdf-thumbnail-upload-button"
              >
                {busy ? <Spinner /> : <Upload className="h-4 w-4" />}
                {thumbnail ? 'Replace Image' : 'Upload Image'}
              </button>

              {thumbnail && (
                <button
                  type="button"
                  className="btn-ghost py-2 text-rose-600"
                  onClick={removeThumbnail}
                  disabled={busy}
                  data-testid="pdf-thumbnail-remove-button"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={thumbnailInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => uploadThumbnail(e.target.files[0])}
              data-testid="pdf-thumbnail-file-input"
            />
          </div>
        </div>
      )}

      {/* PDF label */}
      <Field
        label="PDF label"
        htmlFor="pdfLabel"
        hint="Shown under “Download Treatment Guide”. Uses the file name if empty. Saved with the form."
      >
        <input
          id="pdfLabel"
          className="input"
          value={label || ''}
          onChange={(e) => onLabel(e.target.value)}
          placeholder="e.g. Neck Pain Home Exercise Guide"
          data-testid="pdf-label-input"
        />
      </Field>

      <ConfirmDialog
        open={confirm}
        title="Remove PDF?"
        message="The PDF and its thumbnail will be deleted, and the download section will disappear from the public page."
        confirmLabel="Remove"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

