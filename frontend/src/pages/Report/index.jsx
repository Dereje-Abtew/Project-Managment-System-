import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Select, Tag, Progress } from 'antd';

import CrudModule from '@/modules/CrudModule';
import ReportForm from '@/forms/ReportForm';

import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

const { Option } = Select;

// ─── Status badge helper (mirrors CodeIgniter project_status badges) ─────────
function StatusBadge({ scope }) {
  if (!scope) return <span style={styles.badge.na}>N/A</span>;
  const map = {
    'On Track':  { bg: '#52c41a', label: 'On Track'  },
    'At Risk':   { bg: '#faad14', label: 'At Risk'   },
    'Delayed':   { bg: '#f5222d', label: 'Delayed'   },
  };
  const cfg = map[scope] || { bg: '#8c8c8c', label: scope };
  return (
    <span style={{ ...styles.badge.base, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

// ─── Stats cell helper (mirrors CI: days left/overdue + task completed) ───────
function StatsCell({ record }) {
  const endDate = record?.endDate || record?.project?.endDate;
  if (!endDate) return <span style={styles.badge.na}>N/A</span>;

  const diff = dayjs(endDate).diff(dayjs(), 'day');
  const daysText = diff >= 0
    ? `${diff} Days Left`
    : `${Math.abs(diff)} Days Overdue`;
  const daysColor = diff >= 0 ? '#52c41a' : '#f5222d';

  const tasks      = record?.project?.task ?? [];
  const total      = tasks.length;
  const completed  = tasks.filter(
    t => t.stage === 'completed' || t.actual === 100
  ).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ fontSize: '12px', lineHeight: '1.8', minWidth: 130 }}>
      <div>
        <span style={{ color: daysColor, fontWeight: 600 }}>📅 {daysText}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#555', fontWeight: 600 }}>
          ✓ {completed}/{total} Tasks
        </span>
      </div>
      {total > 0 && (
        <Progress percent={pct} size="small" showInfo={false}
          strokeColor={pct === 100 ? '#52c41a' : '#1890ff'} />
      )}
    </div>
  );
}

const styles = {
  badge: {
    base: {
      color: 'white',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    },
    na: {
      color: '#bbb',
      fontSize: '12px',
    },
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
    padding: '12px 16px',
    background: '#f5f5f5',
    borderRadius: '8px',
    border: '1px solid #e8e8e8',
  },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Report() {
  document.title = 'Report - PMS';
  const getColumnSearchProps = useColumnSearch();

  // Filter state — mirrors CI queryParams (status, user, client)
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const searchConfig = {
    displayLabels: ['projectName', 'Project'],
    searchFields: ['projectName', 'project.title'],
    outputValue: '_id',
  };
  const entityDisplayLabels = ['projectName'];

  const readColumns = [
    { title: 'Report Name', dataIndex: 'projectName' },
  ];

  // ─── Columns (same order as CodeIgniter report-projects.php) ────────────────
  const dataTableColumns = [
    // 1. Title (Report Name) — always visible, searchable
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Report Name</b>,
      columnLabel: 'Report Name',
      key:         'projectName',
      dataIndex:   'projectName',
      sorter:      (a, b) => (a.projectName || '').localeCompare(b.projectName || ''),
      ...getColumnSearchProps('projectName'),
    },

    // 1.5 Project Name (Linked)
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Project</b>,
      columnLabel: 'Project',
      key:         'project_title',
      dataIndex:   ['project', 'title'],
      sorter:      (a, b) => (a.project?.title || '').localeCompare(b.project?.title || ''),
      ...getColumnSearchProps(['project', 'title']),
    },


    // 2. Budget - ETB — from linked Project (project.totalBudget)
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Budget - ETB</b>,
      columnLabel: 'Budget - ETB',
      key:         'totalBudget',
      dataIndex:   ['project', 'totalBudget'],
      render: (val, record) => {
        const budget = val ?? record?.project?.totalBudget;
        return budget != null
          ? <span style={{ fontWeight: 500 }}>{Number(budget).toLocaleString()}</span>
          : <span style={styles.badge.na}>N/A</span>;
      },
    },

    // 3. Starting Date — from Report's own startDate field
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Starting Date</b>,
      columnLabel: 'Starting Date',
      key:         'startDate',
      dataIndex:   'startDate',
      sorter:      (a, b) => new Date(a.startDate) - new Date(b.startDate),
      render: (date) =>
        date
          ? dayjs(date).format('DD MMM YYYY')
          : <span style={styles.badge.na}>N/A</span>,
    },

    // 4. Ending Date — from Report's own endDate field
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Ending Date</b>,
      columnLabel: 'Ending Date',
      key:         'endDate',
      dataIndex:   'endDate',
      sorter:      (a, b) => new Date(a.endDate) - new Date(b.endDate),
      render: (date) =>
        date
          ? dayjs(date).format('DD MMM YYYY')
          : <span style={styles.badge.na}>N/A</span>,
    },

    // 5. Status — from Report's status.scope field (On Track / At Risk / Delayed)
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Status</b>,
      columnLabel: 'Status',
      key:         'status',
      dataIndex:   'status',
      filters: [
        { text: 'On Track', value: 'On Track' },
        { text: 'At Risk',  value: 'At Risk'  },
        { text: 'Delayed',  value: 'Delayed'  },
      ],
      onFilter:    (value, record) => record?.status?.scope === value,
      render: (status) => <StatusBadge scope={status?.scope} />,
    },

    // 6. Project Client — from project.ownerName (hidden by default, like CI data-visible="false")
    {
      title:        <b style={{ whiteSpace: 'nowrap' }}>Project Client</b>,
      columnLabel:  'Project Client',
      key:          'ownerName',
      dataIndex:    ['project', 'ownerName', 'name'],
      defaultHidden: true,                      // ← hidden by default like CodeIgniter
      render: (ownerName) =>
        ownerName
          ? <span>{ownerName}</span>
          : <span style={styles.badge.na}>N/A</span>,
    },

    // 7. Stats — days left/overdue + task completion (hidden by default, like CI data-visible="false")
    {
      title:        <b style={{ whiteSpace: 'nowrap' }}>Stats</b>,
      columnLabel:  'Stats',
      key:          'stats',
      dataIndex:    'endDate',
      defaultHidden: true,                      // ← hidden by default like CodeIgniter
      render: (_, record) => <StatsCell record={record} />,
    },

    // 8. Created On
    {
      title:       <b style={{ whiteSpace: 'nowrap' }}>Created On</b>,
      columnLabel: 'Created On',
      key:         'created',
      dataIndex:   'created',
      sorter:      (a, b) => new Date(a.created) - new Date(b.created),
      render: (date) =>
        date
          ? dayjs(date).format('ddd, DD MMM YYYY')
          : <span style={styles.badge.na}>N/A</span>,
    },
  ];

  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels,
  };

  return (
    <>
      {/* ── Filter Bar (mirrors CodeIgniter #tool row with select2 dropdowns) ── */}
      <div style={styles.filterBar}>
        {/* Select Status (matches CI project_filters_status) */}
        <Select
          allowClear
          style={{ width: 180 }}
          placeholder="Select Status"
          value={filterStatus || undefined}
          onChange={(v) => setFilterStatus(v || '')}
        >
          <Option value="On Track">On Track</Option>
          <Option value="At Risk">At Risk</Option>
          <Option value="Delayed">Delayed</Option>
        </Select>

        {/* Select Client (matches CI project_filters_client) */}
        <Select
          allowClear
          style={{ width: 200 }}
          placeholder="Select Client"
          value={filterClient || undefined}
          onChange={(v) => setFilterClient(v || '')}
        >
          {/* Populated dynamically when backend provides client list */}
        </Select>

        {/* Status summary tags */}
        {filterStatus && (
          <Tag color={
            filterStatus === 'On Track' ? 'green' :
            filterStatus === 'At Risk'  ? 'orange' : 'red'
          } style={{ lineHeight: '30px', fontSize: '13px' }}>
            Filtered by: {filterStatus}
          </Tag>
        )}
      </div>

      <CrudModule
        createForm={<ReportForm />}
        updateForm={<ReportForm isUpdateForm={true} />}
        config={config}
      />
    </>
  );
}
