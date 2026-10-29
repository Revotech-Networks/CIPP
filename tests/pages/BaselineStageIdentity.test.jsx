import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Button, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'
import Page from '../../src/pages/tenant/baselines/template'

const boundary = vi.hoisted(() => ({
  router: { query: {}, events: { on() {}, off() {}, emit() {} }, back: vi.fn() },
  templates: [],
  catalog: [],
  mutate: vi.fn(),
}))

vi.mock('next/router', () => ({ useRouter: () => boundary.router }))
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url }) => {
    if (url === '/api/ListBaselines') return { data: boundary.templates }
    if (url === '/api/ListBaselineStandards') return { data: boundary.catalog }
    if (url === '/api/ListCustomVariables') return { data: { Results: [] } }
    throw new Error(`Unexpected API read: ${url}`)
  },
  ApiPostCall: () => ({ mutate: boundary.mutate, isSuccess: false, isPending: false }),
}))
vi.mock('../../src/layouts/index.js', () => ({ Layout: ({ children }) => children }))
vi.mock('../../src/components/CippComponents/CippHead', () => ({ CippHead: () => null }))
vi.mock('../../src/components/CippCards/CippButtonCard', () => ({ default: ({ children }) => children }))
vi.mock('../../src/components/CippCards/CippPropertyListCard', () => ({ CippPropertyListCard: () => null }))
vi.mock('../../src/components/CippComponents/CippApiResults', () => ({ CippApiResults: () => null }))
vi.mock('../../src/utils/permissions.js', () => ({
  PermissionButton: ({ requiredPermissions, ...props }) => <Button {...props} />,
}))
vi.mock('../../src/utils/m365-licenses-data', () => ({ useM365Licenses() {} }))
vi.mock('../../src/utils/get-cipp-service-plan-name', () => ({ getServicePlanFriendlyName: (value) => value }))
vi.mock('../../src/components/CSVReader', () => ({ default: () => null }))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({ CippDataTable: () => null }))

// Replace only presentation/remote-picker leaves. Page, StagePanel, standard settings,
// CippFormComponent, RHF, MUI numeric/switch controls and serialization stay real.
vi.mock('../../src/components/CippComponents/CippAutocomplete', () => ({
  CippAutoComplete: ({ label, defaultValue, options, onChange, onBlur }) => (
    <select
      aria-label={label}
      value={defaultValue?.value ?? ''}
      onBlur={onBlur}
      onChange={(event) => onChange(options.find((option) => option.value === event.target.value))}
    >
      <option value="" />
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}))
vi.mock('../../src/components/CippComponents/CippTextFieldWithVariables', () => ({
  CippTextFieldWithVariables: ({ includeSystemVariables, ...props }) => <TextField {...props} />,
}))
vi.mock('../../src/components/CippComponents/CippFormTenantSelector', () => ({
  CippFormTenantSelector: ({ formControl, name, label }) => (
    <Controller
      name={name}
      control={formControl.control}
      render={({ field }) => (
        <select
          aria-label={label}
          value={field.value?.[0]?.value ?? ''}
          onChange={() => field.onChange([{ label: 'Test tenant', value: 'tenant.example', type: 'tenant' }])}
        >
          <option value="" />
          <option value="tenant.example">Test tenant</option>
          <option value="excluded.example">Excluded tenant</option>
        </select>
      )}
    />
  ),
}))

const standard = (limit, remediateEnabled = true, alertEnabled = true, alertOnRemediate = false) => ({
  standard: 'SharedLimit', instance: 'SharedLimit', variables: { limit },
  remediateEnabled, alertEnabled, alertOnRemediate,
})
const time = (days) => ({ type: 'time', days, unit: 'days' })
const savedStage = (name, days, config, extra = {}) => ({
  name, logic: 'and', conditions: [time(days)], standards: ['SharedLimit'],
  standardsConfig: [config], ...extra,
})
const assignedTenants = [{ label: 'Test tenant', value: 'tenant.example', type: 'tenant' }]
const excludedTenants = [{ label: 'Excluded tenant', value: 'excluded.example', type: 'tenant' }]

beforeEach(() => {
  boundary.router.query = { id: 'first' }
  boundary.mutate.mockReset()
  boundary.templates = [{
    GUID: 'first', templateName: 'First baseline', description: 'Stage identity regression',
    assignments: assignedTenants, exclusions: excludedTenants,
    alertEmails: 'alerts@example.test', alertWebhookUrl: 'https://example.test/alerts',
    updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'Test operator',
    stages: [
      savedStage('A', 1, standard(10)),
      savedStage('B', 7, standard(20, true, false), {
        logic: 'or', conditions: [time(7), { type: 'manual' }],
      }),
      savedStage('C', 30, standard(30)),
      savedStage('D', 40, standard(40, false, true, true)),
    ],
  }]
  boundary.catalog = [{
    name: 'SharedLimit', label: 'Shared limit', cat: 'Test', impact: 'Low Impact',
    expected: { limit: '%limit%' }, variables: { limit: { type: 'number', label: 'Test limit' } },
  }]
})

const click = (role, name) => fireEvent.click(screen.getByRole(role, { name, exact: true }))
const edit = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: true, selector: 'input, select' }), { target: { value } })
const tab = (index, name) => click('tab', `Stage ${index}: ${name}`)
const panel = () => screen.getByRole('textbox', { name: 'Stage Name', exact: true }).closest('.MuiCardContent-root')
  .querySelector(':scope > :not([hidden])')
const field = (label) => within(panel()).getByLabelText(label, { exact: true, selector: 'input, select' })
const editStage = (label, value) => fireEvent.change(field(label), { target: { value } })
const expandStandard = () => {
  const summary = panel().querySelector('.MuiAccordionSummary-root')
  if (summary.getAttribute('aria-expanded') === 'false') fireEvent.click(summary)
}
const addStage = (copy = false) => {
  click('button', 'Add Stage')
  fireEvent.click(screen.getByRole('menuitem', { name: copy ? /Copy currently selected stage/ : 'Add empty stage' }))
}
const removeStage = () => click('button', 'Remove this stage')
const save = () => {
  const previous = boundary.mutate.mock.calls.length
  expect(screen.getByRole('button', { name: 'Save Baseline' })).toBeEnabled()
  click('button', 'Save Baseline')
  expect(boundary.mutate).toHaveBeenCalledTimes(previous + 1)
  const request = boundary.mutate.mock.calls[previous][0]
  expect(request.url).toBe('/api/AddBaseline')
  // Assert the actual JSON body, including absence of all editor-only stage fields.
  const payload = JSON.parse(JSON.stringify(request.data))
  for (const stage of payload.stages) {
    expect(Object.keys(stage).sort()).toEqual(['conditions', 'logic', 'name', 'standards'])
  }
  return payload
}
const expectVisible = (days, limit, conditions, logic, posture) => {
  expandStandard()
  const scope = within(panel())
  expect(field('Duration in the previous stage')).toHaveValue(days)
  expect(field('Test limit')).toHaveValue(limit)
  expect(scope.getAllByLabelText('Condition', { exact: true })).toHaveLength(conditions)
  if (conditions > 1) expect(field('Condition Logic')).toHaveValue(logic)
  for (const [index, label] of [
    'Automatically fix this when the setting drifts', 'Alert on new deviation', 'Alert when remediated',
  ].entries()) {
    expect(field(label).checked).toBe(posture[index])
  }
}

it('preserves surviving unsaved drafts and ordered save data after middle removal', () => {
  const page = render(<Page />)
  expandStandard()
  editStage('Test limit', '11')
  tab(3, 'C')
  expandStandard()
  editStage('Duration in the previous stage', '35')
  editStage('Test limit', '33')
  fireEvent.click(field('Automatically fix this when the setting drifts'))
  fireEvent.click(field('Alert when remediated'))
  click('button', 'Add Condition')
  const conditions = within(panel()).getAllByLabelText('Condition', { exact: true })
  fireEvent.change(conditions[1], { target: { value: 'manual' } })
  editStage('Condition Logic', 'or')
  editStage('Condition Logic', 'and')
  editStage('Stage Name', 'C draft')
  tab(4, 'D')
  expandStandard()
  editStage('Duration in the previous stage', '45')
  editStage('Test limit', '44')
  fireEvent.click(field('Alert on new deviation'))
  page.rerender(<Page />)
  tab(3, 'C draft')
  expectVisible(35, 33, 2, 'and', [false, true, true])
  tab(2, 'B')
  removeStage()
  expect(screen.queryByRole('tab', { name: 'Stage 2: B' })).not.toBeInTheDocument()

  // Check submission independently of the visible assertions: lost serializers can
  // otherwise fall back to empty stages while the retained inputs still look correct.
  expect.soft(save()).toEqual({
    GUID: 'first', templateName: 'First baseline', description: 'Stage identity regression',
    assignedTenants, excludedTenants,
    alertEmails: 'alerts@example.test', alertWebhookUrl: 'https://example.test/alerts',
    stages: [
      { name: 'A', logic: 'and', conditions: [time(1)], standards: [standard('11')] },
      { name: 'C draft', logic: 'and', conditions: [time('35'), { type: 'manual' }], standards: [standard('33', false, true, true)] },
      { name: 'D', logic: 'and', conditions: [time('45')], standards: [standard('44', false, false, true)] },
    ],
  })
  tab(2, 'C draft')
  expectVisible(35, 33, 2, 'and', [false, true, true])
  tab(3, 'D')
  expectVisible(45, 44, 1, 'and', [false, false, true])
  tab(1, 'A')
  expandStandard()
  expect(field('Test limit')).toHaveValue(11)
})

it('keeps distinct forms and serializers through repeated remove, add and saved-stage copy', () => {
  render(<Page />)
  tab(4, 'D')
  removeStage()
  // Copy the saved configuration; extracting current source drafts is a separate contract.
  addStage(true)
  expectVisible(30, 30, 1, 'and', [true, true, false])
  editStage('Stage Name', 'Copy')
  editStage('Duration in the previous stage', '66')
  editStage('Test limit', '66')
  tab(2, 'B')
  removeStage()
  tab(2, 'C')
  expectVisible(30, 30, 1, 'and', [true, true, false])
  editStage('Test limit', '55')
  tab(3, 'Copy')
  expectVisible(66, 66, 1, 'and', [true, true, false])
  addStage()
  expect(field('Duration in the previous stage')).toHaveValue(7)
  expect(within(panel()).queryByLabelText('Test limit')).not.toBeInTheDocument()
  editStage('Stage Name', 'Fresh')
  editStage('Duration in the previous stage', '77')
  tab(3, 'Copy')
  removeStage()
  tab(3, 'Fresh')
  expect(field('Duration in the previous stage')).toHaveValue(77)
  addStage()
  expect(field('Duration in the previous stage')).toHaveValue(7)
  expect(save().stages).toEqual([
    { name: 'A', logic: 'and', conditions: [time(1)], standards: [standard(10)] },
    { name: 'C', logic: 'and', conditions: [time(30)], standards: [standard('55')] },
    { name: 'Fresh', logic: 'and', conditions: [time('77')], standards: [] },
    { name: 'Stage 4', logic: 'and', conditions: [time(7)], standards: [] },
  ])
  removeStage()
  removeStage()
  removeStage()
  expect(screen.queryByRole('button', { name: 'Remove this stage' })).not.toBeInTheDocument()
  expandStandard()
  editStage('Stage Name', 'Survivor')
  editStage('Test limit', '99')
  expect(save().stages).toEqual([
    { name: 'Survivor', logic: 'and', conditions: [time(1)], standards: [standard('99')] },
  ])
})

it('hydrates another loaded template and the original again without leaking drafts', () => {
  boundary.templates.push({
    ...boundary.templates[0], GUID: 'second', templateName: 'Second baseline',
    stages: [savedStage('Other A', 2, standard(200)), savedStage('Other B', 8, standard(800, false, false, true))],
  })
  const page = render(<Page />)
  tab(3, 'C')
  expandStandard()
  editStage('Test limit', '333')
  boundary.router.query = { id: 'second' }
  page.rerender(<Page />)
  expect(screen.getByRole('textbox', { name: /^Baseline Name/ })).toHaveValue('Second baseline')
  tab(2, 'Other B')
  expectVisible(8, 800, 1, 'and', [false, false, true])
  expect(save().stages).toEqual([
    { name: 'Other A', logic: 'and', conditions: [time(2)], standards: [standard(200)] },
    { name: 'Other B', logic: 'and', conditions: [time(8)], standards: [standard(800, false, false, true)] },
  ])
  boundary.router.query = { id: 'first' }
  page.rerender(<Page />)
  tab(3, 'C')
  expectVisible(30, 30, 1, 'and', [true, true, false])
  expect(save().GUID).toBe('first')
})

it('preserves the clone payload contract without persisting editor identities', () => {
  boundary.router.query = { id: 'first', clone: 'true' }
  render(<Page />)
  const payload = save()
  expect(payload).not.toHaveProperty('GUID')
  expect(payload.templateName).toBe('First baseline (Clone)')
  expect(payload.assignedTenants).toEqual(assignedTenants)
  expect(payload.excludedTenants).toEqual(excludedTenants)
  expect(payload.stages).toEqual([
    { name: 'A', logic: 'and', conditions: [time(1)], standards: [standard(10)] },
    { name: 'B', logic: 'or', conditions: [time(7), { type: 'manual', unit: 'days' }], standards: [standard(20, true, false)] },
    { name: 'C', logic: 'and', conditions: [time(30)], standards: [standard(30)] },
    { name: 'D', logic: 'and', conditions: [time(40)], standards: [standard(40, false, true, true)] },
  ])
})

it('creates a baseline with independent default, added and copied stages', async () => {
  boundary.router.query = {}
  render(<Page />)
  edit(/^Baseline Name/, 'New baseline')
  edit('Assigned Tenants', 'tenant.example')
  click('button', 'Add Standards')
  click('button', 'Add to stage')
  click('button', 'Done')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expandStandard()
  editStage('Test limit', '12')
  for (const label of ['Automatically fix this when the setting drifts', 'Alert on new deviation']) {
    if (!field(label).checked) fireEvent.click(field(label))
  }
  addStage()
  // Copy before editing either stage, leaving draft extraction outside this regression.
  addStage(true)
  expect(field('Duration in the previous stage')).toHaveValue(7)
  editStage('Duration in the previous stage', '29')
  tab(2, 'Stage 2')
  expect(field('Duration in the previous stage')).toHaveValue(7)
  editStage('Duration in the previous stage', '19')
  removeStage()
  tab(2, 'Stage 2 (Copy)')
  expect(field('Duration in the previous stage')).toHaveValue(29)
  expect(save()).toEqual({
    templateName: 'New baseline', description: '', assignedTenants, excludedTenants: [],
    alertEmails: '', alertWebhookUrl: '',
    stages: [
      { name: 'Default', logic: 'and', conditions: [], standards: [standard('12')] },
      { name: 'Stage 2 (Copy)', logic: 'and', conditions: [time('29')], standards: [] },
    ],
  })
})
