const test = require('node:test');
const assert = require('node:assert/strict');
const { pushHistoryEntry, getNextStatusFromAction } = require('../utils/uatWorkflow');

test('pushHistoryEntry appends a history record with the transition details', () => {
  const history = [];
  const now = new Date('2024-01-01T00:00:00.000Z');

  const entry = pushHistoryEntry(history, {
    action: 'agreed',
    performedBy: 'user-1',
    note: 'Stakeholder approved the UAT sign-off.',
    statusBefore: 'submitted',
    statusAfter: 'agreed',
  }, now);

  assert.equal(entry.action, 'agreed');
  assert.equal(entry.note, 'Stakeholder approved the UAT sign-off.');
  assert.equal(entry.statusBefore, 'submitted');
  assert.equal(entry.statusAfter, 'agreed');
  assert.equal(entry.performedAt.toISOString(), now.toISOString());
  assert.deepEqual(history, [entry]);
});

test('getNextStatusFromAction maps reverse approval to pending', () => {
  assert.equal(getNextStatusFromAction('approval_reversed'), 'pending');
  assert.equal(getNextStatusFromAction('agreed'), 'agreed');
  assert.equal(getNextStatusFromAction('disagreed'), 'disagreed');
});
