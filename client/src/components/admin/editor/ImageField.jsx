'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { api, mediaUrl } from '@/lib/api';
import { useToast } from '../Toast';
import { Spinner } from '../ui';

const MAX_MB = 5;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export default function ImageField({ value, onChange, folder, showCaption, testId, label = 'Image' }) {
  const input = useRef(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const { url = '', alt = '', caption = '' } = value || {};

  const upload = async (file) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast('Please choose a JPEG, PNG, WebP, GIF or AVIF image', 'error');
    if (file.size > MAX_MB * 1024 * 1024) return toast(`Images must be ${MAX_MB} MB or smaller`, 'error');
    setBusy(true);
    try {
      const { data } = await api.media.upload(file, folder, { alt });
      onChange({ url: data.url, alt, caption });
      toast('Image uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      input.current.value = '';
    }
    return null;
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 sm:w-48">
          {url ? <img src={mediaUrl(url)} alt={alt} className="h-full w-full object-cover" data-testid={`${testId}-preview`} /> : <ImagePlus className="h-7 w-7 text-slate-300" />}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary py-2" onClick={() => input.current.click()} disabled={busy} data-testid={`${testId}-upload-button`}>
              {busy ? <Spinner /> : <Upload className="h-4 w-4" />} {url ? 'Replace' : 'Upload'} {label.toLowerCase()}
            </button>
            {url && (
              <button type="button" className="btn-ghost text-rose-600" onClick={() => onChange({ url: '', alt: '', caption: '' })} data-testid={`${testId}-remove-button`}>
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
            <input ref={input} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => upload(e.target.files[0])} data-testid={`${testId}-file-input`} />
          </div>
          <input className="input" placeholder="…or paste an image URL" value={url} onChange={(e) => onChange({ url: e.target.value, alt, caption })} data-testid={`${testId}-url-input`} />
          <input className={`input ${url && !alt ? 'border-amber-400' : ''}`} placeholder="Alt text (describe the image for screen readers)" value={alt}
            onChange={(e) => onChange({ url, alt: e.target.value, caption })} data-testid={`${testId}-alt-input`} />
          {showCaption && <input className="input" placeholder="Caption (optional)" value={caption} onChange={(e) => onChange({ url, alt, caption: e.target.value })} data-testid={`${testId}-caption-input`} />}
        </div>
      </div>
    </div>
  );
}
