import React from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { createTheme } from '../../src/theme'
import { SettingsContext } from '../../src/contexts/settings-context'
import { useSecureScore } from '../../src/hooks/use-securescore'
import ScoreTable from '../../src/pages/tenant/administration/securescore/table'

vi.mock('../../src/utils/cippVersion', () => ({
  buildVersionedHeaders: async () => ({ 'Content-Type': 'application/json' }),
}))
vi.mock('../../src/utils/standards-data', () => ({
  getStandards: () => [{ tag: ['known-standard'], label: 'Existing standard' }],
}))
vi.mock('../../src/layouts/index.js', () => ({ Layout: ({ children }) => children }))
// Keep the actual page-to-hook binding; table rendering itself is covered separately.
vi.mock('../../src/components/CippComponents/CippTablePage', () => ({
  default: ({ data }) => (
    <div data-testid="score-rows">{data?.map((row) => row.title).join(', ')}</div>
  ),
}))
vi.mock('../../src/components/CippAllTenants/AllTenantsSecureScore', () => ({
  AllTenantsSecureScoreTable: () => <div>All tenants cache</div>,
}))

const theme = createTheme({ colorPreset: 'orange', direction: 'ltr', paletteMode: 'light' })
const store = configureStore({ reducer: (state = {}) => state })
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const fixture = (tenant) => ({
  controls: {
    Results: [
      {
        id: 'control-high',
        title: `${tenant} high`,
        actionUrl: 'https://example.invalid/remediation',
        controlStateUpdates: [{ state: 'Default' }, { state: 'Reviewed' }],
      },
      { id: 'known-standard', title: `${tenant} low` },
    ],
  },
  scores: {
    Results: [
      {
        tenant,
        currentScore: 30,
        maxScore: 40,
        averageComparativeScores: [{ averageScore: 42.6 }, { averageScore: 51.2 }],
        controlScores: [
          { controlName: 'known-standard', scoreInPercentage: 25 },
          { controlName: 'control-high', scoreInPercentage: 80 },
        ],
      },
    ],
  },
})
let client, responses, latest, get
function Probe({ waiting }) {
  const result = useSecureScore({ waiting })
  React.useEffect(() => {
    latest = result
  }, [result])
  return null
}
function Harness({ tenant = 'A', waiting = true, page = false }) {
  return (
    <SettingsContext.Provider value={{ currentTenant: tenant, paletteMode: 'light' }}>
      <Probe waiting={waiting} />
      {page && <ScoreTable />}
    </SettingsContext.Provider>
  )
}
function mount(props = {}) {
  const wrapper = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
  const result = render(<Harness {...props} />, { wrapper })
  return { ...result, change: (next) => result.rerender(<Harness {...props} {...next} />) }
}
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  responses = { A: fixture('A'), B: fixture('B') }
  get = vi.spyOn(axios, 'get').mockImplementation(async (url, { params }) => {
    expect(url).toBe('/api/ListGraphRequest')
    const kind = params.Endpoint.endsWith('ControlProfiles') ? 'controls' : 'scores'
    return { data: await responses[params.tenantFilter][kind] }
  })
})
afterEach(() => {
  cleanup()
  client.clear()
  vi.restoreAllMocks()
})

it.each(['pending', 'both failed', 'controls only', 'scores only'])(
  'does not expose A while B is %s',
  async (state) => {
    const controls = deferred(),
      scores = deferred()
    responses.B = { controls: controls.promise, scores: scores.promise }
    const view = mount({ page: true })
    await waitFor(() => expect(latest.isSuccess).toBe(true))
    expect(screen.getByTestId('score-rows')).toHaveTextContent('A high, A low')
    view.change({ tenant: 'B' })
    await waitFor(() =>
      expect(get.mock.calls.filter(([, p]) => p.params.tenantFilter === 'B')).toHaveLength(2)
    )
    await act(async () => {
      if (state === 'both failed') {
        const error = new AxiosError('Denied', 'ERR_BAD_REQUEST', undefined, undefined, {
          status: 403,
        })
        controls.reject(error)
        scores.reject(error)
      } else if (state === 'controls only') controls.resolve(fixture('B').controls)
      else if (state === 'scores only') scores.resolve(fixture('B').scores)
    })
    if (state === 'both failed')
      await waitFor(() =>
        expect(latest.controlScore.isError && latest.secureScore.isError).toBe(true)
      )
    else if (state === 'controls only')
      await waitFor(() => expect(latest.controlScore.isSuccess).toBe(true))
    else if (state === 'scores only')
      await waitFor(() => expect(latest.secureScore.isSuccess).toBe(true))
    expect(latest.isSuccess).toBe(false)
    expect(latest.translatedData.tenant).toBeUndefined()
    expect(screen.getByTestId('score-rows')).not.toHaveTextContent('A high')
  }
)

it('renders B after both current queries recover without changing translation or sorting', async () => {
  const view = mount({ page: true })
  await waitFor(() => expect(latest.isSuccess).toBe(true))
  view.change({ tenant: 'B' })
  await waitFor(() => expect(latest.translatedData.tenant).toBe('B'))
  expect(screen.getByTestId('score-rows')).toHaveTextContent('B high, B low')
  expect(latest.translatedData).toMatchObject({
    percentageCurrent: 75,
    percentageVsAllTenants: 43,
    percentageVsSimilar: 51,
  })
  expect(latest.translatedData.controlScores[0]).toMatchObject({
    actionUrl: 'https://example.invalid/remediation',
    controlStateUpdates: [{ state: 'Reviewed' }],
  })
  expect(latest.translatedData.controlScores[1]).toMatchObject({
    actionUrl: '/tenant/standards',
    remediation: '1. Enable the CIPP Standard: Existing standard',
  })
  expect(responses.B.scores.Results[0].controlScores[0].controlName).toBe('known-standard')
})

it('preserves cached current-tenant results and suppresses requests while waiting is false', async () => {
  const view = mount({ waiting: false })
  expect(get).not.toHaveBeenCalled()
  expect(latest.isSuccess).toBe(false)
  view.change({ waiting: true })
  await waitFor(() => expect(latest.isSuccess).toBe(true))
  view.change({ waiting: false })
  expect(latest.translatedData.tenant).toBe('A')
  expect(get).toHaveBeenCalledTimes(2)
})

it('clears per-tenant data and makes no Graph requests for AllTenants', async () => {
  const view = mount()
  await waitFor(() => expect(latest.isSuccess).toBe(true))
  view.change({ tenant: 'AllTenants' })
  expect(latest.isSuccess).toBe(false)
  expect(latest.isFetching).toBe(false)
  expect(latest.translatedData).toEqual([])
  expect(get).toHaveBeenCalledTimes(2)
})

it('does not relabel the last successful tenant while current queries are disabled', async () => {
  const view = mount()
  await waitFor(() => expect(latest.isSuccess).toBe(true))
  view.change({ tenant: 'B', waiting: false })
  expect(latest.isSuccess).toBe(false)
  expect(latest.translatedData.tenant).toBeUndefined()
  expect(get).toHaveBeenCalledTimes(2)
})
