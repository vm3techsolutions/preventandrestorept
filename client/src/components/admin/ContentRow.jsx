'use client';

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Eye, Send, EyeOff, Archive, Trash2, RotateCcw } from 'lucide-react';
import { StatusBadge } from './ui';
import { formatDate, formatDateTime } from '@/lib/utils';

function IconButton({ label, onClick, href, icon: Icon, testId, danger }) {
  const cls = `inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${danger ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-500 hover:bg-teal-50 hover:text-teal'}`;
  if (href) return <Link href={href} title={label} aria-label={label} className={cls} data-testid={testId}><Icon className="h-4 w-4" /></Link>;
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={cls} data-testid={testId}><Icon className="h-4 w-4" /></button>;
}

export default function ContentRow({ item, type, trashed, dragDisabled, onAction, onDelete, onRestore }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: dragDisabled });
  const style = { transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 10 : undefined };
  const isBlog = type.kind === 'blog';
  const t = `${type.key}-row-${item.id}`;

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white ${isDragging ? 'shadow-lg ring-1 ring-teal/30' : 'hover:bg-slate-50/70'}`} data-testid={t}>
      <td className="td w-10">
        {!dragDisabled && (
          <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-teal active:cursor-grabbing" aria-label="Drag to reorder" data-testid={`${t}-drag-handle`}>
            <GripVertical className="h-4 w-4" />
          </button>
        )}
      </td>
      <td className="td max-w-[420px]">
        <Link href={`${type.adminPath}/${item.id}`} className="line-clamp-2 font-medium text-navy hover:text-teal" data-testid={`${t}-title`}>{item.title}</Link>
        <p className="mt-0.5 truncate text-xs text-slate-400">{item.path}</p>
      </td>
      <td className="td"><StatusBadge status={trashed ? 'TRASHED' : item.status} testId={`${t}-status`} /></td>
      {isBlog && <td className="td hidden md:table-cell">{item.author?.name || '—'}</td>}
      {isBlog && <td className="td hidden lg:table-cell text-xs">{item.categories?.map((c) => c.name).join(', ') || '—'}</td>}
      <td className="td hidden whitespace-nowrap text-xs sm:table-cell">{formatDate(isBlog ? item.publishedAt : item.updatedAt)}</td>
      {type.kind !== 'page' && (
        <td className="td hidden text-xs md:table-cell" data-testid={`${t}-updated-by`}>
          {item.updatedBy ? (
            <>
              <span className="block font-medium text-navy">{item.updatedBy.name || item.updatedBy.email}</span>
              <span className="text-slate-400">{formatDateTime(item.updatedAt)}</span>
            </>
          ) : <span className="text-slate-400">Not recorded</span>}
        </td>
      )}
      <td className="td">
        <div className="flex items-center justify-end gap-0.5">
          {trashed ? (
            <IconButton label="Restore" icon={RotateCcw} onClick={onRestore} testId={`${t}-restore`} />
          ) : (
            <>
              <IconButton label="Edit" icon={Pencil} href={`${type.adminPath}/${item.id}`} testId={`${t}-edit`} />
              <IconButton label="Preview" icon={Eye} href={`/admin/preview/${type.key}/${item.id}`} testId={`${t}-preview`} />
              {item.status === 'PUBLISHED'
                ? <IconButton label="Unpublish" icon={EyeOff} onClick={() => onAction(item, 'unpublish')} testId={`${t}-unpublish`} />
                : <IconButton label="Publish" icon={Send} onClick={() => onAction(item, 'publish')} testId={`${t}-publish`} />}
              {item.status !== 'ARCHIVED' && <IconButton label="Archive" icon={Archive} onClick={() => onAction(item, 'archive')} testId={`${t}-archive`} />}
              <IconButton label="Move to trash" icon={Trash2} onClick={onDelete} testId={`${t}-delete`} danger />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
