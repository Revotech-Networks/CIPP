import React, { useEffect, useState } from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { renderWithProviders, settingsWith } from '../test-utils'
import { SettingsContext } from '../../src/contexts/settings-context'
import Policy from '../../src/pages/email/administration/exchange-retention/policies/policy'
import Tag from '../../src/pages/email/administration/exchange-retention/tags/tag'

const routing = vi.hoisted(() => ({ router: { query: {}, back: vi.fn() } }))
vi.mock('next/router', () => ({ useRouter: () => routing.router }))
vi.mock('../../src/layouts/index.js', () => ({ Layout: ({ children }) => children }))
vi.mock('../../src/utils/cippVersion', () => ({ buildVersionedHeaders: async () => ({}) }))
vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  isAxiosError: (error) => error?.isAxiosError === true,
}))

const A = 'tenant-a.example'
const B = 'tenant-b.example'
const tags = {
  [A]: [{ Name: 'A-only tag', Type: 'Inbox' }],
  [B]: [{ Name: 'B-only tag', Type: 'Inbox' }],
}
const policies = {
  [A]: { Name: 'A policy', RetentionPolicyTagLinks: ['A-only tag'] },
  [B]: { Name: 'B policy', RetentionPolicyTagLinks: ['B-only tag'] },
}
const existingTags = Object.fromEntries([A, B].map((tenant) => [tenant, {
  Name: `${tenant} tag`,
  Type: 'Inbox',
  Comment: `${tenant} comment`,
  RetentionAction: 'DeleteAndAllowRecovery',
  AgeLimitForRetention: '90.00:00:00',
  RetentionEnabled: false,
  LocalizedComment: ['Localized comment'],
  LocalizedRetentionPolicyTagName: ['Localized tag'],
}]))

function respond(url) {
  const request = new URL(url, 'https://cipp.test')
  const tenant = request.searchParams.get('tenantFilter')
  if (request.pathname === '/api/ExecManageRetentionPolicies') {
    return { data: policies[tenant] }
  }
  if (request.pathname === '/api/ExecManageRetentionTags') {
    return { data: request.searchParams.has('name') ? existingTags[tenant] : tags[tenant] }
  }
  return { data: [] }
}

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function mountPage(Page, name) {
  let updateSettings, queryClient
  routing.router = { query: { tenantFilter: A, ...(name ? { name } : {}) }, back: vi.fn() }
  function Harness() {
    const [settings, setSettings] = useState(settingsWith({ currentTenant: A }))
    const client = useQueryClient()
    useEffect(() => {
      updateSettings = setSettings
      queryClient = client
    }, [client])
    return <SettingsContext.Provider value={settings}><Page /></SettingsContext.Provider>
  }
  const rendered = renderWithProviders(<Harness />)
  return {
    queryClient,
    async selectTenant(tenant) {
      routing.router = { ...routing.router, query: { ...routing.router.query, tenantFilter: tenant } }
      await act(async () => updateSettings(settingsWith({ currentTenant: tenant })))
    },
    async refreshSettings() {
      await act(async () => updateSettings((settings) => ({ ...settings })))
    },
    dispose() {
      rendered.unmount()
      queryClient.clear()
    },
  }
}

let page
beforeEach(() => {
  axios.get.mockReset().mockImplementation(async (url) => respond(url))
  axios.post.mockReset().mockResolvedValue({ data: { Results: ['Success'] } })
})
afterEach(() => page?.dispose())

async function enterName(user, kind, value) {
  const input = await screen.findByRole('textbox', { name: kind === 'policy' ? /^Policy Name/ : /^Tag Name/ })
  await user.clear(input)
  await user.type(input, value)
}

async function selectOption(user, label, name) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name, exact: true }))
  await user.keyboard('{Escape}')
}

async function submit(user) {
  const before = axios.post.mock.calls.length
  const button = screen.getByRole('button', { name: 'Submit' })
  await waitFor(() => expect(button).toBeEnabled())
  await user.click(button)
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(before + 1))
  return axios.post.mock.calls[before].slice(0, 2)
}

describe('retention creation follows the selected tenant without remounting', () => {
  it.each([['policy', Policy], ['tag', Tag]])('%s submits B, A, then B after successive switches', async (kind, Page) => {
    page = mountPage(Page)
    const user = userEvent.setup()
    for (const [index, tenant] of [B, A, B].entries()) {
      await page.selectTenant(tenant)
      const name = `Created ${index}`
      await enterName(user, kind, name)
      if (kind === 'tag') {
        if (index === 0) await selectOption(user, /Tag Type/, 'Inbox')
        expect(screen.getByRole('combobox', { name: /Tag Type/ })).toHaveValue('Inbox')
      }
      expect(await submit(user)).toEqual(kind === 'policy'
        ? ['/api/ExecManageRetentionPolicies', { tenantFilter: tenant, CreatePolicies: [{ Name: name, RetentionPolicyTagLinks: [] }] }]
        : ['/api/ExecManageRetentionTags', { tenantFilter: tenant, CreateTags: [{ Name: name, Type: 'Inbox', RetentionEnabled: true }] }])
    }
  })

  it.each([['policy', Policy], ['tag', Tag]])('%s preserves entered fields when the tenant is unchanged', async (kind, Page) => {
    page = mountPage(Page)
    const user = userEvent.setup()
    await screen.findByRole('textbox', { name: kind === 'policy' ? /^Policy Name/ : /^Tag Name/ })
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    await enterName(user, kind, 'Unchanged tenant')
    if (kind === 'policy') {
      await selectOption(user, /Retention Tags/, 'A-only tag (Inbox)')
    } else {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
      await selectOption(user, /Tag Type/, 'Inbox')
      await user.type(screen.getByRole('textbox', { name: 'Comment', exact: true }), 'Keep this comment')
    }
    await page.refreshSettings()
    if (kind === 'policy') {
      await act(async () => page.queryClient.invalidateQueries({ queryKey: [`RetentionTags-ForManagement${A}`] }))
      expect(screen.getByText('A-only tag (Inbox)', { selector: '.MuiChip-label' })).toBeInTheDocument()
    }
    expect(await submit(user)).toEqual(kind === 'policy'
      ? ['/api/ExecManageRetentionPolicies', { tenantFilter: A, CreatePolicies: [{ Name: 'Unchanged tenant', RetentionPolicyTagLinks: ['A-only tag'] }] }]
      : ['/api/ExecManageRetentionTags', { tenantFilter: A, CreateTags: [{ Name: 'Unchanged tenant', Type: 'Inbox', Comment: 'Keep this comment', RetentionEnabled: true }] }])
  })

  it('clears policy tag selections when switching between tenants with cached options', async () => {
    page = mountPage(Policy)
    const user = userEvent.setup()
    await screen.findByRole('textbox', { name: /^Policy Name/ })
    await selectOption(user, /Retention Tags/, 'A-only tag (Inbox)')
    act(() => page.queryClient.setQueryData([`RetentionTags-ForManagement${B}`], tags[B]))
    await page.selectTenant(B)
    await enterName(user, 'policy', 'B policy draft')
    expect(screen.queryByText('A-only tag (Inbox)', { selector: '.MuiChip-label' })).not.toBeInTheDocument()
    await selectOption(user, /Retention Tags/, 'B-only tag (Inbox)')
    expect((await submit(user))[1]).toEqual({ tenantFilter: B, CreatePolicies: [{ Name: 'B policy draft', RetentionPolicyTagLinks: ['B-only tag'] }] })
    await page.selectTenant(A)
    await enterName(user, 'policy', 'A policy draft')
    expect(screen.queryByText('B-only tag (Inbox)', { selector: '.MuiChip-label' })).not.toBeInTheDocument()
    expect((await submit(user))[1]).toEqual({ tenantFilter: A, CreatePolicies: [{ Name: 'A policy draft', RetentionPolicyTagLinks: [] }] })
  })

  it.each(['success', 'error'])('does not restore A selections after late A data and B tag loading %s', async (outcome) => {
    page = mountPage(Policy)
    const user = userEvent.setup()
    await screen.findByRole('textbox', { name: /^Policy Name/ })
    await selectOption(user, /Retention Tags/, 'A-only tag (Inbox)')
    const lateA = deferred()
    const pendingB = deferred()
    axios.get.mockImplementation((url) => {
      if (url === `/api/ExecManageRetentionTags?tenantFilter=${A}`) return lateA.promise
      if (url === `/api/ExecManageRetentionTags?tenantFilter=${B}`) return pendingB.promise
      return Promise.resolve(respond(url))
    })
    act(() => { void page.queryClient.invalidateQueries({ queryKey: [`RetentionTags-ForManagement${A}`] }) })
    await waitFor(() => expect(page.queryClient.isFetching({ queryKey: [`RetentionTags-ForManagement${A}`] })).toBe(1))
    await page.selectTenant(B)
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/ExecManageRetentionTags?tenantFilter=${B}`, expect.anything()))
    expect(screen.queryByRole('textbox', { name: /^Policy Name/ })).not.toBeInTheDocument()
    await act(async () => lateA.resolve({ data: tags[A] }))
    expect(screen.queryByRole('textbox', { name: /^Policy Name/ })).not.toBeInTheDocument()
    await act(async () => {
      if (outcome === 'success') pendingB.resolve({ data: tags[B] })
      else pendingB.reject({ isAxiosError: true, response: { status: 500 } })
    })
    await enterName(user, 'policy', 'B after loading')
    expect(screen.queryByText('A-only tag (Inbox)', { selector: '.MuiChip-label' })).not.toBeInTheDocument()
    expect((await submit(user))[1]).toEqual({ tenantFilter: B, CreatePolicies: [{ Name: 'B after loading', RetentionPolicyTagLinks: [] }] })
  })
})

describe('retention editing controls', () => {
  it('hydrates the selected tenant policy and preserves the ModifyPolicies payload', async () => {
    page = mountPage(Policy, 'policy identity')
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByRole('textbox', { name: /^Policy Name/ })).toHaveValue('A policy'))
    await page.selectTenant(B)
    await waitFor(() => expect(screen.getByRole('textbox', { name: /^Policy Name/ })).toHaveValue('B policy'))
    expect(screen.getByText('B-only tag (Inbox)', { selector: '.MuiChip-label' })).toBeInTheDocument()
    await enterName(user, 'policy', 'Edited B policy')
    expect(await submit(user)).toEqual(['/api/ExecManageRetentionPolicies', {
      tenantFilter: B,
      ModifyPolicies: [{ Identity: 'policy identity', Name: 'Edited B policy', RetentionPolicyTagLinks: ['B-only tag'] }],
    }])
  })

  it('hydrates tag fields and preserves the ModifyTags payload after a tenant switch', async () => {
    page = mountPage(Tag, 'tag identity')
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByRole('textbox', { name: /^Tag Name/ })).toHaveValue(`${A} tag`))
    await page.selectTenant(B)
    await waitFor(() => expect(screen.getByRole('textbox', { name: /^Tag Name/ })).toHaveValue(`${B} tag`))
    expect(screen.getByRole('combobox', { name: /Tag Type/ })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: /Tag Type/ })).toHaveValue('Inbox')
    expect(screen.getByRole('spinbutton', { name: 'Age Limit (Days)' })).toHaveValue(90)
    expect(screen.getByRole('textbox', { name: 'Localized Tag Name' })).toHaveValue('Localized tag')
    await enterName(user, 'tag', 'Edited B tag')
    expect(await submit(user)).toEqual(['/api/ExecManageRetentionTags', {
      tenantFilter: B,
      ModifyTags: [{
        Identity: 'tag identity', Name: 'Edited B tag', Comment: `${B} comment`,
        RetentionAction: 'DeleteAndAllowRecovery', AgeLimitForRetention: 90,
        RetentionEnabled: false, LocalizedComment: 'Localized comment',
        LocalizedRetentionPolicyTagName: 'Localized tag',
      }],
    }])
  })
})
