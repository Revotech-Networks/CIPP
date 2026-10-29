import { describe, expect, it } from 'vitest'
import { BackupValidator } from '../../src/utils/backupValidation'

const rowWith = (value) => ({ table: 'Config', PartitionKey: 'p', RowKey: 'r', value })
const literals = [
  'literal,}',
  'literal,]',
  'literal,   } and ,  ]',
  'escaped "quote,}" and \\backslash,]',
  'backslashes \\\\ then "quote",}',
  'opening {, and repeated , , commas',
]

describe('backup syntax repair preserves quoted content', () => {
  it.each(literals)('repairs structural commas without changing %j', (value) => {
    const row = rowWith(value)
    row['key,}'] = 'value,]'
    const malformed = `[${JSON.stringify(row).slice(0, -1)},},]`

    const result = BackupValidator.validateBackup(malformed)

    expect(result.isValid).toBe(true)
    expect(result.repaired).toBe(true)
    expect(result.data).toEqual([row])
    expect(result.errors).toEqual([])
  })

  it.each(literals)('leaves valid JSON containing %j unchanged', (value) => {
    const row = rowWith(value)
    const result = BackupValidator.validateBackup(JSON.stringify([row]))

    expect(result).toMatchObject({ isValid: true, repaired: false, data: [row], warnings: [] })
  })

  it('repairs nested object and array commas while preserving their values', () => {
    const nested = { 'key,]': ['array,]', { value: 'object,}' }] }
    const malformed = `[${JSON.stringify(rowWith('outer,}')).slice(0, -1)},"nested":` +
      `{"key,]":["array,]",{"value":"object,}",},],},},]`

    const result = BackupValidator.validateBackup(malformed)

    expect(result).toMatchObject({
      isValid: true,
      repaired: true,
      data: [{ ...rowWith('outer,}'), nested }],
    })
  })

  it.each(['{{{{', '}}}}', '[[[[', ']]]]', 'escaped "quote } ] \\'])(
    'ignores quoted brackets when completing truncated JSON containing %j',
    (value) => {
      const row = rowWith(value)
      const result = BackupValidator.validateBackup(JSON.stringify([row]).slice(0, -2))

      expect(result).toMatchObject({ isValid: true, repaired: true, data: [row] })
    },
  )

  it('preserves all punctuation substitutions during isolated-entry cleanup', () => {
    const row = rowWith(literals.join(' | '))
    row['key{, , ,}'] = 'value,]'
    row.nested = { value: 'nested{, , ,}' }
    const nextRow = { ...rowWith('next,}'), RowKey: 'next' }
    // Exercise the existing isolation boundary and all three cleanup substitutions.
    const retained = JSON.stringify(row).slice(0, -1)
      .replace('"PartitionKey":', ',"PartitionKey":')
      .replace('"nested":{', '"nested":{,')
    const malformed = `[${retained},\n    {\n        "PartitionKey": BROKEN` +
      `\n    },\n    {\n        "PartitionKey": "p",` +
      `"table":"Config","RowKey":"next","value":"next,}"}]`
    const result = BackupValidator._isolateCorruptedEntry(malformed, malformed.indexOf('BROKEN'))

    expect(result.success).toBe(true)
    expect(JSON.parse(result.repairedJson)).toEqual([row, nextRow])
  })
})

describe('backup validation and recovery controls', () => {
  it('keeps valid rows and skips rows with missing or invalid storage fields', () => {
    const validRow = rowWith('valid')
    const rows = [validRow, null, 42, {}, { ...validRow, table: '' }, { ...validRow, RowKey: 5 }]
    const result = BackupValidator.validateBackup(JSON.stringify(rows))

    expect(result).toMatchObject({
      isValid: true, repaired: false, data: [validRow], validRows: 1, totalRows: rows.length,
    })
    expect(result.warnings).toContain('5 corrupted rows will be skipped during import')
  })

  it('retains single-object normalization', () => {
    const row = rowWith('single')
    expect(BackupValidator.validateBackup(JSON.stringify(row))).toMatchObject({
      isValid: true, repaired: false, data: [row], validRows: 1, totalRows: 1,
    })
  })

  it('recovers complete rows before corruption without changing their strings', () => {
    const row = rowWith('complete,} [ {, , ,')
    const complete = JSON.stringify([row], null, 4).slice(0, -2)
    const malformed = `${complete},\n    {"PartitionKey": "p", BROKEN}`

    const result = BackupValidator.validateBackup(malformed)

    expect(result).toMatchObject({ isValid: true, repaired: true, data: [row] })
  })

  it.each(['', '   ', 'not JSON', '[{"table":"Config","value":"unterminated,}\\'])(
    'rejects unrecoverable input %j',
    (input) => {
      const result = BackupValidator.validateBackup(input)
      expect(result.isValid).toBe(false)
      expect(result.data).toBeNull()
      expect(result.errors.length).toBeGreaterThan(0)
    },
  )

  it.each(['[]', '42', '[{"table":"Config"}]'])('rejects input with no valid rows: %s', (input) => {
    const result = BackupValidator.validateBackup(input)
    expect(result.isValid).toBe(false)
    expect(result.validRows).toBe(0)
  })
})
