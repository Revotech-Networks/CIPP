import React from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { renderWithProviders } from '../test-utils'
import BackupPage from '../../src/pages/cipp/settings/backup'

// Keep the real page, validator, wizard and API hooks; omit unrelated page furniture.
vi.mock('../../src/layouts/index.js', () => ({ Layout: ({ children }) => children }))
vi.mock('../../src/components/CippCards/CippPageCard', () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../src/components/CippCards/CippInfoBar', () => ({ CippInfoBar: () => null }))
vi.mock('../../src/components/CippComponents/CippApiDialog', () => ({ CippApiDialog: () => null }))
vi.mock('../../src/components/CippComponents/CippApiResults', () => ({ CippApiResults: () => null }))
vi.mock('react-time-ago', () => ({ default: () => null }))
vi.mock('../../src/utils/cippVersion', () => ({ buildVersionedHeaders: async () => ({}) }))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ cardButton, data, actions }) => <div>
    {cardButton}
    {data.map((row) => <button key={row.BackupName}
      onClick={() => actions.find((action) => action.label === 'Restore Backup').customFunction(row)}>
      Restore {row.BackupName}
    </button>)}
  </div>,
}))
vi.mock('@mui/icons-material', () => {
  const Icon = () => null
  return Object.fromEntries([
    'ArrowCircleRight', 'CloudDownload', 'CloudUpload', 'EventRepeat', 'History',
    'ManageHistory', 'NextPlan', 'SettingsBackupRestore', 'Storage', 'CheckCircle',
    'DeselectOutlined', 'DoneAll', 'Error', 'ExpandLess', 'ExpandMore', 'NavigateBefore',
    'NavigateNext', 'UploadFile', 'Warning',
  ].map((name) => [name, Icon]))
})

const selectedRow = {
  table: 'Config', PartitionKey: 'p', RowKey: 'r',
  value: 'literal,} and ,] and "quotes,}" and \\backslashes,] and {, , ,',
}
const excludedRow = { table: 'Domains', PartitionKey: 'p', RowKey: 'domain', value: 'excluded,}' }
const backupName = 'stored-backup.json'
const malformed = `[${JSON.stringify(selectedRow).slice(0, -1)},},${JSON.stringify(excludedRow)},]`
const requests = []
const server = setupServer(
  http.get('*/api/ExecListBackup', () => HttpResponse.json([{ BackupName: backupName }])),
  http.get('*/api/ListScheduledItems', () => HttpResponse.json([])),
  http.get('*/api/ExecBackupReplicationConfig', () => HttpResponse.json({ Results: {} })),
  http.post('*/api/ExecListBackup', () => HttpResponse.json([{ Backup: malformed }])),
  http.post('*/api/ExecRestoreBackup', async ({ request }) => {
    requests.push(await request.json())
    return HttpResponse.json({ Results: 'Restored' })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  requests.length = 0
})
afterAll(() => server.close())

const confirmConfigOnly = async () => {
  await screen.findByText('Validation Passed')
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  fireEvent.click(screen.getByRole('checkbox', { name: /Domains/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  fireEvent.click(screen.getByRole('button', { name: 'Restore', exact: true }))
  await waitFor(() => expect(requests).toHaveLength(1))
}

describe('backup validation through upload and restore', () => {
  it.each([
    ['repaired', malformed],
    ['valid', JSON.stringify([selectedRow, excludedRow])],
  ])('posts preserved selected rows from a %s uploaded backup', async (_kind, content) => {
    const { container } = renderWithProviders(<BackupPage />)
    await screen.findByText('Restore From File')
    const file = new File([content], 'backup.json', { type: 'application/json' })

    fireEvent.change(container.querySelector('#backup-upload'), { target: { files: [file] } })
    await confirmConfigOnly()

    expect(requests[0]).toEqual([selectedRow])
  })

  it('retains the stored-backup name and category request contract', async () => {
    renderWithProviders(<BackupPage />)
    fireEvent.click(await screen.findByRole('button', { name: `Restore ${backupName}` }))
    await confirmConfigOnly()

    expect(requests[0]).toEqual({ BackupName: backupName, SelectedTypes: ['Config'] })
  })

  it('blocks an unrecoverable upload before restore', async () => {
    const { container } = renderWithProviders(<BackupPage />)
    await screen.findByText('Restore From File')
    const file = new File(['not JSON'], 'broken.json', { type: 'application/json' })
    fireEvent.change(container.querySelector('#backup-upload'), { target: { files: [file] } })

    await screen.findByText('Validation Failed')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(requests).toEqual([])
  })
})
