function pushHistoryEntry(history, payload, performedAt = new Date()) {
  const entry = {
    action: payload.action,
    performedBy: payload.performedBy || '',
    performedAt,
    note: payload.note || '',
    statusBefore: payload.statusBefore || '',
    statusAfter: payload.statusAfter || '',
  };

  if (Array.isArray(history)) {
    history.push(entry);
  }

  return entry;
}

function getNextStatusFromAction(action) {
  switch (action) {
    case 'agreed':
      return 'agreed';
    case 'disagreed':
      return 'disagreed';
    case 'approval_reversed':
      return 'pending';
    case 'submitted':
      return 'submitted';
    default:
      return 'pending';
  }
}

module.exports = {
  pushHistoryEntry,
  getNextStatusFromAction,
};
