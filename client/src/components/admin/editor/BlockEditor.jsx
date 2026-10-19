'use client';

import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, ChevronUp, ChevronDown, Heading2, Heading3, Pilcrow, List, ListOrdered, Image as ImageIcon, Quote, MousePointerClick, ShieldAlert,
} from 'lucide-react';
import BlockFields from './BlockFields';
import { uid } from '@/lib/utils';

const DISCLAIMER = 'This article is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.';

export const BLOCK_MENU = [
  { id: 'h2', label: 'Heading H2', icon: Heading2, make: () => ({ type: 'heading', data: { level: 2, text: '' } }) },
  { id: 'h3', label: 'Heading H3', icon: Heading3, make: () => ({ type: 'heading', data: { level: 3, text: '' } }) },
  { id: 'paragraph', label: 'Paragraph', icon: Pilcrow, make: () => ({ type: 'paragraph', data: { html: '' } }) },
  { id: 'ul', label: 'Bulleted list', icon: List, make: () => ({ type: 'list', data: { style: 'unordered', items: [''] } }) },
  { id: 'ol', label: 'Numbered list', icon: ListOrdered, make: () => ({ type: 'list', data: { style: 'ordered', items: [''] } }) },
  { id: 'image', label: 'Image', icon: ImageIcon, make: () => ({ type: 'image', data: { url: '', alt: '', caption: '' } }) },
  { id: 'quote', label: 'Quote', icon: Quote, make: () => ({ type: 'quote', data: { text: '', cite: '' } }) },
  { id: 'cta', label: 'Call to action', icon: MousePointerClick, make: () => ({ type: 'cta', data: { heading: '', text: '', buttonLabel: 'Request Appointment', buttonUrl: '/request-appointment/' } }) },
  { id: 'disclaimer', label: 'Medical disclaimer', icon: ShieldAlert, make: () => ({ type: 'disclaimer', data: { text: DISCLAIMER } }) },
];

const LABELS = { paragraph: 'Paragraph', image: 'Image', quote: 'Quote', cta: 'Call to action', disclaimer: 'Medical disclaimer' };
const blockLabel = (b) => (b.type === 'heading' ? `Heading H${b.data.level}` : b.type === 'list' ? (b.data.style === 'ordered' ? 'Numbered list' : 'Bulleted list') : LABELS[b.type]);

function SortableBlock({ block, index, count, onChange, onRemove, onMove, folder }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.uid });
  const t = `block-${index}`;
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-testid={t}
      className={`group relative rounded-lg border bg-white p-4 transition-[border-color,box-shadow] ${isDragging ? 'z-10 border-teal shadow-xl' : 'border-slate-200 hover:border-teal/50'} ${block.type === 'disclaimer' ? 'border-l-4 border-l-amber-400' : ''} ${block.type === 'cta' ? 'border-l-4 border-l-teal' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-teal active:cursor-grabbing" aria-label="Drag block" data-testid={`${t}-drag-handle`}>
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" data-testid={`${t}-type`}>{blockLabel(block)}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button type="button" className="btn-ghost p-1" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up" data-testid={`${t}-move-up`}><ChevronUp className="h-4 w-4" /></button>
          <button type="button" className="btn-ghost p-1" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down" data-testid={`${t}-move-down`}><ChevronDown className="h-4 w-4" /></button>
          <button type="button" className="btn-ghost p-1 hover:text-rose-600" onClick={onRemove} aria-label="Delete block" data-testid={`${t}-delete`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <BlockFields block={block} onChange={onChange} folder={folder} testId={t} />
    </div>
  );
}

export default function BlockEditor({ blocks, onChange, folder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const update = (i, data) => onChange(blocks.map((b, j) => (j === i ? { ...b, data } : b)));
  const move = (from, to) => onChange(arrayMove(blocks, from, to));
  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = blocks.map((b) => b.uid);
    move(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  return (
    <div data-testid="block-editor">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.uid)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No content blocks yet. Add one below.</p>}
            {blocks.map((b, i) => (
              <SortableBlock key={b.uid} block={b} index={i} count={blocks.length} folder={folder}
                onChange={(data) => update(i, data)} onRemove={() => onChange(blocks.filter((_, j) => j !== i))} onMove={(d) => move(i, i + d)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="label mb-2">Add block</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_MENU.map(({ id, label, icon: Icon, make }) => (
            <button key={id} type="button" onClick={() => onChange([...blocks, { uid: uid(), ...make() }])} data-testid={`add-block-${id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-navy transition-colors hover:border-teal hover:text-teal">
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
