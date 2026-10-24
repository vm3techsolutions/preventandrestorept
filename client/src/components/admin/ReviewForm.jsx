'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Field, Spinner, Toggle } from './ui';

const BLANK = { reviewerName: '', text: '', rating: 5, reviewDate: '', source: 'Google', sourceUrl: '', isPublished: true, isFeatured: false, displayOrder: 0 };
const fromRow = (r) => ({ ...BLANK, ...r, rating: r.rating ?? '', reviewDate: r.reviewDate ? r.reviewDate.slice(0, 10) : '', sourceUrl: r.sourceUrl || '' });

export default function ReviewForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? fromRow(initial) : BLANK);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, rating: form.rating === '' ? null : Number(form.rating), reviewDate: form.reviewDate || null, displayOrder: Number(form.displayOrder) || 0 };
      const r = initial?.id ? await api.reviews.update(initial.id, body) : await api.reviews.create(body);
      onSaved(r.data);
    } catch (err) {
      setError(err.message.replace(/(^|; )[\w.]+: /g, '$1'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="review-form">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Only add genuine reviews exactly as the client wrote them (for example copied from your Google Business Profile).</p>
      <Field label="Reviewer name" htmlFor="reviewerName" hint="As shown publicly on the review (e.g. Stacey F.)">
        <input id="reviewerName" required className="input" value={form.reviewerName} onChange={set('reviewerName')} data-testid="review-name-input" />
      </Field>
      <Field label="Review text" htmlFor="text">
        <textarea id="text" required rows={5} className="input" value={form.text} onChange={set('text')} data-testid="review-text-input" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Star rating" htmlFor="rating">
          <select id="rating" className="input" value={form.rating} onChange={set('rating')} data-testid="review-rating-select">
            <option value="">No rating</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </Field>
        <Field label="Review date" htmlFor="reviewDate"><input id="reviewDate" type="date" className="input" value={form.reviewDate} onChange={set('reviewDate')} data-testid="review-date-input" /></Field>
        <Field label="Order" htmlFor="displayOrder" hint="Lower shows first"><input id="displayOrder" type="number" min={0} className="input" value={form.displayOrder} onChange={set('displayOrder')} data-testid="review-order-input" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <Field label="Source" htmlFor="source"><input id="source" required className="input" value={form.source} onChange={set('source')} data-testid="review-source-input" /></Field>
        <Field label="Link to the original review" htmlFor="sourceUrl" hint="Optional, https:// only"><input id="sourceUrl" className="input" value={form.sourceUrl} onChange={set('sourceUrl')} data-testid="review-url-input" /></Field>
      </div>
      <div className="flex flex-wrap gap-6">
        <Toggle label="Published on the website" checked={form.isPublished} onChange={set('isPublished')} testId="review-published-toggle" />
        <Toggle label="Feature as testimonial" checked={form.isFeatured} onChange={set('isFeatured')} testId="review-featured-toggle" />
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" data-testid="review-form-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} data-testid="review-cancel-button">Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving} data-testid="review-save-button">{saving && <Spinner />} Save review</button>
      </div>
    </form>
  );
}
