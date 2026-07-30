import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Statistic, Select, DatePicker, Button, Table,
  Tag, Progress, Spin, Empty, Tooltip, Space, Divider, Dropdown, Menu as AntMenu,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, DownloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
  RiseOutlined, FallOutlined, ProjectOutlined,
  FileExcelOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import logoIcon from '@/style/images/logo.png';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { request } from '@/request';
import useColumnSearch from '@/hooks/useColumnSearch';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, ChartTooltip, Legend,
);

const { RangePicker } = DatePicker;
const { Option } = Select;

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLOR = {
  completed:  '#52c41a',
  delayed:    '#f5222d',
  inprogress: '#faad14',
  backlog:    '#1890ff',
  ontime:     '#13c2c2',
  budget:     '#722ed1',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, suffix, color, icon, sub }) {
  return (
    <Card
      bordered={false}
      style={{ borderTop: `3px solid ${color}`, borderRadius: 8, height: '100%' }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <Statistic
        title={<span style={{ fontSize: 13, color: '#555' }}>{title}</span>}
        value={value ?? 0}
        suffix={suffix}
        prefix={icon}
        valueStyle={{ color, fontSize: 26, fontWeight: 700 }}
      />
      {sub && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

// ─── Classification badge ──────────────────────────────────────────────────────
const CLASSIF_TAG = {
  completed:  <Tag color="success">Completed</Tag>,
  delayed:    <Tag color="error">Delayed</Tag>,
  inprogress: <Tag color="warning">In Progress</Tag>,
  backlog:    <Tag color="processing">Backlog</Tag>,
};

// ─── Priority badge ───────────────────────────────────────────────────────────
const PRIORITY_TAG = {
  high:   <Tag color="red">High</Tag>,
  medium: <Tag color="orange">Medium</Tag>,
  low:    <Tag color="green">Low</Tag>,
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GeneralReport() {
  document.title = 'General Report - PMS';
  const getColumnSearchProps = useColumnSearch();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [dateRange,     setDateRange]     = useState(null);   // [dayjs, dayjs] | null
  const [projectId,     setProjectId]     = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [priorityFilter,setPriorityFilter]= useState('');
  const [classifFilter, setClassifFilter] = useState('');     // completed|delayed|inprogress|backlog
  const [projectSearch, setProjectSearch] = useState('');     // project title text search

  // ── Data state ──────────────────────────────────────────────────────────────
  const [loading,            setLoading]            = useState(false);
  const [summary,            setSummary]            = useState(null);
  const [projectBreakdowns,  setProjectBreakdowns]  = useState([]);
  const [monthlyTrend,       setMonthlyTrend]       = useState([]);
  const [taskDetails,        setTaskDetails]        = useState([]);
  const [projectOptions,     setProjectOptions]     = useState([]); // for project dropdown
  const [requirementSummary, setRequirementSummary] = useState(null);
  const [requirementDetails, setRequirementDetails] = useState([]);

  // ── Fetch project list for dropdown ─────────────────────────────────────────
  useEffect(() => {
    request.list({ entity: 'project', options: { page: 1, items: 200 } }).then((res) => {
      if (res?.result) setProjectOptions(res.result);
    });
  }, []);

  // ── Fetch analytics ──────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.[0]) params.append('startDate', dateRange[0].toISOString());
      if (dateRange?.[1]) params.append('endDate',   dateRange[1].toISOString());
      if (projectId)       params.append('projectId',  projectId);
      if (statusFilter)    params.append('status',     statusFilter);
      if (priorityFilter)  params.append('priority',   priorityFilter);

      const qs = params.toString();
      const res = await request.get({ entity: `project-report/analytics${qs ? '?' + qs : ''}` });

      if (res?.success) {
        setSummary(res.summary);
        setProjectBreakdowns(res.projectBreakdowns || []);
        setMonthlyTrend(res.monthlyTrend || []);
        setTaskDetails(res.taskDetails || []);
        setRequirementSummary(res.requirementSummary || null);
        setRequirementDetails(res.requirementDetails || []);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, projectId, statusFilter, priorityFilter]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Filtered task rows (client-side classif + text filter) ──────────────────
  const filteredTasks = taskDetails.filter((t) => {
    if (classifFilter && t.classification !== classifFilter) return false;
    if (projectSearch && !t.projectTitle?.toLowerCase().includes(projectSearch.toLowerCase())) return false;
    return true;
  });

  // ── Chart: Stage distribution Doughnut ──────────────────────────────────────
  const doughnutData = summary
    ? {
        labels: ['Completed', 'Delayed', 'In Progress', 'Backlog'],
        datasets: [{
          data: [summary.totalCompleted, summary.totalDelayed, summary.totalInProgress, summary.totalBacklog],
          backgroundColor: [COLOR.completed, COLOR.delayed, COLOR.inprogress, COLOR.backlog],
          borderWidth: 2,
        }],
      }
    : null;

  // ── Chart: Per-project stacked bar ──────────────────────────────────────────
  const barData = projectBreakdowns.length > 0
    ? {
        labels: projectBreakdowns.map((p) => p.title.length > 20 ? p.title.slice(0, 20) + '…' : p.title),
        datasets: [
          { label: 'Completed',  data: projectBreakdowns.map((p) => p.taskCounts.completed),  backgroundColor: COLOR.completed  },
          { label: 'Delayed',    data: projectBreakdowns.map((p) => p.taskCounts.delayed),    backgroundColor: COLOR.delayed    },
          { label: 'In Progress',data: projectBreakdowns.map((p) => p.taskCounts.inprogress), backgroundColor: COLOR.inprogress },
          { label: 'Backlog',    data: projectBreakdowns.map((p) => p.taskCounts.backlog),    backgroundColor: COLOR.backlog    },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Task Distribution per Project' } },
    scales: { x: { stacked: true }, y: { stacked: true, ticks: { stepSize: 1 } } },
  };

  // ── Chart: Monthly trend Line ────────────────────────────────────────────────
  const lineData = monthlyTrend.length > 0
    ? {
        labels: monthlyTrend.map((m) => m.month),
        datasets: [
          { label: 'Completed',  data: monthlyTrend.map((m) => m.completed),  borderColor: COLOR.completed,  backgroundColor: COLOR.completed  + '33', tension: 0.3, fill: true },
          { label: 'Delayed',    data: monthlyTrend.map((m) => m.delayed),    borderColor: COLOR.delayed,    backgroundColor: COLOR.delayed    + '33', tension: 0.3, fill: true },
          { label: 'In Progress',data: monthlyTrend.map((m) => m.inprogress), borderColor: COLOR.inprogress, backgroundColor: COLOR.inprogress + '33', tension: 0.3, fill: true },
        ],
      }
    : null;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Monthly Task Trend (by Submission Date)' } },
    scales: { y: { ticks: { stepSize: 1 } } },
  };

  // ── Chart: On-time vs Delayed completion Bar ─────────────────────────────────
  const onTimeBarData = summary
    ? {
        labels: ['Completed On-Time', 'Completed Late', 'Still Delayed', 'In Progress'],
        datasets: [{
          data: [
            summary.totalOnTime,
            summary.totalCompleted - summary.totalOnTime,
            summary.totalDelayed,
            summary.totalInProgress,
          ],
          backgroundColor: [COLOR.completed, COLOR.delayed, '#ff7875', COLOR.inprogress],
        }],
      }
    : null;

  const onTimeBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false }, title: { display: true, text: 'On-Time vs Delayed Breakdown' } },
  };

  // ── Task detail table columns ────────────────────────────────────────────────
  const taskColumns = [
    {
      title: 'Project',
      dataIndex: 'projectTitle',
      key: 'projectTitle',
      sorter: (a, b) => (a.projectTitle || '').localeCompare(b.projectTitle || ''),
      ...getColumnSearchProps('projectTitle'),
      width: 160,
      render: (v) => <Tooltip title={v}><span style={{ fontWeight: 600 }}>{v?.length > 18 ? v.slice(0, 18) + '…' : v}</span></Tooltip>,
    },
    {
      title: 'Task',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
      ...getColumnSearchProps('taskTitle'),
      width: 180,
      render: (v, r) => <Tooltip title={r.description}>{v}</Tooltip>,
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedTo', 'name'],
      key: 'assignedTo',
      ...getColumnSearchProps(['assignedTo', 'name']),
      width: 150,
      render: (_, r) => r.assignedTo?.name || <span style={{ color: '#bbb' }}>Unassigned</span>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      filters: [
        { text: 'High',   value: 'high'   },
        { text: 'Medium', value: 'medium' },
        { text: 'Low',    value: 'low'    },
      ],
      onFilter: (val, r) => r.priority === val,
      render: (v) => PRIORITY_TAG[v] || <Tag>{v}</Tag>,
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      width: 110,
      render: (v) => <Tag>{v || '—'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'classification',
      key: 'classification',
      width: 120,
      filters: [
        { text: 'Completed',   value: 'completed'  },
        { text: 'Delayed',     value: 'delayed'    },
        { text: 'In Progress', value: 'inprogress' },
        { text: 'Backlog',     value: 'backlog'    },
      ],
      onFilter: (val, r) => r.classification === val,
      render: (v) => CLASSIF_TAG[v] || <Tag>{v}</Tag>,
    },
    {
      title: 'On Time',
      dataIndex: 'isOnTime',
      key: 'isOnTime',
      width: 90,
      render: (v, r) => {
        if (r.classification !== 'completed') return <span style={{ color: '#bbb' }}>—</span>;
        return v
          ? <CheckCircleOutlined style={{ color: COLOR.completed, fontSize: 16 }} />
          : <WarningOutlined     style={{ color: COLOR.delayed,   fontSize: 16 }} />;
      },
    },
    {
      title: 'Days Variance',
      dataIndex: 'daysVariance',
      key: 'daysVariance',
      width: 120,
      sorter: (a, b) => (a.daysVariance ?? 0) - (b.daysVariance ?? 0),
      render: (v) => {
        if (v == null) return <span style={{ color: '#bbb' }}>—</span>;
        const color = v > 0 ? COLOR.delayed : v < 0 ? COLOR.completed : '#1890ff';
        const icon  = v > 0 ? <FallOutlined /> : v < 0 ? <RiseOutlined /> : null;
        return <span style={{ color }}>{icon} {v > 0 ? `+${v}d late` : v < 0 ? `${Math.abs(v)}d early` : 'On time'}</span>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'actual',
      key: 'actual',
      width: 130,
      sorter: (a, b) => (a.actual ?? 0) - (b.actual ?? 0),
      render: (actual, r) => {
        const pct = r.weight > 0 ? Math.min(100, Math.round((actual / r.weight) * 100)) : 0;
        return <Progress percent={pct} size="small" strokeColor={pct === 100 ? COLOR.completed : COLOR.inprogress} />;
      },
    },
    {
      title: 'Submission Date',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      width: 140,
      sorter: (a, b) => new Date(a.submissionDate) - new Date(b.submissionDate),
      render: (v) => v ? dayjs(v).format('DD MMM YYYY') : '—',
    },
    {
      title: 'Cost / Actual Cost',
      key: 'costVariance',
      width: 150,
      render: (_, r) => {
        const over = r.actualCost > r.cost;
        return (
          <span>
            <span style={{ color: '#555' }}>{(r.cost || 0).toLocaleString()}</span>
            <span style={{ color: '#bbb' }}> / </span>
            <span style={{ color: over ? COLOR.delayed : COLOR.completed }}>{(r.actualCost || 0).toLocaleString()}</span>
          </span>
        );
      },
    },
  ];

  // ── Project breakdown table columns ──────────────────────────────────────────
  const projectColumns = [
    {
      title: 'Project',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        const map = { ongoing: 'blue', closed: 'green', pending: 'orange' };
        return <Tag color={map[v] || 'default'}>{v}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (v) => PRIORITY_TAG[v] || <Tag>{v}</Tag>,
    },
    {
      title: 'Achievement',
      dataIndex: 'achievement',
      key: 'achievement',
      sorter: (a, b) => a.achievement - b.achievement,
      render: (v) => (
        <Progress percent={v || 0} size="small"
          strokeColor={v >= 100 ? COLOR.completed : v >= 50 ? COLOR.inprogress : COLOR.delayed}
        />
      ),
    },
    {
      title: 'Tasks',
      key: 'tasks',
      render: (_, r) => (
        <Space size={4} wrap>
          <Tooltip title="Completed"><Tag color="success">{r.taskCounts.completed}</Tag></Tooltip>
          <Tooltip title="Delayed">  <Tag color="error">  {r.taskCounts.delayed}  </Tag></Tooltip>
          <Tooltip title="In Progress"><Tag color="warning">{r.taskCounts.inprogress}</Tag></Tooltip>
          <Tooltip title="Backlog">  <Tag color="blue">   {r.taskCounts.backlog}  </Tag></Tooltip>
        </Space>
      ),
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (_, r) => {
        const over = r.actualBudget > r.totalBudget;
        return (
          <span>
            {(r.totalBudget || 0).toLocaleString()}
            <span style={{ color: over ? COLOR.delayed : COLOR.completed, marginLeft: 4 }}>
              / {(r.actualBudget || 0).toLocaleString()}
            </span>
          </span>
        );
      },
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      render: (v) => {
        if (!v) return '—';
        const diff = dayjs(v).diff(dayjs(), 'day');
        const color = diff < 0 ? COLOR.delayed : diff < 7 ? COLOR.inprogress : COLOR.completed;
        return <span style={{ color }}>{dayjs(v).format('DD MMM YYYY')}</span>;
      },
    },
  ];

  // ── Requirement status colors ─────────────────────────────────────────────
  const REQ_STATUS_COLOR = {
    submitted:           'orange',
    approved:            'green',
    rejected:            'red',
    enhancement_pending: 'blue',
    implemented:         'purple',
  };

  // ── Requirement detail table columns ─────────────────────────────────────
  const reqColumns = [
    {
      title: '#', key: 'serial', width: 50, align: 'center',
      render: (_, __, i) => <span style={{ color: '#888' }}>{i + 1}</span>,
    },
    {
      title: 'Sender', dataIndex: 'senderName', key: 'senderName', width: 160,
      ...getColumnSearchProps('senderName'),
    },
    {
      title: 'Service Provider', dataIndex: 'serviceProvider', key: 'sp', width: 160,
      ...getColumnSearchProps('serviceProvider'),
      render: (v) => v ? <Tag color="geekblue">{v}</Tag> : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 150,
      filters: [
        { text: 'Submitted',           value: 'submitted'           },
        { text: 'Approved',            value: 'approved'            },
        { text: 'Rejected',            value: 'rejected'            },
        { text: 'Enhancement Pending', value: 'enhancement_pending' },
        { text: 'Implemented',         value: 'implemented'         },
      ],
      onFilter: (val, r) => r.status === val,
      render: (v) => (
        <Tag color={REQ_STATUS_COLOR[v] || 'default'} style={{ textTransform: 'capitalize', fontWeight: 500 }}>
          {(v || '').replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Enhancement', dataIndex: 'isEnhancement', key: 'enh', width: 120,
      render: (v) => v ? <Tag color="cyan">Enhancement</Tag> : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Attachments', dataIndex: 'attachmentCount', key: 'attCount', width: 110, align: 'center',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Submitted At', dataIndex: 'submittedAt', key: 'submittedAt', width: 160,
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      render: (v) => v ? dayjs(v).format('DD MMM YYYY HH:mm') : '—',
    },
    {
      title: 'Approved At', dataIndex: 'approvedAt', key: 'approvedAt', width: 150,
      render: (v) => v ? dayjs(v).format('DD MMM YYYY') : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Rejected At', dataIndex: 'rejectedAt', key: 'rejectedAt', width: 150,
      render: (v) => v ? dayjs(v).format('DD MMM YYYY') : <span style={{ color: '#bbb' }}>—</span>,
    },
  ];

  // ── Requirement doughnut chart data ───────────────────────────────────────
  const reqDoughnutData = requirementSummary
    ? {
        labels: ['Approved', 'Submitted', 'Rejected', 'Enhancement Pending', 'Implemented'],
        datasets: [{
          data: [
            requirementSummary.approved,
            requirementSummary.submitted,
            requirementSummary.rejected,
            requirementSummary.enhancementPending,
            requirementSummary.implemented,
          ],
          backgroundColor: ['#52c41a', '#faad14', '#f5222d', '#1890ff', '#722ed1'],
          borderWidth: 2,
        }],
      }
    : null;

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PMS - Global Bank';
    workbook.created = new Date();

    // ── Sheet 1: Summary ─────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'General Project Report';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 30;

    summarySheet.mergeCells('A2:D2');
    summarySheet.getCell('A2').value = `Generated: ${dayjs().format('DD MMM YYYY HH:mm')}`;
    summarySheet.getCell('A2').font = { italic: true, color: { argb: 'FF888888' } };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };

    summarySheet.addRow([]);
    const sumHeader = summarySheet.addRow(['Metric', 'Value']);
    sumHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A2A' } };

    const kpis = [
      ['Total Projects',      summary?.totalProjects  ?? 0],
      ['Total Tasks',         summary?.totalTasks     ?? 0],
      ['Completed Tasks',     summary?.totalCompleted ?? 0],
      ['Delayed Tasks',       summary?.totalDelayed   ?? 0],
      ['In Progress Tasks',   summary?.totalInProgress ?? 0],
      ['Backlog Tasks',       summary?.totalBacklog   ?? 0],
      ['On-Time Rate',        `${summary?.onTimeRate ?? 0}%`],
      ['Completion Rate',     `${summary?.completionRate ?? 0}%`],
      ['Delay Rate',          `${summary?.delayRate ?? 0}%`],
      ['Planned Budget (ETB)',(summary?.totalBudget ?? 0).toLocaleString()],
      ['Actual Budget (ETB)', (summary?.totalActualBudget ?? 0).toLocaleString()],
      ['Budget Variance (ETB)',(summary?.budgetVariance ?? 0).toLocaleString()],
    ];
    kpis.forEach(([k, v], i) => {
      const row = summarySheet.addRow([k, v]);
      if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    });
    summarySheet.getColumn(1).width = 28;
    summarySheet.getColumn(2).width = 22;

    // ── Sheet 2: Project Breakdown ───────────────────────────────────────────
    const projSheet = workbook.addWorksheet('Project Breakdown');
    const projHeaders = projSheet.addRow([
      'Project', 'Status', 'Priority', 'Achievement %',
      'Completed', 'Delayed', 'In Progress', 'Backlog',
      'Planned Budget', 'Actual Budget', 'End Date',
    ]);
    projHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    projHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } };
    projHeaders.alignment = { horizontal: 'center' };

    projectBreakdowns.forEach((p, i) => {
      const row = projSheet.addRow([
        p.title,
        p.status,
        p.priority,
        p.achievement ?? 0,
        p.taskCounts.completed,
        p.taskCounts.delayed,
        p.taskCounts.inprogress,
        p.taskCounts.backlog,
        p.totalBudget ?? 0,
        p.actualBudget ?? 0,
        p.endDate ? dayjs(p.endDate).format('DD MMM YYYY') : '',
      ]);
      if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
      // Red for delayed projects
      if ((p.taskCounts.delayed || 0) > (p.taskCounts.completed || 0)) {
        row.getCell(2).font = { color: { argb: 'FFDC2626' }, bold: true };
      }
    });
    [28,12,10,14,12,12,14,10,18,18,16].forEach((w, i) => { projSheet.getColumn(i+1).width = w; });

    // ── Sheet 3: Task Details ────────────────────────────────────────────────
    const taskSheet = workbook.addWorksheet('Task Details');
    const taskHeaders = taskSheet.addRow([
      'Project', 'Task', 'Assigned To', 'Priority', 'Stage',
      'Status', 'On Time', 'Days Variance', 'Progress %',
      'Weight', 'Actual', 'Cost', 'Actual Cost',
      'Assigned Date', 'Submission Date',
    ]);
    taskHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    taskHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } };
    taskSheet.getRow(1).height = 22;

    filteredTasks.forEach((t, i) => {
      const pct = t.weight > 0 ? Math.min(100, Math.round((t.actual / t.weight) * 100)) : 0;
      const row = taskSheet.addRow([
        t.projectTitle,
        t.taskTitle,
        t.assignedTo?.name || '',
        t.priority,
        t.stage || '',
        t.classification,
        t.isOnTime == null ? '' : t.isOnTime ? 'Yes' : 'No',
        t.daysVariance ?? '',
        pct,
        t.weight,
        t.actual,
        t.cost ?? 0,
        t.actualCost ?? 0,
        t.assignedDate  ? dayjs(t.assignedDate).format('DD MMM YYYY')  : '',
        t.submissionDate? dayjs(t.submissionDate).format('DD MMM YYYY'): '',
      ]);
      if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
      // Highlight delayed rows red
      if (t.classification === 'delayed') {
        row.getCell(6).font = { color: { argb: 'FFDC2626' }, bold: true };
        row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F0' } }; });
      }
    });
    [20,25,20,10,14,14,10,14,12,10,10,14,14,16,16].forEach((w, i) => { taskSheet.getColumn(i+1).width = w; });

    // ── Sheet 4: Requirement Summary ─────────────────────────────────────────
    const reqSheet = workbook.addWorksheet('Requirement Summary');
    const reqSumHeaders = reqSheet.addRow(['Metric', 'Value']);
    reqSumHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    reqSumHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } };

    const reqKpis = [
      ['Total Requirements',       requirementSummary?.total              ?? 0],
      ['Submitted (Pending Review)',requirementSummary?.submitted          ?? 0],
      ['Approved',                 requirementSummary?.approved           ?? 0],
      ['Rejected',                 requirementSummary?.rejected           ?? 0],
      ['Enhancement Pending',      requirementSummary?.enhancementPending ?? 0],
      ['Implemented',              requirementSummary?.implemented        ?? 0],
      ['Approval Rate',            `${requirementSummary?.approvalRate    ?? 0}%`],
      ['Rejection Rate',           `${requirementSummary?.rejectionRate   ?? 0}%`],
      ['Templates Uploaded (Total)',requirementSummary?.templatesUploaded ?? 0],
      ['Global Templates',         requirementSummary?.globalTemplates    ?? 0],
      ['Provider-Specific Templates',requirementSummary?.specificTemplates ?? 0],
    ];
    reqKpis.forEach(([k, v], i) => {
      const row = reqSheet.addRow([k, v]);
      if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    });
    reqSheet.addRow([]);

    // Requirement detail rows
    const reqDetHeaders = reqSheet.addRow([
      'Sender', 'Service Provider', 'Status', 'Enhancement?', 'Attachments', 'Submitted At', 'Approved At', 'Rejected At',
    ]);
    reqDetHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    reqDetHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A2A' } };

    requirementDetails.forEach((r, i) => {
      const row = reqSheet.addRow([
        r.senderName,
        r.serviceProvider,
        (r.status || '').replace(/_/g, ' '),
        r.isEnhancement ? 'Yes' : 'No',
        r.attachmentCount,
        r.submittedAt ? dayjs(r.submittedAt).format('DD MMM YYYY HH:mm') : '',
        r.approvedAt  ? dayjs(r.approvedAt).format('DD MMM YYYY')  : '',
        r.rejectedAt  ? dayjs(r.rejectedAt).format('DD MMM YYYY')  : '',
      ]);
      if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
      if (r.status === 'rejected') {
        row.getCell(3).font = { color: { argb: 'FFDC2626' }, bold: true };
      }
      if (r.status === 'approved') {
        row.getCell(3).font = { color: { argb: 'FF16A34A' }, bold: true };
      }
    });
    [20, 22, 22, 14, 14, 22, 18, 18].forEach((w, i) => { reqSheet.getColumn(i + 1).width = w; });

    // ── Add borders to all sheets ────────────────────────────────────────────
    [summarySheet, projSheet, taskSheet, reqSheet].forEach((ws) => {
      ws.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top:    { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left:   { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right:  { style: 'thin', color: { argb: 'FFDDDDDD' } },
          };
        });
      });
    });

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `General-Report-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
  };

  // ── PDF Export — browser print (no extra library needed) ─────────────────
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    const now = dayjs().format('DD MMM YYYY HH:mm');

    const kpiRows = [
      ['Total Projects',       summary?.totalProjects  ?? 0],
      ['Total Tasks',          summary?.totalTasks     ?? 0],
      ['Completed Tasks',      `${summary?.totalCompleted ?? 0} (${summary?.completionRate ?? 0}%)`],
      ['Delayed Tasks',        `${summary?.totalDelayed ?? 0} (${summary?.delayRate ?? 0}%)`],
      ['In Progress Tasks',    summary?.totalInProgress ?? 0],
      ['On-Time Rate',         `${summary?.onTimeRate ?? 0}%`],
      ['Planned Budget (ETB)', (summary?.totalBudget ?? 0).toLocaleString()],
      ['Actual Budget (ETB)',  (summary?.totalActualBudget ?? 0).toLocaleString()],
      ['Budget Variance (ETB)',(summary?.budgetVariance ?? 0).toLocaleString()],
    ].map(([k,v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`).join('');

    const projRows = projectBreakdowns.map((p) => `
      <tr class="${(p.taskCounts.delayed||0) > (p.taskCounts.completed||0) ? 'delayed-row' : ''}">
        <td>${p.title}</td>
        <td>${p.status}</td>
        <td>${p.priority}</td>
        <td>${p.achievement ?? 0}%</td>
        <td style="color:#16a34a;font-weight:600">${p.taskCounts.completed}</td>
        <td style="color:#dc2626;font-weight:600">${p.taskCounts.delayed}</td>
        <td style="color:#d97706;font-weight:600">${p.taskCounts.inprogress}</td>
        <td>${(p.totalBudget??0).toLocaleString()}</td>
        <td>${(p.actualBudget??0).toLocaleString()}</td>
        <td>${p.endDate ? dayjs(p.endDate).format('DD MMM YYYY') : '—'}</td>
      </tr>`).join('');

    const taskRows = filteredTasks.map((t) => {
      const pct = t.weight > 0 ? Math.min(100, Math.round((t.actual / t.weight) * 100)) : 0;
      const isDelayed = t.classification === 'delayed';
      return `
      <tr class="${isDelayed ? 'delayed-row' : ''}">
        <td>${t.projectTitle || ''}</td>
        <td>${t.taskTitle || ''}</td>
        <td>${t.assignedTo?.name || '—'}</td>
        <td>${t.priority || ''}</td>
        <td>${t.stage || ''}</td>
        <td style="color:${isDelayed?'#dc2626':t.classification==='completed'?'#16a34a':'#d97706'};font-weight:600">
          ${t.classification}
        </td>
        <td>${t.isOnTime == null ? '—' : t.isOnTime ? '<span style="color:#16a34a">✓ Yes</span>' : '<span style="color:#dc2626">✗ No</span>'}</td>
        <td style="color:${(t.daysVariance??0)>0?'#dc2626':'#16a34a'}">
          ${t.daysVariance != null ? (t.daysVariance > 0 ? `+${t.daysVariance}d late` : t.daysVariance < 0 ? `${Math.abs(t.daysVariance)}d early` : 'On time') : '—'}
        </td>
        <td>${pct}%</td>
        <td>${t.submissionDate ? dayjs(t.submissionDate).format('DD MMM YYYY') : '—'}</td>
      </tr>`;
    }).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>General Project Report — ${now}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #222; padding: 20px; }
        .report-header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
        .report-header .logo { width:72px; height:auto; border-radius:4px; }
        h1 { background: #064e3b; color: #fff; padding: 12px 20px; font-size: 18px; margin:0; }
        .subtitle { color: #ccc; padding: 4px 0 0 0; font-size: 10px; margin-bottom: 20px; }
        h2 { color: #064e3b; font-size: 13px; margin: 20px 0 6px; border-bottom: 2px solid #064e3b; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #064e3b; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
        tr:nth-child(even) td { background: #f0fdf4; }
        .delayed-row td { background: #fff1f0 !important; }
        .summary-table { max-width: 420px; }
        .summary-table td:first-child { font-weight: 600; width: 55%; }
        @media print {
          body { padding: 10px; font-size: 10px; }
          h1 { font-size: 15px; }
          .no-print { display: none; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          h2 { page-break-before: auto; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head><body>
      <div class="report-header">
        <img class="logo" src="${logoIcon}" alt="Company Logo" onerror="this.style.display='none'" />
        <div>
          <h1>General Project Report</h1>
          <div class="subtitle">Generated: ${now} &nbsp;|&nbsp; Global Bank S.C. — PMS</div>
        </div>
      </div>

      <button class="no-print" onclick="window.print()"
        style="background:#064e3b;color:#fff;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-size:13px;margin-bottom:16px">
        🖨 Print / Save as PDF
      </button>

      <h2>Summary</h2>
      <table class="summary-table">
        <tbody>${kpiRows}</tbody>
      </table>

      <h2>Project Breakdown</h2>
      <table>
        <thead><tr>
          <th>Project</th><th>Status</th><th>Priority</th><th>Achievement</th>
          <th>Completed</th><th>Delayed</th><th>In Progress</th>
          <th>Planned Budget</th><th>Actual Budget</th><th>End Date</th>
        </tr></thead>
        <tbody>${projRows}</tbody>
      </table>

      <div class="page-break"></div>
      <h2>Task Details (${filteredTasks.length} tasks)</h2>
      <table>
        <thead><tr>
          <th>Project</th><th>Task</th><th>Assigned To</th><th>Priority</th>
          <th>Stage</th><th>Status</th><th>On Time</th><th>Variance</th>
          <th>Progress</th><th>Submission Date</th>
        </tr></thead>
        <tbody>${taskRows}</tbody>
      </table>

      <div class="page-break"></div>
      <h2>Requirement Summary</h2>
      <table class="summary-table">
        <tbody>
          ${[
            ['Total Requirements',        requirementSummary?.total              ?? 0],
            ['Submitted (Pending Review)', requirementSummary?.submitted          ?? 0],
            ['Approved',                  requirementSummary?.approved           ?? 0],
            ['Rejected',                  requirementSummary?.rejected           ?? 0],
            ['Enhancement Pending',       requirementSummary?.enhancementPending ?? 0],
            ['Implemented',               requirementSummary?.implemented        ?? 0],
            ['Approval Rate',             `${requirementSummary?.approvalRate    ?? 0}%`],
            ['Rejection Rate',            `${requirementSummary?.rejectionRate   ?? 0}%`],
            ['Templates Uploaded',        requirementSummary?.templatesUploaded  ?? 0],
            ['Global Templates',          requirementSummary?.globalTemplates    ?? 0],
            ['Provider-Specific Templates',requirementSummary?.specificTemplates ?? 0],
          ].map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`).join('')}
        </tbody>
      </table>

      <h2>Requirement Details (${requirementDetails.length})</h2>
      <table>
        <thead><tr>
          <th>#</th><th>Sender</th><th>Service Provider</th><th>Status</th>
          <th>Enhancement?</th><th>Attachments</th><th>Submitted At</th><th>Approved At</th><th>Rejected At</th>
        </tr></thead>
        <tbody>
          ${requirementDetails.map((r, i) => {
            const statusColor = { approved:'#16a34a', rejected:'#dc2626', submitted:'#d97706', enhancement_pending:'#1d4ed8', implemented:'#7c3aed' }[r.status] || '#555';
            return `<tr class="${r.status === 'rejected' ? 'delayed-row' : ''}">
              <td>${i + 1}</td>
              <td>${r.senderName || '—'}</td>
              <td>${r.serviceProvider || '—'}</td>
              <td style="color:${statusColor};font-weight:600">${(r.status || '').replace(/_/g, ' ')}</td>
              <td>${r.isEnhancement ? '✓' : '—'}</td>
              <td style="text-align:center">${r.attachmentCount}</td>
              <td>${r.submittedAt ? dayjs(r.submittedAt).format('DD MMM YYYY HH:mm') : '—'}</td>
              <td>${r.approvedAt  ? dayjs(r.approvedAt).format('DD MMM YYYY')  : '—'}</td>
              <td>${r.rejectedAt  ? dayjs(r.rejectedAt).format('DD MMM YYYY')  : '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </body></html>`);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 800);
  };


  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 16px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <img src={logoIcon} alt="Company Logo" style={{ width: 56, height: 'auto', borderRadius: 6 }} onError={(e)=>{e.target.style.display='none'}} />
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
          <ProjectOutlined style={{ marginRight: 8 }} />
          General Project Report
        </h2>
      </div>
      <p style={{ color: '#888', marginBottom: 16, fontSize: 13 }}>
        Comprehensive task analytics — on-time delivery, delays, progress, and budget variance.
      </p>

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <Card
        style={{ marginBottom: 20, borderRadius: 8 }}
        bodyStyle={{ padding: '14px 18px' }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Date Range (Project)</div>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(v) => setDateRange(v)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Project</div>
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="All Projects"
              value={projectId || undefined}
              onChange={(v) => setProjectId(v || '')}
              filterOption={(input, opt) =>
                String(opt.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {projectOptions.map((p) => (
                <Option key={p._id} value={p._id}>{p.title}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={8} md={3}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Project Status</div>
            <Select allowClear style={{ width: '100%' }} placeholder="Any" value={statusFilter || undefined} onChange={(v) => setStatusFilter(v || '')}>
              <Option value="pending">Pending</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={3}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Priority</div>
            <Select allowClear style={{ width: '100%' }} placeholder="Any" value={priorityFilter || undefined} onChange={(v) => setPriorityFilter(v || '')}>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={3}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Task Status</div>
            <Select allowClear style={{ width: '100%' }} placeholder="Any" value={classifFilter || undefined} onChange={(v) => setClassifFilter(v || '')}>
              <Option value="completed">Completed</Option>
              <Option value="delayed">Delayed</Option>
              <Option value="inprogress">In Progress</Option>
              <Option value="backlog">Backlog</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5} style={{ display: 'flex', gap: 8, paddingTop: 20 }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchAnalytics} loading={loading}>
              Search
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => {
              setDateRange(null); setProjectId(''); setStatusFilter('');
              setPriorityFilter(''); setClassifFilter(''); setProjectSearch('');
            }}>
              Reset
            </Button>
            <Dropdown
              disabled={filteredTasks.length === 0 && projectBreakdowns.length === 0}
              overlay={
                <AntMenu>
                  <AntMenu.Item key="excel" icon={<FileExcelOutlined style={{ color: '#22c55e' }} />} onClick={handleExportExcel}>
                    Export Excel (.xlsx)
                  </AntMenu.Item>
                  <AntMenu.Item key="pdf" icon={<FilePdfOutlined style={{ color: '#ef4444' }} />} onClick={handleExportPDF}>
                    Export PDF (.pdf)
                  </AntMenu.Item>
                </AntMenu>
              }
            >
              <Button icon={<DownloadOutlined />}>
                Export ▾
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Total Projects" value={summary?.totalProjects} color="#1890ff" icon={<ProjectOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Total Tasks" value={summary?.totalTasks} color="#1890ff" />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Completed" value={summary?.totalCompleted} color={COLOR.completed}
              icon={<CheckCircleOutlined />}
              sub={`${summary?.completionRate ?? 0}% of total`}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Delayed" value={summary?.totalDelayed} color={COLOR.delayed}
              icon={<WarningOutlined />}
              sub={`${summary?.delayRate ?? 0}% of total`}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="In Progress" value={summary?.totalInProgress} color={COLOR.inprogress}
              icon={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="On-Time Rate" value={summary?.onTimeRate} suffix="%" color={COLOR.ontime}
              sub={`${summary?.totalOnTime ?? 0} tasks on time`}
            />
          </Col>
        </Row>

        {/* ── Budget KPIs ─────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          <Col xs={12} md={8}>
            <KpiCard title="Total Planned Budget (ETB)" value={summary?.totalBudget?.toLocaleString()} color={COLOR.budget} />
          </Col>
          <Col xs={12} md={8}>
            <KpiCard title="Total Actual Budget (ETB)" value={summary?.totalActualBudget?.toLocaleString()} color={COLOR.budget} />
          </Col>
          <Col xs={12} md={8}>
            <KpiCard
              title="Budget Variance (ETB)"
              value={Math.abs(summary?.budgetVariance ?? 0).toLocaleString()}
              suffix={summary?.budgetVariance > 0 ? ' over' : summary?.budgetVariance < 0 ? ' under' : ''}
              color={summary?.budgetVariance > 0 ? COLOR.delayed : COLOR.completed}
              icon={summary?.budgetVariance > 0 ? <FallOutlined /> : <RiseOutlined />}
            />
          </Col>
        </Row>

        {/* ── Charts Row 1: Doughnut + On-Time Bar ────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={9}>
            <Card title="Task Stage Distribution" bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {doughnutData ? (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} style={{ maxHeight: 260 }} />
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={15}>
            <Card title="On-Time vs Delayed Breakdown" bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ height: 300 }}>
              {onTimeBarData ? (
                <Bar data={onTimeBarData} options={onTimeBarOptions} style={{ height: 260 }} />
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
        </Row>

        {/* ── Chart Row 2: Stacked per-project bar ────────────────────────── */}
        <Card title="Task Distribution per Project" bordered={false} style={{ borderRadius: 8, marginBottom: 20 }} bodyStyle={{ height: 340 }}>
          {barData ? (
            <Bar data={barData} options={barOptions} style={{ height: 300 }} />
          ) : (
            <Empty description="No project data" />
          )}
        </Card>

        {/* ── Chart Row 3: Monthly Trend Line ─────────────────────────────── */}
        <Card title="Monthly Task Trend" bordered={false} style={{ borderRadius: 8, marginBottom: 20 }} bodyStyle={{ height: 340 }}>
          {lineData ? (
            <Line data={lineData} options={lineOptions} style={{ height: 300 }} />
          ) : (
            <Empty description="No trend data" />
          )}
        </Card>

        <Divider orientation="left" style={{ fontWeight: 600 }}>Project Breakdown</Divider>

        {/* ── Project Breakdown Table ──────────────────────────────────────── */}
        <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
          <Table
            rowKey="projectId"
            columns={projectColumns}
            dataSource={projectBreakdowns}
            pagination={{ pageSize: 8, showSizeChanger: true }}
            scroll={{ x: 900 }}
            size="middle"
            locale={{ emptyText: <Empty description="No projects found" /> }}
          />
        </Card>

        <Divider orientation="left" style={{ fontWeight: 600 }}>
          Task Details &nbsp;
          <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
            ({filteredTasks.length} tasks)
          </span>
        </Divider>

        {/* ── Task Detail Table ────────────────────────────────────────────── */}
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Table
            rowKey="taskId"
            columns={taskColumns}
            dataSource={filteredTasks}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} tasks` }}
            scroll={{ x: 1400 }}
            size="small"
            locale={{ emptyText: <Empty description="No tasks found for the selected criteria" /> }}
            rowClassName={(r) => r.classification === 'delayed' ? 'ant-table-row-danger' : ''}
          />
        </Card>

        {/* ════════════════════════════════════════════════════════════════════
            REQUIREMENT WORKFLOW SECTION
        ════════════════════════════════════════════════════════════════════ */}
        <Divider orientation="left" style={{ fontWeight: 700, fontSize: 16, marginTop: 36, color: '#1a5c38' }}>
          📋 Requirement Workflow Summary
        </Divider>

        {/* ── Requirement KPI Cards ─────────────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Total Requirements" value={requirementSummary?.total}
              color="#1890ff" icon={<ProjectOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Submitted" value={requirementSummary?.submitted}
              color="#faad14" icon={<ClockCircleOutlined />}
              sub="Awaiting review" />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Approved" value={requirementSummary?.approved}
              color={COLOR.completed} icon={<CheckCircleOutlined />}
              sub={`${requirementSummary?.approvalRate ?? 0}% approval rate`} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Rejected" value={requirementSummary?.rejected}
              color={COLOR.delayed} icon={<WarningOutlined />}
              sub={`${requirementSummary?.rejectionRate ?? 0}% rejection rate`} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Enhancement Pending" value={requirementSummary?.enhancementPending}
              color={COLOR.backlog} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <KpiCard title="Templates Uploaded" value={requirementSummary?.templatesUploaded}
              color={COLOR.budget}
              sub={`${requirementSummary?.globalTemplates ?? 0} global · ${requirementSummary?.specificTemplates ?? 0} specific`} />
          </Col>
        </Row>

        {/* ── Requirement Doughnut + Details ────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={8}>
            <Card title="Requirement Status Distribution" bordered={false}
              style={{ borderRadius: 8, borderTop: '3px solid #1a5c38' }}
              bodyStyle={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {reqDoughnutData ? (
                <Doughnut
                  data={reqDoughnutData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }}
                  style={{ maxHeight: 260 }}
                />
              ) : (
                <Empty description="No requirement data" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Template Coverage" bordered={false}
              style={{ borderRadius: 8, borderTop: '3px solid #722ed1' }}
              bodyStyle={{ padding: '16px 20px' }}>
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <Card bordered={false} style={{ background: '#f9f0ff', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#722ed1' }}>
                      {requirementSummary?.templatesUploaded ?? 0}
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>Total Templates</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1a5c38' }}>
                      {requirementSummary?.specificTemplates ?? 0}
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>Provider-Specific</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ background: '#f0f0ff', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#722ed1' }}>
                      {requirementSummary?.globalTemplates ?? 0}
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>Global Templates</div>
                  </Card>
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Progress
                percent={
                  requirementSummary?.total > 0
                    ? Math.round((requirementSummary.approved / requirementSummary.total) * 100)
                    : 0
                }
                strokeColor={{ '0%': '#faad14', '100%': '#52c41a' }}
                format={(p) => `${p}% Approved`}
                style={{ marginBottom: 8 }}
              />
              <Progress
                percent={
                  requirementSummary?.total > 0
                    ? Math.round((requirementSummary.rejected / requirementSummary.total) * 100)
                    : 0
                }
                strokeColor="#f5222d"
                format={(p) => `${p}% Rejected`}
              />
            </Card>
          </Col>
        </Row>

        {/* ── Requirement Detail Table ──────────────────────────────────── */}
        <Divider orientation="left" style={{ fontWeight: 600 }}>
          Requirement Details &nbsp;
          <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
            ({requirementDetails.length} records)
          </span>
        </Divider>
        <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
          <Table
            rowKey="_id"
            columns={reqColumns}
            dataSource={requirementDetails}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} requirements` }}
            scroll={{ x: 1100 }}
            size="middle"
            rowClassName={(r) => r.status === 'rejected' ? 'ant-table-row-danger' : ''}
            locale={{ emptyText: <Empty description="No requirements found" /> }}
          />
        </Card>
      </Spin>
    </div>
  );
}
