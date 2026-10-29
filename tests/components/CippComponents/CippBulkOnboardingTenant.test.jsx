import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, beforeEach, it, expect } from 'vitest'
const state = vi.hoisted(() => ({
  settings: { currentTenant: 'tenant-a.example', usageLocation: 'US' },
  mutate: vi.fn(),
}))
vi.mock('../../../src/hooks/use-settings', () => ({ useSettings: () => state.settings }))
vi.mock('../../../src/api/ApiCall', () => ({ ApiPostCall: () => ({ mutate: state.mutate }) }))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))
vi.mock('../../../src/components/CippComponents/CippFormComponent', () => ({
  default: ({ type, name, formControl }) =>
    type === 'CSVReader' ? (
      <button
        onClick={() =>
          formControl.setValue(name, [
            { displayName: 'Synthetic User', mail: 'synthetic@example.invalid' },
          ])
        }
      >
        Load synthetic CSV
      </button>
    ) : null,
}))
vi.mock('../../../src/components/CippComponents/CippFormLicenseSelector', () => ({
  CippFormLicenseSelector: () => null,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({ CippDataTable: () => null }))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
import { CippBulkUserDrawer } from '../../../src/components/CippComponents/CippBulkUserDrawer'
import { CippBulkInviteGuestDrawer } from '../../../src/components/CippComponents/CippBulkInviteGuestDrawer'
beforeEach(() => {
  state.settings = { currentTenant: 'tenant-a.example', usageLocation: 'US' }
  state.mutate.mockClear()
})
const cases = [
  ['users', CippBulkUserDrawer, 'Bulk Add Users', 'Create Users', '/api/AddUserBulk'],
  ['guests', CippBulkInviteGuestDrawer, 'Bulk Invite Guests', 'Send Invites', '/api/AddGuest'],
]
it.each(cases)(
  'submits %s to the tenant selected before opening',
  (_, Component, open, submit, url) => {
    const view = render(<Component />)
    state.settings = { ...state.settings, currentTenant: 'tenant-b.example' }
    view.rerender(<Component />)
    fireEvent.click(screen.getByRole('button', { name: open }))
    fireEvent.click(screen.getByRole('button', { name: 'Load synthetic CSV' }))
    fireEvent.click(screen.getByRole('button', { name: submit }))
    expect(state.mutate).toHaveBeenCalledTimes(1)
    const request = state.mutate.mock.calls[0][0]
    expect(request.url).toBe(url)
    const payloads = Array.isArray(request.data) ? request.data : [request.data]
    expect(payloads.map((x) => x.tenantFilter)).toEqual(['tenant-b.example'])
  }
)

it.each(cases)(
  'refreshes %s again after closing and switching tenants',
  (_, Component, open, submit) => {
    const view = render(<Component />)
    fireEvent.click(screen.getByRole('button', { name: open }))
    fireEvent.click(screen.getByRole('button', { name: 'Load synthetic CSV' }))
    fireEvent.click(screen.getByRole('button', { name: submit }))
    let request = state.mutate.mock.calls[0][0]
    expect((Array.isArray(request.data) ? request.data[0] : request.data).tenantFilter).toBe(
      'tenant-a.example'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    state.settings = { ...state.settings, currentTenant: 'tenant-c.example', usageLocation: 'CA' }
    view.rerender(<Component />)
    fireEvent.click(screen.getByRole('button', { name: open }))
    expect(screen.getByRole('button', { name: submit })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Load synthetic CSV' }))
    fireEvent.click(screen.getByRole('button', { name: submit }))
    request = state.mutate.mock.calls[1][0]
    const payload = Array.isArray(request.data) ? request.data[0] : request.data
    expect(payload.tenantFilter).toBe('tenant-c.example')
    if (request.url === '/api/AddUserBulk') {
      expect(payload.usageLocation).toBe('CA')
      expect(payload.licenses).toEqual([])
    } else {
      expect(payload.sendInvite).toBe(true)
      expect(payload.message).toBe('')
    }
  }
)
