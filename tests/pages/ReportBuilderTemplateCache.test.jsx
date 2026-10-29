import React from 'react'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import { transformSync } from '@babel/core'
import transformJsx from '@babel/plugin-transform-react-jsx'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { Controller, useForm, useWatch } from 'react-hook-form'
import * as material from '@mui/material'
import { Box, Grid, Stack } from '@mui/system'
import axios from 'axios'
import { ApiGetCall, ApiPostCall } from '../../src/api/ApiCall'
import * as reportSettings from '../../src/components/ReportBuilder/reportSettings'
import { PAGE_ORIENTATIONS, PAGE_SIZES } from '../../src/components/CippPdf/reportPdfStyles'
import { renderCustomScriptMarkdownTemplate } from '../../src/utils/customScriptTemplate'

vi.mock('../../src/utils/cippVersion', () => ({ buildVersionedHeaders: () => ({}) }))

// Mount the actual Page function and its controls, without evaluating the separate rich-editor,
// clipboard or database UI definitions. The block boundary only supplies ordinary draft edits.
const source = readFileSync('src/pages/tools/report-builder/builder/index.js', 'utf8')
const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] })
const page = ast.program.body
  .filter((node) => node.type === 'VariableDeclaration')
  .flatMap((node) => node.declarations)
  .find((node) => node.id.name === 'Page')
const pageCode = transformSync(`const Page = ${source.slice(page.init.start, page.init.end)}`, {
  babelrc: false,
  configFile: false,
  plugins: [transformJsx],
}).code
const empty = () => null
const icons = Object.fromEntries(
  ast.program.body
    .filter((node) => node.type === 'ImportDeclaration' && node.source.value === '@mui/icons-material')
    .flatMap((node) => node.specifiers.map((item) => [item.local.name, empty]))
)

function FormField({ name, label, formControl, type, options = [] }) {
  return (
    <Controller
      name={name}
      control={formControl.control}
      render={({ field }) => type === 'textField' ? (
        <input aria-label={label} {...field} value={field.value ?? ''} />
      ) : (
        <select
          aria-label={label}
          ref={field.ref}
          value={field.value?.value ?? ''}
          onChange={(event) => field.onChange(options.find((item) => item.value === event.target.value))}
        >
          <option value="" />
          {options.filter((item) => item.value).map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      )}
    />
  )
}

function BlockField({ block, index, onUpdate }) {
  return (
    <textarea
      aria-label={`Block ${index + 1}`}
      value={block.content || ''}
      onChange={(event) => onUpdate(index, { ...block, content: event.target.value })}
    />
  )
}

let routeId = 'template-1'
const branding = {}
const dependencies = {
  React, ...React, ...material, ...icons, ...reportSettings,
  Box, Grid, Stack, useForm, useWatch, useQueryClient, ApiGetCall, ApiPostCall,
  PAGE_ORIENTATIONS, PAGE_SIZES, renderCustomScriptMarkdownTemplate,
  useRouter: () => ({ isReady: true, query: { id: routeId } }),
  useSettings: () => ({ currentTenant: 'tenant.example' }),
  useBrandingSettings: () => branding,
  CippFormComponent: FormField,
  CippFormCondition: empty,
  CippButtonCard: ({ children }) => <div>{children}</div>,
  CippApiResults: ({ apiObject }) => (
    <output aria-label="Save result">
      {apiObject.isSuccess ? 'saved' : apiObject.isError ? 'failed' : 'idle'}
    </output>
  ),
  STRUCTURED_BLOCK_TYPES: [],
  isStructuredBlock: () => false,
  ReportBlock: BlockField,
  DatabaseBlock: BlockField,
  ReportBuilderPDF: empty,
}
const Page = new Function(...Object.keys(dependencies), `${pageCode}; return Page`)(
  ...Object.values(dependencies)
)

const detailKey = (id = 'template-1') => [`ListReportBuilderTemplates-builder-${id}`]
const initial = [
  {
    GUID: 'template-1',
    Name: 'First report',
    Blocks: [{ type: 'blank', title: 'Notes', content: 'original content' }],
    Settings: { size: 'A4', orientation: 'portrait', brandingPresetId: '' },
  },
  {
    GUID: 'template-2',
    Name: 'Second report',
    Blocks: [{ type: 'blank', title: 'Other', content: 'other template content' }],
    Settings: { size: 'A4', orientation: 'portrait', brandingPresetId: '' },
  },
]
let client, server, get, post
const store = configureStore({ reducer: (state = {}) => state })
const mount = (id = 'template-1') => {
  routeId = id
  return render(
    <Provider store={store}>
      <QueryClientProvider client={client}><Page /></QueryClientProvider>
    </Provider>
  )
}
const flush = () => act(() => vi.advanceTimersByTimeAsync(25))
const templateReads = () => get.mock.calls.filter(([url]) => url.startsWith('/api/ListReportBuilderTemplates'))
const edit = (value) => fireEvent.change(screen.getByLabelText('Block 1'), { target: { value } })
const openSave = () => fireEvent.click(screen.getByRole('button', { name: 'Save Template' }))
const save = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await flush()
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  server = structuredClone(initial)
  get = vi.spyOn(axios, 'get').mockImplementation(async (url) => {
    if (url.startsWith('/api/ListReportBuilderTemplates')) return { data: structuredClone(server) }
    if (url === '/api/ListTests') return { data: { TestResults: [] } }
    if (url === '/api/ListAvailableTests') return { data: {} }
    if (url === '/api/ListBrandingPresets') return { data: [] }
    if (url === '/api/ListDBCache' || url === '/api/ListGraphRequest') return { data: { Results: [] } }
    throw new Error(`Unexpected GET: ${url}`)
  })
  post = vi.spyOn(axios, 'post').mockImplementation(async (_url, data) => {
    const index = server.findIndex((item) => item.GUID === data.GUID)
    server[index] = { ...server[index], ...structuredClone(data) }
    // The save response is an acknowledgement, not a copy of the stored template.
    return { data: { Results: ['Saved'] } }
  })
})

afterEach(() => {
  cleanup()
  client.clear()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it.each([0, 1100])('reopens and saves the current server version after %i ms', async (delay) => {
  const first = mount()
  await flush()
  expect(screen.getByLabelText('Block 1')).toHaveValue('original content')
  edit('saved content')
  openSave()
  fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Saved report' } })
  await save()
  expect(screen.getByLabelText('Save result')).toHaveTextContent('saved')
  expect(server[0].Blocks[0].content).toBe('saved content')
  if (delay) {
    edit('later unsaved draft')
    await act(() => vi.advanceTimersByTimeAsync(delay))
    expect(screen.getByLabelText('Block 1')).toHaveValue('later unsaved draft')
  }
  first.unmount()

  // Make the refetch asynchronous: stale hydration must not win before it completes.
  let releaseRead
  const serveGet = get.getMockImplementation()
  get.mockImplementation((url, ...args) => url.startsWith('/api/ListReportBuilderTemplates')
    ? new Promise((resolve) => {
      releaseRead = () => resolve({ data: structuredClone(server) })
    })
    : serveGet(url, ...args))
  mount()
  await flush()
  if (releaseRead) {
    await act(async () => releaseRead())
    await flush()
  }
  get.mockImplementation(serveGet)
  const reopened = screen.getByLabelText('Block 1').value
  openSave()
  await save()
  expect({ reopened, resubmitted: post.mock.calls[1][1].Blocks[0].content }).toEqual({
    reopened: 'saved content', resubmitted: 'saved content',
  })
  expect(screen.getByLabelText('Template Name')).toHaveValue('Saved report')
  expect(templateReads().length).toBeGreaterThanOrEqual(2)
})

it('retains edits and saved caches on failure, then allows a successful retry', async () => {
  client.setQueryData(['ListReportBuilderTemplates'], structuredClone(server))
  mount()
  await flush()
  const cached = client.getQueryData(detailKey())
  edit('unsaved edit')
  openSave()
  post.mockRejectedValueOnce(new Error('Save failed'))
  await save()
  await act(() => vi.advanceTimersByTimeAsync(1100))
  expect(screen.getByLabelText('Save result')).toHaveTextContent('failed')
  expect(screen.getByLabelText('Block 1')).toHaveValue('unsaved edit')
  expect(server[0].Blocks[0].content).toBe('original content')
  expect(client.getQueryData(detailKey())).toBe(cached)
  expect(client.getQueryState(['ListReportBuilderTemplates']).isInvalidated).toBe(false)

  await save()
  expect(screen.getByLabelText('Save result')).toHaveTextContent('saved')
  expect(server[0].Blocks[0].content).toBe('unsaved edit')
})

it('refreshes the list while preserving another template and unrelated caches', async () => {
  client.setQueryData(['ListReportBuilderTemplates'], structuredClone(server))
  client.setQueryData(detailKey('template-2'), structuredClone(server))
  client.setQueryData(['unrelated'], { value: 'keep' })
  const other = client.getQueryState(detailKey('template-2'))
  const unrelated = client.getQueryState(['unrelated'])
  const first = mount()
  await flush()
  edit('saved content')
  openSave()
  await save()
  first.unmount()
  await act(() => vi.advanceTimersByTimeAsync(1100))
  expect(client.getQueryState(['ListReportBuilderTemplates']).isInvalidated).toBe(true)
  expect(client.getQueryState(detailKey('template-2'))).toEqual(other)
  expect(client.getQueryState(['unrelated'])).toEqual(unrelated)
  mount('template-2')
  await flush()
  expect(screen.getByLabelText('Block 1')).toHaveValue('other template content')
  openSave()
  await save()
  expect(post.mock.calls[1][1]).toMatchObject({ GUID: 'template-2', Name: 'Second report' })
  expect(server[0].Blocks[0].content).toBe('saved content')
})

it('keeps serialization, live test blocks and page settings through save/reopen', async () => {
  server[0].Blocks = JSON.stringify([
    { type: 'blank', title: 'Notes', content: 'notes' },
    { type: 'test', testId: 'live', static: false, content: 'old derived text' },
    { type: 'test', testId: 'edited', static: true, content: 'manual text' },
    { type: 'database', dbType: 'Devices', format: 'table', selectedHeaders: ['Name'], content: '| device |' },
  ])
  server[0].Settings = JSON.stringify({ size: 'LETTER', orientation: 'landscape', brandingPresetId: '' })
  client.setQueryData(['tenant.example-ListTests-allreportbuilder'], {
    TestResults: [{ TestId: 'live', Description: 'current result', Status: 'Passed' }],
  })
  const first = mount()
  await flush()
  expect(screen.getByLabelText('Block 2')).toHaveValue('current result')
  expect(screen.getByLabelText('Orientation')).toHaveValue('landscape')
  openSave()
  await save()
  const [url, payload] = post.mock.calls[0]
  expect(url).toBe('/api/ExecReportBuilderTemplate?tenantFilter=tenant.example')
  expect(Object.keys(payload).sort()).toEqual(['Action', 'Blocks', 'GUID', 'Name', 'Settings'])
  expect(payload).toMatchObject({
    Action: 'save', GUID: 'template-1', Name: 'First report',
    Settings: { size: 'LETTER', orientation: 'landscape', brandingPresetId: '' },
  })
  expect(payload.Blocks).toEqual([
    expect.objectContaining({ type: 'blank', content: 'notes', static: true }),
    expect.objectContaining({ type: 'test', testId: 'live', content: null, static: false }),
    expect.objectContaining({ type: 'test', testId: 'edited', content: 'manual text', static: true }),
    expect.objectContaining({ type: 'database', dbType: 'Devices', format: 'table', selectedHeaders: ['Name'], content: '| device |', static: true }),
  ])
  for (const block of payload.Blocks) expect(block).not.toHaveProperty('id')
  first.unmount()
  client.setQueryData(['tenant.example-ListTests-allreportbuilder'], {
    TestResults: [{ TestId: 'live', Description: 'new result', Status: 'Passed' }],
  })
  mount()
  await flush()
  expect(screen.getByLabelText('Block 2')).toHaveValue('new result')
  expect(screen.getByLabelText('Block 3')).toHaveValue('manual text')
  expect(screen.getByLabelText('Block 4')).toHaveValue('| device |')
  expect(screen.getByLabelText('Orientation')).toHaveValue('landscape')
})
