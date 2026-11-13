/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SelectField } from '../components/select-field'

const options = [{ value: '', label: 'No dimension' }, { value: 'active', label: 'Active', icon: 'play' }]
function triggerText(value: string) {
  const markup = renderToStaticMarkup(createElement(SelectField, { value, onValueChange: () => {}, options, label: 'Status' }))
  const trigger = markup.match(/<button\b[^>]*role="combobox"[^>]*>([\s\S]*?)<\/button>/)?.[1]
  assert.ok(trigger, 'Accessible trigger is rendered')
  return trigger.replace(/<[^>]+>/g, '')
}

test('closed selectors display the selected label before the options have ever mounted', () => {
  assert.equal(triggerText('active'), 'Active')
})
test('an explicitly empty selection displays its actual option rather than a blank trigger', () => {
  assert.equal(triggerText(''), 'No dimension')
})
test('an unknown selection remains readable without silently selecting another value', () => {
  assert.equal(triggerText('unknown'), 'Choose an option')
})
