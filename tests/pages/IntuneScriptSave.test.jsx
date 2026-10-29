import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configureStore } from '@reduxjs/toolkit'
import { renderWithProviders, settingsWith } from '../test-utils'
import Page from '../../src/pages/endpoint/MEM/list-scripts/index.jsx'
import toastsReducer from '../../src/store/toasts'
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'

// Only the unrelated table/report API hooks are stubbed. Script GET/POST use real React Query.
vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())

// jsdom has no layout for virtual rows; keep the real table and its action menu.
vi.mock('material-react-table', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useMaterialReactTable: (options) =>
      actual.useMaterialReactTable({
        ...options,
        enableRowVirtualization: false,
        enableColumnVirtualization: false,
      }),
  }
})

// Monaco does not load in jsdom; retain its controlled value/change/read-only contract.
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange, options }) => (
    <textarea
      aria-label="Script content"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      readOnly={options.readOnly}
    />
  ),
}))

const originalCode = "Write-Output 'original'"
const editedCode = "Write-Output 'café ✓'"
const remediationCode = "Write-Output 'répaired ✓'"
const base64 = (value) => Buffer.from(value, 'utf8').toString('base64')
const scriptMetadata = {
  id: 'script-123',
  displayName: 'Example script',
  description: 'Test script description',
  runAs32Bit: false,
  runAsAccount: 'system',
  roleScopeTagIds: ['0'],
}

function mountPage(scriptType = 'Windows', { rowTenant = 'row.example', post } = {}) {
  const script = {
    ...scriptMetadata,
    scriptType,
    ...(scriptType === 'Remediation'
      ? {
          publisher: 'Test publisher',
          enforceSignatureCheck: true,
          detectionScriptContent: base64(originalCode),
          remediationScriptContent: base64('exit 0'),
        }
      : { fileName: 'example.ps1', scriptContent: base64(originalCode) }),
  }
  api.get = getResult({ isSuccess: false })
  api.post = postResult()
  api.paginated = paginatedResult([], { data: { pages: [[{ ...script, Tenant: rowTenant }]] } })
  const requests = []
  const fetchMock = vi.fn(async (url, options) => {
    if (url === '/api/EditIntuneScript' && options?.method === 'POST') {
      requests.push({ url, ...options })
      return post ? post() : Response.json({ Results: 'Saved' })
    }
    if (
      url ===
      `/api/EditIntuneScript?TenantFilter=${rowTenant || 'selected.example'}&ScriptId=script-123`
    ) {
      return Response.json(script)
    }
    throw new Error(`Unexpected fetch: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  const store = configureStore({ reducer: { toasts: toastsReducer } })
  renderWithProviders(<Page />, {
    store,
    settings: settingsWith({ currentTenant: 'selected.example' }),
  })
  return {
    user: userEvent.setup(),
    requests,
    toastTitles: () => store.getState().toasts.toasts.map(({ title }) => title),
  }
}

async function openEditor(user) {
  await user.click(await screen.findByRole('button', { name: 'Row Actions' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Edit Script' }))
  await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(originalCode))
}

async function replaceCode(user, value) {
  await user.clear(screen.getByRole('textbox'))
  await user.paste(value)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// These interactions mount the real table and wait for MUI dialog transitions.
describe('Intune script save', { timeout: 30000 }, () => {
  it.each([
    ['HTTP 403', () => Response.json({ error: 'Forbidden' }, { status: 403 })],
    ['network rejection', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('preserves both editors and unsaved state after %s', async (_name, post) => {
    const saveResponse = vi
      .fn()
      .mockImplementationOnce(post)
      .mockImplementation(() => Response.json({ Results: 'Saved' }))
    const { user, requests, toastTitles } = mountPage('Remediation', { post: saveResponse })
    await openEditor(user)
    await replaceCode(user, editedCode)
    await user.click(screen.getByRole('tab', { name: 'Remediation Script' }))
    await replaceCode(user, remediationCode)
    await user.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => expect(toastTitles()).toEqual(['Script Save Error']), { timeout: 2000 })
    expect(requests).toHaveLength(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(remediationCode)
    await user.click(screen.getByRole('tab', { name: 'Detection Script' }))
    expect(screen.getByRole('textbox')).toHaveValue(editedCode)
    await user.click(screen.getByRole('button', { name: 'close' }))
    expect(
      await screen.findByText('Changes detected, are you sure you want to close?')
    ).toBeInTheDocument()
    expect(toastTitles()).not.toContain('Script Saved')

    await user.click(screen.getByRole('button', { name: 'Abort' }))
    await user.click(await screen.findByRole('button', { name: 'save' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(requests).toHaveLength(2)
    expect(requests[1].body).toBe(requests[0].body)
    expect(toastTitles()).toEqual(['Script Save Error', 'Script Saved'])
  })

  it.each(['Windows', 'MacOS', 'Linux', 'Remediation'])(
    'saves the unchanged %s payload contract and resets the editor once',
    async (scriptType) => {
      const rowTenant = scriptType === 'Linux' ? null : 'row.example'
      const { user, requests, toastTitles } = mountPage(scriptType, { rowTenant })
      await openEditor(user)
      await replaceCode(user, editedCode)
      if (scriptType === 'Remediation') {
        await user.click(screen.getByRole('tab', { name: 'Remediation Script' }))
        await replaceCode(user, remediationCode)
      }
      await user.click(screen.getByRole('button', { name: 'save' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(toastTitles()).toEqual(['Script Saved'])
      expect(requests).toHaveLength(1)
      expect(requests[0]).toMatchObject({
        url: '/api/EditIntuneScript',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = JSON.parse(requests[0].body)
      expect(payload).toEqual({
        TenantFilter: rowTenant || 'selected.example',
        ScriptId: 'script-123',
        ScriptType: scriptType,
        IntuneScript: expect.any(String),
      })
      expect(JSON.parse(payload.IntuneScript)).toEqual({
        ...scriptMetadata,
        ...(scriptType === 'Remediation'
          ? {
              publisher: 'Test publisher',
              enforceSignatureCheck: true,
              detectionScriptContent: base64(editedCode),
              remediationScriptContent: base64(remediationCode),
            }
          : { fileName: 'example.ps1', scriptContent: base64(editedCode) }),
      })

      // Reopening starts at the first field without stale edits or an unsaved-changes warning.
      await openEditor(user)
      await user.click(screen.getByRole('button', { name: 'close' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(requests).toHaveLength(1)
      expect(toastTitles()).toEqual(['Script Saved'])
    }
  )

  it('does not mistake cached success data for a successful refetch', async () => {
    const post = vi
      .fn()
      .mockImplementationOnce(() => Response.json({ Results: 'Saved' }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const { user, requests, toastTitles } = mountPage('Windows', { post })
    await openEditor(user)
    await replaceCode(user, editedCode)
    await user.click(screen.getByRole('button', { name: 'save' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(toastTitles()).toEqual(['Script Saved'])

    await openEditor(user)
    await replaceCode(user, 'Keep this unsaved edit')
    await user.click(screen.getByRole('button', { name: 'save' }))
    await waitFor(() => expect(toastTitles()).toEqual(['Script Saved', 'Script Save Error']))
    expect(screen.getByRole('textbox')).toHaveValue('Keep this unsaved edit')
    expect(requests).toHaveLength(2)
  })
})
