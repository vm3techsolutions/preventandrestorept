const sanitizeHtml = require('sanitize-html');

const OPTIONS = {
  allowedTags: ['strong', 'b', 'em', 'i', 'u', 'a', 'br'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
};

const cleanInline = (html) => sanitizeHtml(String(html || ''), OPTIONS).trim();
const cleanText = (text) => sanitizeHtml(String(text || ''), { allowedTags: [], allowedAttributes: {} }).trim();

function sanitizeBlocks(blocks) {
  return blocks.map((b) => {
    const d = { ...b.data };
    if (b.type === 'paragraph') d.html = cleanInline(d.html);
    if (b.type === 'list') d.items = d.items.map(cleanInline).filter(Boolean);
    for (const k of ['text', 'heading', 'cite', 'alt', 'caption', 'buttonLabel']) if (typeof d[k] === 'string') d[k] = cleanText(d[k]);
    return { type: b.type, data: d };
  });
}

module.exports = { cleanInline, cleanText, sanitizeBlocks };
