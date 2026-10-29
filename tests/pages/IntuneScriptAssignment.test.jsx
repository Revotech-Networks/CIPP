import React from 'react'
import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import Page from '../../src/pages/endpoint/MEM/list-scripts/index'
import { CippTablePage } from '../../src/components/CippComponents/CippTablePage'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

vi.mock('../../src/layouts/index', () => ({ Layout: ({ children }) => children }))
vi.mock('../../src/components/CippComponents/CippCodeBlock', () => ({
  CippCodeBlock: () => null,
}))
vi.mock('../../src/components/CippComponents/CippTablePage', () => ({
  CippTablePage: vi.fn(() => null),
}))

const scripts = [
  { id: 'remediation-1', scriptType: 'Remediation', Tenant: 'alpha.test' },
  { id: 'mac-1', scriptType: 'MacOS', Tenant: 'beta.test' },
  { id: 'windows-1', scriptType: 'Windows', Tenant: 'gamma.test' },
  { id: 'linux-1', scriptType: 'Linux', Tenant: 'delta.test' },
]
const identities = [
  { ID: 'remediation-1', Type: 'deviceHealthScripts', tenantFilter: 'alpha.test' },
  { ID: 'mac-1', Type: 'deviceShellScripts', tenantFilter: 'beta.test' },
  { ID: 'windows-1', Type: 'deviceManagementScripts', tenantFilter: 'gamma.test' },
  { ID: 'linux-1', Type: 'configurationPolicies', tenantFilter: 'delta.test' },
]
const groups = [
  { id: 'group-1', displayName: 'Engineering' },
  { id: 'group-2', displayName: 'Operations' },
]
const groupNames = ['Engineering (group-1)', 'Operations (group-2)']
const originalAdapter = axios.defaults.adapter
let posts
let unexpectedRequests

beforeEach(() => {
  vi.clearAllMocks()
  posts = []
  unexpectedRequests = []
  // Intercept transport; keep the page, dialog, form and React Query/API hooks real.
  axios.defaults.adapter = async (config) => {
    let data
    if (config.method === 'get' && config.url === '/api/ListGraphRequest') {
      data = { Results: groups }
    } else if (config.method === 'post' && config.url === '/api/ExecAssignPolicy') {
      posts.push(JSON.parse(config.data))
      data = { Results: ['Assignment received'] }
    } else {
      unexpectedRequests.push(`${config.method} ${config.url}`)
      throw new Error(`Unexpected request: ${config.method} ${config.url}`)
    }
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (url === '/version.json') {
        return { ok: true, json: async () => ({ version: 'test' }) }
      }
      unexpectedRequests.push(`fetch ${url}`)
      throw new Error(`Unexpected fetch: ${url}`)
    })
  )
})

afterEach(() => {
  axios.defaults.adapter = originalAdapter
  vi.unstubAllGlobals()
  expect(unexpectedRequests).toEqual([])
})

function openAssignment(label, row, tenant = 'AllTenants') {
  const options = { settings: settingsWith({ currentTenant: tenant }) }
  const page = renderWithProviders(<Page />, options)
  const action = CippTablePage.mock.calls.at(-1)[0].actions.find((item) => item.label === label)
  expect(action).toBeDefined()
  page.unmount()

  // The toolbar supplies selected originals as an array; a row action supplies an object.
  renderWithProviders(
    <CippApiDialog
      createDialog={{ open: true, handleClose: vi.fn() }}
      title="Confirmation"
      api={action}
      fields={action.fields}
      row={row}
      {...action}
    />,
    options
  )
  if (!Array.isArray(row)) {
    expect(Array.isArray(action.customDataformatter(row, action, {}))).toBe(false)
  }
  return userEvent.setup()
}

async function confirmAssignment(user, expected) {
  const confirm = screen.getByRole('button', { name: 'Confirm' })
  await waitFor(() => expect(confirm).toBeEnabled())
  await user.click(confirm)
  await waitFor(() => expect(posts).toHaveLength(expected.length), { timeout: 1000 })
  expect(posts).toEqual(expected)
}

describe.each([
  ['Assign to All Users', 'allLicensedUsers'],
  ['Assign to All Devices', 'AllDevices'],
  ['Assign Globally (All Users / All Devices)', 'AllDevicesAndUsers'],
])('%s', (label, target) => {
  it('keeps a single-row object and the default append mode', async () => {
    const user = openAssignment(label, scripts[0])
    await confirmAssignment(user, [
      { ...identities[0], AssignTo: target, assignmentMode: 'append' },
    ])
  })

  it('handles a one-row bulk selection with the selected tenant and replace mode', async () => {
    const user = openAssignment(label, [scripts[1]], 'selected.test')
    await user.click(screen.getByRole('radio', { name: 'Replace existing assignments' }))
    await confirmAssignment(user, [
      {
        ...identities[1],
        tenantFilter: 'selected.test',
        AssignTo: target,
        assignmentMode: 'replace',
      },
    ])
  })

  it('posts each script type to its own tenant in AllTenants mode', async () => {
    const user = openAssignment(label, scripts)
    await user.click(screen.getByRole('radio', { name: 'Replace existing assignments' }))
    await confirmAssignment(
      user,
      identities.map((identity) => ({
        ...identity,
        AssignTo: target,
        assignmentMode: 'replace',
      }))
    )
  })

  it('uses the selected tenant for every script when appending', async () => {
    const user = openAssignment(label, scripts, 'selected.test')
    await confirmAssignment(
      user,
      identities.map((identity) => ({
        ...identity,
        tenantFilter: 'selected.test',
        AssignTo: target,
        assignmentMode: 'append',
      }))
    )
  })
})

describe('Assign to Custom Group', () => {
  it.each([
    ['single row', scripts[0], [identities[0]], 'AllTenants', 'include', 'append', true],
    ['bulk include/append', scripts, identities, 'selected.test', 'include', 'append', true],
    [
      'one-row bulk include/replace',
      [scripts[1]],
      [identities[1]],
      'selected.test',
      'include',
      'replace',
      true,
    ],
    ['bulk exclude/append', scripts, identities, 'AllTenants', 'exclude', 'append', true],
    ['bulk exclude/replace', scripts, identities, 'selected.test', 'exclude', 'replace', true],
    ['clear exclusions', scripts, identities, 'AllTenants', 'exclude', 'replace', false],
  ])(
    '%s preserves identity, tenant and group targets',
    async (_name, row, expectedIdentities, tenant, direction, mode, selectGroups) => {
      const user = openAssignment('Assign to Custom Group', row, tenant)
      if (selectGroups) {
        const picker = screen.getByRole('combobox', { name: 'Group(s)' })
        await waitFor(() => expect(picker).toBeEnabled())
        await user.click(picker)
        for (const name of groupNames) {
          await user.click(await screen.findByRole('option', { name }, { timeout: 1000 }))
        }
        await user.keyboard('{Escape}')
      }
      if (direction === 'exclude') {
        await user.click(screen.getByRole('radio', { name: 'Exclude these group(s)' }))
      }
      if (mode === 'replace') {
        await user.click(screen.getByRole('radio', { name: 'Replace existing assignments' }))
      }
      const ids = selectGroups ? ['group-1', 'group-2'] : []
      const names = selectGroups ? groupNames : []
      await confirmAssignment(
        user,
        expectedIdentities.map((identity) => ({
          ...identity,
          tenantFilter: tenant === 'AllTenants' ? identity.tenantFilter : tenant,
          GroupIds: direction === 'include' ? ids : [],
          GroupNames: direction === 'include' ? names : [],
          ExcludeGroupIds: direction === 'exclude' ? ids : [],
          ExcludeGroupNames: direction === 'exclude' ? names : [],
          assignmentDirection: direction,
          assignmentMode: mode,
        }))
      )
    }
  )

  it('requires groups until both exclude and replace are selected', async () => {
    const user = openAssignment('Assign to Custom Group', scripts)
    const confirm = screen.getByRole('button', { name: 'Confirm' })
    await waitFor(() => expect(confirm).toBeDisabled())
    await user.click(screen.getByRole('radio', { name: 'Replace existing assignments' }))
    expect(confirm).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'Append to existing assignments' }))
    await user.click(screen.getByRole('radio', { name: 'Exclude these group(s)' }))
    expect(confirm).toBeDisabled()
    expect(posts).toEqual([])
    await user.click(screen.getByRole('radio', { name: 'Replace existing assignments' }))
    await waitFor(() => expect(confirm).toBeEnabled())
  })
})
