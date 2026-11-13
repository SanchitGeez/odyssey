/// <reference types="node" />
import assert from 'node:assert/strict'
import test from 'node:test'
import { JOURNAL_FORMAT, documentText, encodeJournalContent, journalPreview, parseJournalContent, safeJournalLink, type JournalNode } from './journal-format.ts'

test('legacy text is literal, including markup and blank lines', () => {
  const text = '**Not bold** <script>alert(1)</script>\n\nA second thought.'
  const parsed = parseJournalContent(text)
  assert.equal(parsed.legacy, true)
  assert.equal(parsed.supported, true)
  assert.equal(documentText(parsed.document), text)
  assert.equal(parseJournalContent(encodeJournalContent(parsed.document)).plainText, text)
})

test('rich journal roundtrips every editing tool and nested checklists without loss', () => {
  const doc: JournalNode = { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'My reflection' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Bold and italic', marks: [{ type: 'bold' }, { type: 'italic' }] }, { type: 'hardBreak' }, { type: 'text', text: 'A link', marks: [{ type: 'link', attrs: { href: 'https://example.com/', target: '_blank', rel: 'noopener noreferrer', class: null, title: null } }] }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A bullet' }] }] }] },
    { type: 'orderedList', attrs: { start: 3 }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Numbered' }] }] }] },
    { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Finished' }] }, { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested task' }] }] }] }] }] },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Remember this.' }] }] },
  ] }
  const encoded = encodeJournalContent(doc)
  assert.ok(encoded.startsWith(JOURNAL_FORMAT))
  assert.deepEqual(parseJournalContent(encoded).document, doc)
  assert.equal(parseJournalContent(encoded).legacy, false)
  assert.match(journalPreview(encoded), /My reflection Bold and italic A link A bullet Numbered Finished Nested task Remember this\./)
})

test('unsafe links cannot survive loading or serialization', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,payload', '//evil.example', 'https://', 'file:///tmp/file']) assert.equal(safeJournalLink(value), null)
  assert.equal(safeJournalLink('https://example.com'), 'https://example.com/')
  assert.equal(safeJournalLink('mailto:reader@example.com'), 'mailto:reader@example.com')
  const doc: JournalNode = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Keep my text', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] }
  const result = parseJournalContent(encodeJournalContent(doc))
  assert.equal(result.plainText, 'Keep my text')
  assert.deepEqual(result.document.content?.[0].content?.[0].marks, [])
})

test('unsupported versions, invalid JSON and unknown nodes are preserved read-only', () => {
  for (const content of ['odyssey-richtext-v2\n{"future":true}', JOURNAL_FORMAT + '{bad json}', JOURNAL_FORMAT + '{"type":"doc","content":[{"type":"futureNode"}]}']) {
    const parsed = parseJournalContent(content)
    assert.equal(parsed.supported, false)
    assert.equal(parsed.plainText, content)
    assert.equal(documentText(parsed.document), content)
  }
  assert.throws(() => encodeJournalContent({ type: 'unknown' }))
})

test('preview removes structural markup and does not expose the storage envelope', () => {
  assert.equal(journalPreview(encodeJournalContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A sentence.' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'The next.' }] }] })), 'A sentence. The next.')
})

test('known version with invalid document structure stays read-only instead of losing content', () => {
  const invalid: unknown[] = [
    { type: 'doc', content: [{ type: 'text', text: 'Text outside a paragraph' }] },
    { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Nested heading' }] }] }] },
    { type: 'doc', content: [{ type: 'taskList', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Invalid task child' }] }] }] },
    { type: 'doc', content: [{ type: 'heading', attrs: { level: 99 }, content: [{ type: 'text', text: 'Unsupported level' }] }] },
    { type: 'doc', content: [{ type: 'listItem', content: [{ type: 'text', text: 'Missing paragraph' }] }] },
    { type: 'doc', content: [] },
    { type: 'doc', content: [{ type: 'paragraph', attrs: { futureColor: 'red' }, content: [{ type: 'text', text: 'Unsupported attribute' }] }] },
  ]
  for (const document of invalid) {
    const original = JOURNAL_FORMAT + JSON.stringify(document)
    assert.equal(parseJournalContent(original).supported, false)
    assert.equal(parseJournalContent(original).plainText, original)
  }
})
