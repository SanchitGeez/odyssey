/** A lossless rich-text envelope in the existing content string. Plain text stays literal. */
export const JOURNAL_FORMAT = 'odyssey-richtext-v1\n'

export type JournalNode = {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: JournalNode[]
}
export type ParsedJournal = { document: JournalNode; plainText: string; supported: boolean; legacy: boolean }

export function textDocument(text: string): JournalNode {
  return {
    type: 'doc',
    content: text.split(/\r?\n/).map((line) => ({ type: 'paragraph', ...(line ? { content: [{ type: 'text', text: line }] } : {}) })),
  }
}

export function safeJournalLink(value: string): string | null {
  const link = value.trim()
  if (!/^(https?:\/\/|mailto:)/i.test(link)) return null
  try {
    const url = new URL(link)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

const blockTypes = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'taskList', 'blockquote', 'horizontalRule', 'codeBlock'])
const markTypes = new Set(['bold', 'italic', 'strike', 'underline', 'code', 'link'])
const attrNames: Record<string, string[]> = { heading: ['level'], orderedList: ['start', 'type'], taskItem: ['checked'], codeBlock: ['language'], link: ['href', 'target', 'rel', 'class', 'title'] }
function hasValidAttrs(value: unknown, type: string): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.keys(value).every((key) => (attrNames[type] || []).includes(key))
}
function isNode(value: unknown, depth = 0): value is JournalNode {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 100) return false
  const node = value as JournalNode
  if (Object.keys(node).some((key) => !['type', 'text', 'attrs', 'marks', 'content'].includes(key))) return false
  if (!hasValidAttrs(node.attrs, node.type)) return false
  if (node.marks !== undefined && (!Array.isArray(node.marks) || !node.marks.every((mark) => mark && typeof mark === 'object' && markTypes.has(mark.type) && hasValidAttrs(mark.attrs, mark.type) && (mark.type !== 'link' || typeof mark.attrs?.href === 'string')))) return false
  if (node.content !== undefined && (!Array.isArray(node.content) || !node.content.every((child) => isNode(child, depth + 1)))) return false
  if (node.type !== 'text' && node.text !== undefined) return false
  const children = node.content || []
  const inline = () => children.every((child) => child.type === 'text' || child.type === 'hardBreak')
  const blocks = () => children.length > 0 && children.every((child) => blockTypes.has(child.type))
  if (node.type === 'text') return typeof node.text === 'string' && node.text.length > 0 && node.content === undefined
  if (node.type === 'hardBreak') return children.length === 0
  if (node.marks?.length) return false
  if (node.type === 'doc' || node.type === 'blockquote') return blocks()
  if (node.type === 'paragraph') return inline()
  if (node.type === 'heading') return inline() && typeof node.attrs?.level === 'number' && [1, 2, 3].includes(node.attrs.level)
  if (node.type === 'bulletList') return children.length > 0 && children.every((child) => child.type === 'listItem')
  if (node.type === 'orderedList') return children.length > 0 && children.every((child) => child.type === 'listItem') && (node.attrs?.start === undefined || Number.isSafeInteger(node.attrs.start) && Number(node.attrs.start) >= 1) && (node.attrs?.type === undefined || node.attrs.type === null || typeof node.attrs.type === 'string')
  if (node.type === 'taskList') return children.length > 0 && children.every((child) => child.type === 'taskItem')
  if (node.type === 'listItem' || node.type === 'taskItem') return children[0]?.type === 'paragraph' && children.slice(1).every((child) => blockTypes.has(child.type)) && (node.type !== 'taskItem' || typeof node.attrs?.checked === 'boolean')
  if (node.type === 'codeBlock') return children.every((child) => child.type === 'text' && !child.marks?.length) && (node.attrs?.language === undefined || node.attrs.language === null || typeof node.attrs.language === 'string')
  return node.type === 'horizontalRule' && children.length === 0
}

function cleanNode(node: JournalNode): JournalNode {
  return {
    ...node,
    ...(node.marks ? { marks: node.marks.filter((mark) => mark.type !== 'link' || safeJournalLink(String(mark.attrs?.href || ''))).map((mark) => mark.type === 'link' ? { type: 'link', attrs: { ...mark.attrs, href: safeJournalLink(String(mark.attrs?.href)), target: '_blank', rel: 'noopener noreferrer' } } : mark) } : {}),
    ...(node.content ? { content: node.content.map(cleanNode) } : {}),
  }
}

export function documentText(node: JournalNode): string {
  if (node.type === 'text') return node.text || ''
  if (node.type === 'hardBreak') return '\n'
  const content = node.content || []
  const separator = ['doc', 'bulletList', 'orderedList', 'taskList', 'blockquote', 'listItem', 'taskItem'].includes(node.type) ? '\n' : ''
  return content.map(documentText).join(separator)
}

export function parseJournalContent(content: string): ParsedJournal {
  if (content.startsWith(JOURNAL_FORMAT)) {
    try {
      const value: unknown = JSON.parse(content.slice(JOURNAL_FORMAT.length))
      if (isNode(value) && value.type === 'doc') {
        const document = cleanNode(value)
        return { document, plainText: documentText(document), supported: true, legacy: false }
      }
    } catch { /* Preserve unknown or damaged content without making it editable. */ }
    return { document: textDocument(content), plainText: content, supported: false, legacy: false }
  }
  if (/^odyssey-richtext-v\d+\n/.test(content)) {
    return { document: textDocument(content), plainText: content, supported: false, legacy: false }
  }
  return { document: textDocument(content), plainText: content, supported: true, legacy: true }
}

export function encodeJournalContent(document: JournalNode): string {
  if (!isNode(document) || document.type !== 'doc') throw new Error('This journal format is not supported. Your entry has not been changed.')
  return JOURNAL_FORMAT + JSON.stringify(cleanNode(document))
}

export function journalPreview(content: string): string {
  const parsed = parseJournalContent(content)
  if (!parsed.supported) return 'This entry uses an unsupported format. Open it to view the original content.'
  return parsed.plainText.replace(/\s+/g, ' ').trim()
}
