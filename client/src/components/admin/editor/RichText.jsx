'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, Link2, Unlink } from 'lucide-react';

// Minimal rich text: bold, italic and links. HTML is sanitized again on the server.
export default function RichText({ value, onChange, placeholder, testId, singleLine }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || '';
  }, [value]);

  const emit = () => onChange(ref.current.innerHTML === '<br>' ? '' : ref.current.innerHTML);
  const exec = (cmd, arg) => {
    ref.current.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };
  const addLink = () => {
    const url = window.prompt('Link URL (https://… or /path)');
    if (url) exec('createLink', url);
  };

  const tools = [
    { label: 'Bold', icon: Bold, run: () => exec('bold') },
    { label: 'Italic', icon: Italic, run: () => exec('italic') },
    { label: 'Add link', icon: Link2, run: addLink },
    { label: 'Remove link', icon: Unlink, run: () => exec('unlink') },
  ];

  return (
    <div className="group/rt rounded-lg border border-slate-300 bg-white transition-[border-color,box-shadow] focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
      <div className="flex gap-0.5 border-b border-slate-100 px-1.5 py-1">
        {tools.map(({ label, icon: Icon, run }) => (
          <button key={label} type="button" title={label} aria-label={label} onMouseDown={(e) => { e.preventDefault(); run(); }}
            className="rounded p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal" data-testid={`${testId}-${label.toLowerCase().replace(/\s+/g, '-')}`}>
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={!singleLine}
        data-placeholder={placeholder}
        data-testid={testId}
        onInput={emit}
        onKeyDown={singleLine ? (e) => e.key === 'Enter' && e.preventDefault() : undefined}
        className={`rich px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 outline-none ${singleLine ? 'min-h-[40px]' : 'min-h-[88px]'}`}
      />
    </div>
  );
}
