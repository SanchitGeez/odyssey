import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { TextB, TextItalic, ListBullets, ListNumbers, ListChecks, Quotes, LinkSimple, ArrowCounterClockwise, ArrowClockwise, X } from '@phosphor-icons/react'
import { SelectField } from './select-field'
import { safeJournalLink, type JournalNode } from '../lib/journal-format'

export function JournalEditor({ initialContent, onChange, disabled = false, toolbarHost, formattingOpen }: { initialContent: JournalNode; onChange: (document: JournalNode) => void; disabled?: boolean; toolbarHost: HTMLElement | null; formattingOpen: boolean }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [linkError, setLinkError] = useState('')
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, protocols: ['http', 'https', 'mailto'], autolink: false, defaultProtocol: 'https', isAllowedUri: (url) => Boolean(safeJournalLink(url)) } }),
      TaskList,
      TaskItem.configure({ nested: true, HTMLAttributes: { 'data-type': 'taskItem' } }),
      Placeholder.configure({ placeholder: 'Begin here. What is on your mind?' }),
    ],
    content: initialContent,
    editable: !disabled,
    editorProps: { attributes: { class: 'journal-prose journal-editable', role: 'textbox', 'aria-label': 'Journal content', 'aria-multiline': 'true', spellcheck: 'true' } },
    onUpdate: ({ editor: nextEditor }) => onChange(nextEditor.getJSON() as JournalNode),
  })
  useEffect(() => { editor?.setEditable(!disabled, false) }, [editor, disabled])
  const state = useEditorState({ editor, selector: ({ editor: current }) => current ? {
    bold: current.isActive('bold'), italic: current.isActive('italic'), bullet: current.isActive('bulletList'), ordered: current.isActive('orderedList'), task: current.isActive('taskList'), quote: current.isActive('blockquote'), link: current.isActive('link'), heading: current.getAttributes('heading').level || 0, undo: current.can().undo(), redo: current.can().redo(),
  } : null })
  if (!editor) return <div className="journal-editor-loading">Preparing your scroll...</div>

  const tool = (label: string, glyph: ReactNode, run: () => void, active?: boolean, unavailable = false) => (
    <button type="button" className={`journal-tool${active ? ' is-active' : ''}`} aria-label={label} aria-pressed={active} title={label} disabled={disabled || unavailable} onClick={run}>{glyph}</button>
  )
  const formatting = <div className="journal-format-panel" hidden={!formattingOpen}>
      <div className="journal-toolbar" role="group" aria-label="Formatting tools">
        <div className="journal-heading-control">
          <SelectField
            label="Text style"
            disabled={disabled}
            value={String(state?.heading || 0)}
            options={[{ value: '0', label: 'Paragraph' }, { value: '1', label: 'Heading 1' }, { value: '2', label: 'Heading 2' }, { value: '3', label: 'Heading 3' }]}
            onValueChange={(value) => { const level = Number(value); if (!level) editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run() }}
            onCloseAutoFocus={(event) => { event.preventDefault(); editor.commands.focus() }}
          />
        </div>
        <span className="journal-tool-separator" aria-hidden="true" />
        {tool('Bold (Ctrl/Cmd+B)', <TextB />, () => editor.chain().focus().toggleBold().run(), state?.bold)}
        {tool('Italic (Ctrl/Cmd+I)', <TextItalic />, () => editor.chain().focus().toggleItalic().run(), state?.italic)}
        {tool('Bullet list', <ListBullets />, () => editor.chain().focus().toggleBulletList().run(), state?.bullet)}
        {tool('Numbered list', <ListNumbers />, () => editor.chain().focus().toggleOrderedList().run(), state?.ordered)}
        {tool('Checklist', <ListChecks />, () => editor.chain().focus().toggleTaskList().run(), state?.task)}
        {tool('Quotation', <Quotes />, () => editor.chain().focus().toggleBlockquote().run(), state?.quote)}
        {tool('Add or edit link', <LinkSimple />, () => { setLinkValue(String(editor.getAttributes('link').href || '')); setLinkError(''); setLinkOpen((open) => !open) }, state?.link)}
        <span className="journal-tool-separator" aria-hidden="true" />
        {tool('Undo (Ctrl/Cmd+Z)', <ArrowCounterClockwise />, () => editor.chain().focus().undo().run(), undefined, !state?.undo)}
        {tool('Redo (Ctrl/Cmd+Shift+Z)', <ArrowClockwise />, () => editor.chain().focus().redo().run(), undefined, !state?.redo)}
      </div>
      {linkOpen ? <form className="journal-link-form" onSubmit={(event) => {
        event.preventDefault()
        if (!linkValue.trim()) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); return }
        const href = safeJournalLink(linkValue)
        if (!href) { setLinkError('Use a complete https://, http:// or mailto: address.'); return }
        editor.chain().focus().extendMarkRange('link').setLink({ href }).run(); setLinkOpen(false)
      }}>
        <label><span>Link address</span><input autoFocus type="text" inputMode="url" value={linkValue} placeholder="https://example.com" onChange={(event) => setLinkValue(event.target.value)} aria-describedby={linkError ? 'journal-link-error' : undefined} /></label>
        <button type="submit" className="ody-btn">{linkValue.trim() ? 'Apply link' : 'Remove link'}</button>
        <button type="button" className="journal-tool" aria-label="Close link tools" onClick={() => { setLinkOpen(false); editor.commands.focus() }}><X /></button>
        {linkError ? <p id="journal-link-error" role="alert">{linkError}</p> : null}
      </form> : null}
    </div>
  return <>
    {toolbarHost ? createPortal(formatting, toolbarHost) : null}
    <EditorContent editor={editor} />
  </>
}
