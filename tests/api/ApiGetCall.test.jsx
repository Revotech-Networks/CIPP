import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import axios from 'axios'
import { ApiGetCall } from '../../src/api/ApiCall'

let client
let get
let invalidate

function renderGet(props = {}) {
  const store = configureStore({ reducer: (state = {}) => state })
  return renderHook(
    () =>
      ApiGetCall({
        url: '/api/test',
        queryKey: 'request',
        waiting: false,
        retry: 0,
        ...props,
      }),
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </Provider>
      ),
    }
  )
}

async function refetch(result) {
  let response
  await act(async () => {
    response = await result.current.refetch({ throwOnError: true })
  })
  return response.data
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  get = vi.spyOn(axios, 'get').mockRejectedValue(new Error('Unexpected request'))
  invalidate = vi.spyOn(client, 'invalidateQueries')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 'test-version' }),
    })
  )
})

afterEach(() => {
  cleanup()
  client.clear()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ApiGetCall', () => {
  it.each([false, true])(
    'returns results and invalidates related queries after 1000ms (bulk=%s)',
    async (bulkRequest) => {
      const params = { id: 'one' }
      const payload = { Results: ['done'] }
      const onResult = vi.fn()
      const cacheKeys = [
        ['Users.one'],
        ['Users.'],
        ['UsersXone'],
        ['prefixUsers.one'],
        ['Groups[two].one'],
        ['Groupst.one'],
        ['Exact'],
        ['Exact', 'child'],
        ['ExactOther'],
        [],
        [''],
      ]
      cacheKeys.forEach((key) => client.setQueryData(key, 'cached'))
      get.mockResolvedValue({ data: payload })
      const { result } = renderGet({
        data: bulkRequest ? [params] : params,
        bulkRequest,
        relatedQueryKeys: ['Users.*', 'Groups[two].*', 'Exact'],
        onResult,
      })

      expect(await refetch(result)).toEqual(bulkRequest ? [payload] : payload)
      expect(onResult).toHaveBeenCalledExactlyOnceWith(payload)
      expect(get).toHaveBeenCalledExactlyOnceWith('/api/test', {
        signal: expect.any(AbortSignal),
        params,
        headers: { 'Content-Type': 'application/json', 'X-CIPP-Version': 'test-version' },
        ...(bulkRequest ? {} : { responseType: 'json' }),
      })
      expect(invalidate).not.toHaveBeenCalled()
      await act(() => vi.advanceTimersByTimeAsync(999))
      expect(invalidate).not.toHaveBeenCalled()
      await act(() => vi.advanceTimersByTimeAsync(1))
      expect(invalidate).toHaveBeenCalledTimes(2)
      expect(invalidate).toHaveBeenNthCalledWith(1, { predicate: expect.any(Function) })
      expect(invalidate).toHaveBeenNthCalledWith(2, { queryKey: ['Exact'] })
      expect(cacheKeys.map((key) => client.getQueryState(key).isInvalidated)).toEqual([
        true,
        true,
        false,
        false,
        true,
        false,
        true,
        true,
        false,
        false,
        false,
      ])
    }
  )

  it('requests bulk items sequentially, emits each result, and schedules only after the last response', async () => {
    const second = Promise.withResolvers()
    const secondStarted = Promise.withResolvers()
    const onResult = vi.fn()
    get.mockResolvedValueOnce({ data: 'first' }).mockImplementationOnce(() => {
      expect(onResult).toHaveBeenCalledExactlyOnceWith('first')
      secondStarted.resolve()
      return second.promise
    })
    const { result } = renderGet({
      bulkRequest: true,
      data: [{ id: 1 }, { id: 2 }],
      onResult,
      relatedQueryKeys: 'Exact',
    })
    let pending
    await act(async () => {
      pending = result.current.refetch({ throwOnError: true })
      await secondStarted.promise
    })
    expect(get.mock.calls.map(([, options]) => options.params)).toEqual([{ id: 1 }, { id: 2 }])
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(invalidate).not.toHaveBeenCalled()
    await act(async () => {
      second.resolve({ data: 'second' })
      expect((await pending).data).toEqual(['first', 'second'])
    })
    expect(onResult.mock.calls).toEqual([['first'], ['second']])
    await act(() => vi.advanceTimersByTimeAsync(999))
    expect(invalidate).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: ['Exact'] })
  })

  it.each([false, true])(
    'keeps the tenantFilter cancellation exception single-only (bulk=%s)',
    async (bulkRequest) => {
      get.mockResolvedValue({ data: 'ok' })
      const { result } = renderGet({ url: '/api/tenantFilter', bulkRequest, data: [{}] })
      await refetch(result)
      expect(get.mock.calls[0][1].signal).toEqual(bulkRequest ? expect.any(AbortSignal) : null)
    }
  )

  it('uses the single-request path for a non-array bulk input and preserves responseType', async () => {
    const data = { id: 'one' }
    get.mockResolvedValue({ data: 'text result' })
    const { result } = renderGet({ bulkRequest: true, data, responseType: 'text' })
    expect(await refetch(result)).toBe('text result')
    expect(get.mock.calls[0][1]).toMatchObject({ params: data, responseType: 'text' })
  })

  it.each([false, true])(
    'returns and emits the blob with optional data URL conversion (convert=%s)',
    async (convertToDataUrl) => {
      const blob = new Blob(['hello'], { type: 'text/plain' })
      const onResult = vi.fn()
      get.mockResolvedValue({ data: blob })
      const { result } = renderGet({ responseType: 'blob', convertToDataUrl, onResult })
      const expected = convertToDataUrl ? 'data:text/plain;base64,aGVsbG8=' : blob
      expect(await refetch(result)).toBe(expected)
      expect(onResult).toHaveBeenCalledExactlyOnceWith(expected)
      expect(get.mock.calls[0][1].responseType).toBe('blob')
    }
  )

  it('does not apply single-only responseType or blob conversion to bulk responses', async () => {
    const blob = new Blob(['hello'])
    const onResult = vi.fn()
    get.mockResolvedValue({ data: blob })
    const { result } = renderGet({
      bulkRequest: true,
      data: [{}],
      responseType: 'blob',
      convertToDataUrl: true,
      onResult,
    })
    expect((await refetch(result))[0]).toBe(blob)
    expect(onResult).toHaveBeenCalledExactlyOnceWith(blob)
    expect(get.mock.calls[0][1]).not.toHaveProperty('responseType')
  })

  it('returns an empty bulk array and still schedules scalar wildcard invalidation', async () => {
    const onResult = vi.fn()
    client.setQueryData(['anything'], 'cached')
    client.setQueryData([123], 'cached')
    client.setQueryData([''], 'cached')
    const { result } = renderGet({ bulkRequest: true, data: [], relatedQueryKeys: '*', onResult })
    expect(await refetch(result)).toEqual([])
    expect(get).not.toHaveBeenCalled()
    expect(onResult).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(999))
    expect(invalidate).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(invalidate).toHaveBeenCalledExactlyOnceWith({ predicate: expect.any(Function) })
    expect(client.getQueryState(['anything']).isInvalidated).toBe(true)
    expect(client.getQueryState([123]).isInvalidated).toBe(true)
    expect(client.getQueryState(['']).isInvalidated).toBe(false)
  })

  it.each(['single', 'bulk', 'callback'])(
    'preserves %s failure and never schedules invalidation',
    async (failure) => {
      const error = new Error('failed')
      const onResult = vi.fn(() => {
        if (failure === 'callback') throw error
      })
      if (failure === 'bulk') get.mockResolvedValueOnce({ data: 'first' })
      if (failure === 'callback') get.mockResolvedValue({ data: 'first' })
      else get.mockRejectedValue(error)
      const { result } = renderGet({
        bulkRequest: failure === 'bulk',
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        relatedQueryKeys: 'Exact',
        onResult,
      })
      await expect(refetch(result)).rejects.toBe(error)
      expect(get).toHaveBeenCalledTimes(failure === 'bulk' ? 2 : 1)
      expect(onResult.mock.calls).toEqual(failure === 'single' ? [] : [['first']])
      await act(() => vi.advanceTimersByTimeAsync(2000))
      expect(invalidate).not.toHaveBeenCalled()
    }
  )

  it('passes query cancellation to the request without invalidating related queries', async () => {
    const started = Promise.withResolvers()
    let signal
    get.mockImplementationOnce(
      (url, options) =>
        new Promise((resolve, reject) => {
          signal = options.signal
          signal.addEventListener('abort', () => reject(new axios.CanceledError('cancelled')))
          started.resolve()
        })
    )
    const { result } = renderGet({ relatedQueryKeys: 'Exact' })
    let pending
    await act(async () => {
      pending = result.current.refetch()
      await started.promise
      await client.cancelQueries({ queryKey: ['request'] })
      await pending
    })
    expect(signal.aborted).toBe(true)
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(invalidate).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'does not invalidate without related keys (bulk=%s)',
    async (bulkRequest) => {
      get.mockResolvedValue({ data: 'ok' })
      const { result } = renderGet({ bulkRequest, data: [{}] })
      await refetch(result)
      await act(() => vi.advanceTimersByTimeAsync(2000))
      expect(invalidate).not.toHaveBeenCalled()
    }
  )
})
