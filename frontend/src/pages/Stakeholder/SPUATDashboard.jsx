import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Col, Divider, Input, Row, Space, Spin,
  Table, Tag, Typography, message, Select,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '@/request/request';
import { GetPermissions } from '@/utils/permissionsUtils';
import cryptoHelper from '@/utils/crypto';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';

const { Title, Text } = Typography;
const BRAND = '#1a5c38';

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusTag({ status }) {
  if (status === 'submitted')
    return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>check_circle</span>} color="success">Responded</Tag>;
  return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>pending</span>} color="warning">Pending</Tag>;
}

function getAuthUser() {
  const raw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  if (!raw) return null;
  try { return cryptoHelper.decrypt(raw) || JSON.parse(raw); } catch { return null; }
}

// ── PDF builder ───────────────────────────────────────────────────────────────
function buildPdfContent(uat) {
  const rows = (uat.features || []).map((f, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafb'}">
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${f.no}</td>
      <td style="padding:8px;border:1px solid #ddd">${f.feature}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${f.businessValidationConfirmed || '—'}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;color:${f.pass ? '#1a5c38' : f.fail ? '#ff4d4f' : '#000'};font-weight:600">${f.pass ? 'PASS' : f.fail ? 'FAIL' : '—'}</td>
      <td style="padding:8px;border:1px solid #ddd">${f.remark || '—'}</td>
    </tr>`).join('');
  const passCount = (uat.features || []).filter(f => f.pass).length;
  const total = (uat.features || []).length;
  const spName = uat.stakeholder ? `${uat.stakeholder.firstName || ''} ${uat.stakeholder.lastName || ''}`.trim() : '—';
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>UAT Report — ${uat.uatNumber}</title>
    <style>body{font-family:Arial,sans-serif;margin:30px;color:#222}
    h1{color:#1a5c38}table{width:100%;border-collapse:collapse}
    th{background:#1a5c38;color:#fff;padding:10px;border:1px solid #1a5c38}
    .s{background:#f0f7f4;padding:14px 18px;border-radius:6px;margin:20px 0;border-left:4px solid #1a5c38}
    </style></head><body>
    <h1>UAT Sign-Off Report</h1>
    <div class="s"><table style="width:100%;border:none">
      <tr><td style="border:none;padding:3px 0;width:50%"><b>UAT No:</b> ${uat.uatNumber || '—'}</td>
          <td style="border:none;padding:3px 0"><b>Project:</b> ${uat.project?.title || '—'}</td></tr>
      <tr><td style="border:none;padding:3px 0"><b>Sent By:</b> ${uat.sentBy || '—'}</td>
          <td style="border:none;padding:3px 0"><b>Date:</b> ${uat.date ? dayjs(uat.date).format('YYYY-MM-DD') : '—'}</td></tr>
      <tr><td style="border:none;padding:3px 0"><b>Stakeholder:</b> ${spName}</td>
          <td style="border:none;padding:3px 0"><b>Result:</b> <span style="color:${passCount === total ? '#1a5c38' : '#ff4d4f'};font-weight:700">${passCount}/${total} Pass</span></td></tr>
      <tr><td style="border:none;padding:3px 0"><b>Responded By:</b> ${uat.respondedBy || '—'}</td>
          <td style="border:none;padding:3px 0"><b>Responded At:</b> ${uat.respondedAt ? dayjs(uat.respondedAt).format('YYYY-MM-DD HH:mm') : '—'}</td></tr>
      ${uat.overallRemark ? `<tr><td colspan="2" style="border:none;padding:3px 0"><b>Overall Remark:</b> ${uat.overallRemark}</td></tr>` : ''}
    </table></div>
    <table><thead><tr>
      <th style="width:50px">No</th><th>Feature / Capability</th>
      <th style="width:130px">Business Validated</th>
      <th style="width:90px">Result</th><th style="width:200px">Remark</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <p style="margin-top:40px;font-size:12px;color:#888">Generated on ${dayjs().format('YYYY-MM-DD HH:mm')} by PMS — UAT Module</p>
    </body></html>`;
}

function printAsPdf(uat) {
  const win = window.open('', '_blank');
  if (!win) { message.error('Popup blocked — please allow popups.'); return; }
  win.document.write(buildPdfContent(uat));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function SPUATDashboard() {
  document.title = 'SP UAT Portal – PMS';

  // ── Permissions (same pattern as SendRequirement / ApproveRequirement) ────
  const uatPermissions = GetPermissions('sp uat portal');
  const canRespond     = uatPermissions.includes('update');

  // ── Logged-in user info ───────────────────────────────────────────────────
  const authUser = getAuthUser();
  const spName   = authUser
    ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim()
    : '';
  const isStakeholder = authUser?.position && /stakeholder/i.test(authUser.position);

  // ── State ─────────────────────────────────────────────────────────────────
  const [records,        setRecords]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [rowValues,      setRowValues]      = useState({});
  const [overallRemarks, setOverallRemarks] = useState({});
  const [submitLoading,  setSubmitLoading]  = useState({});
  const [filterSearch,   setFilterSearch]   = useState('');

  // ── Load — uses the standard request helper with the internal JWT ─────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get({ entity: 'sp-portal/uat' });
      const data = Array.isArray(res?.result?.records) ? res.result.records : [];
      setRecords(data);

      // Pre-fill any already-saved feature values
      const initRows    = {};
      const initRemarks = {};
      data.forEach(rec => {
        initRemarks[rec._id] = rec.overallRemark || '';
        (rec.features || []).forEach(f => {
          initRows[f._id] = { pass: f.pass || false, fail: f.fail || false, remark: f.remark || '' };
        });
      });
      setRowValues(initRows);
      setOverallRemarks(initRemarks);
    } catch {
      message.error('Failed to load UAT sign-offs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRow = (fId, key, val) =>
    setRowValues(prev => ({ ...prev, [fId]: { ...prev[fId], [key]: val } }));

  const pending   = records.filter(r => r.responseStatus !== 'submitted').length;
  const responded = records.filter(r => r.responseStatus === 'submitted').length;

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const q = filterSearch.toLowerCase();
    if (!q) return true;
    return (
      r.uatNumber?.toLowerCase().includes(q) ||
      r.sentBy?.toLowerCase().includes(q) ||
      r.project?.title?.toLowerCase().includes(q)
    );
  });

  // ── Respond to a UAT (same pattern as ApproveRequirement) ────────────────
  const handleRespond = async (record) => {
    if (!canRespond) { message.warning('You do not have permission to respond.'); return; }

    const features = (record.features || []).map(f => ({
      _id:    f._id,
      pass:   rowValues[f._id]?.pass  || false,
      fail:   rowValues[f._id]?.fail  || false,
      remark: rowValues[f._id]?.remark || '',
    }));

    if (!features.every(f => f.pass || f.fail)) {
      message.warning('Please mark every feature as Pass or Fail before saving.');
      return;
    }

    const missingRemark = features.find(f => f.fail && !f.remark.trim());
    if (missingRemark) { message.error('Add a remark for every failed feature.'); return; }

    setSubmitLoading(prev => ({ ...prev, [record._id]: true }));
    try {
      const overallRemark = overallRemarks[record._id] || '';
      const mergedUAT = {
        ...record,
        features: record.features.map(f => ({
          ...f,
          pass: rowValues[f._id]?.pass || false,
          fail: rowValues[f._id]?.fail || false,
          remark: rowValues[f._id]?.remark || f.remark || '',
        })),
        respondedBy: spName,
        respondedAt: new Date().toISOString(),
        overallRemark,
      };
      const pdfHtml   = buildPdfContent(mergedUAT);
      const pdfBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(pdfHtml)))}`;
      const pdfName   = `UAT_Report_${record.uatNumber}_${dayjs().format('YYYYMMDD')}.html`;

      const res = await request.patch({
        entity: `sp-portal/uat/${record._id}/respond`,
        jsonData: {
          respondedBy: spName,
          overallRemark,
          features,
          pdfReport: { name: pdfName, url: pdfBase64 },
        },
      });
      if (res?.success) { message.success('UAT response saved.'); load(); }
      else message.error(res?.message || 'Submission failed.');
    } catch { message.error('Submission failed.'); }
    finally { setSubmitLoading(prev => ({ ...prev, [record._id]: false })); }
  };

  // ── Render Expanded Row (Detail Table) ────────────────────────────────────
  const expandedRowRender = (record) => {
    const isPending = record.responseStatus !== 'submitted';
    
    const detailCols = [
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>NO.</span>, 
        dataIndex: 'no', 
        key: 'no', 
        width: 80, 
        align: 'center', 
        fixed: 'left',
        render: (t) => <b style={{ fontSize: 14 }}>{t}</b> 
      },
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>FEATURE / CAPABILITY</span>, 
        dataIndex: 'feature', 
        key: 'feature', 
        width: 300,
      },
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>BUSINESS VALIDATION CONFIRMED</span>, 
        dataIndex: 'businessValidationConfirmed', 
        key: 'bvc', 
        width: 300,
        render: (val) => <span style={{ fontSize: 13 }}>{val || '—'}</span>,
      },
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>PASS</span>, 
        key: 'pass', 
        width: 120, 
        align: 'center',
        render: (_, f) => {
          const pass = rowValues[f._id]?.pass || false;
          if (!isPending) {
            return pass ? (
              <span className="material-symbols-outlined" style={{ color: '#4caf50', verticalAlign: 'middle', fontSize: 20 }}>check_circle</span>
            ) : (
              <span style={{ color: '#ccc' }}>—</span>
            );
          }
          return (
            <Button
              type={pass ? 'primary' : 'default'}
              size="small"
              disabled={!canRespond}
              style={{ 
                background: pass ? '#1a5c38' : undefined, 
                borderColor: pass ? '#1a5c38' : undefined, 
                color: pass ? '#fff' : undefined,
                width: 70,
                fontSize: 12
              }}
              onClick={() => { 
                updateRow(f._id, 'pass', true); 
                updateRow(f._id, 'fail', false); 
              }}
            >
              {pass ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span> : 'Pass'}
            </Button>
          );
        }
      },
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>FAIL</span>, 
        key: 'fail', 
        width: 120, 
        align: 'center',
        render: (_, f) => {
          const fail = rowValues[f._id]?.fail || false;
          if (!isPending) {
            return fail ? (
              <span className="material-symbols-outlined" style={{ color: '#f44336', verticalAlign: 'middle', fontSize: 20 }}>cancel</span>
            ) : (
              <span style={{ color: '#ccc' }}>—</span>
            );
          }
          return (
            <Button
              danger={fail}
              type={fail ? 'primary' : 'default'}
              size="small"
              disabled={!canRespond}
              style={{ width: 70, fontSize: 12 }}
              onClick={() => { 
                updateRow(f._id, 'fail', true); 
                updateRow(f._id, 'pass', false); 
              }}
            >
              {fail ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span> : 'Fail'}
            </Button>
          );
        }
      },
      { 
        title: <span style={{ fontSize: 12, fontWeight: 600 }}>REMARKS</span>, 
        key: 'remark', 
        width: 400,
        render: (_, f) => {
          if (!isPending) {
            return <Text style={{ fontSize: 13 }}>{f.remark || '—'}</Text>;
          }
          return (
            <Input.TextArea
              rows={2}
              placeholder="Remark (required for 'Fail')"
              value={rowValues[f._id]?.remark || ''}
              disabled={!canRespond}
              onChange={(e) => updateRow(f._id, 'remark', e.target.value)}
              style={{ fontSize: 13 }}
            />
          );
        }
      },
    ];
    
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: `
          .uat-detail-scroll-${record._id}::-webkit-scrollbar {
            height: 14px;
          }
          .uat-detail-scroll-${record._id}::-webkit-scrollbar-track {
            background: #e8f5e9;
            border-radius: 7px;
          }
          .uat-detail-scroll-${record._id}::-webkit-scrollbar-thumb {
            background: #1a5c38;
            border-radius: 7px;
            border: 2px solid #e8f5e9;
          }
          .uat-detail-scroll-${record._id}::-webkit-scrollbar-thumb:hover {
            background: #15502f;
          }
        `}} />
        <div style={{ 
          margin: '10px 30px', 
          background: '#fff', 
          border: '1px solid #d9d9d9', 
          borderRadius: 8, 
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {/* Horizontal Scrollable Container for Detail Table */}
          <div 
            className={`uat-detail-scroll-${record._id}`}
            style={{ 
              overflowX: 'auto',
              width: '100%',
              marginBottom: 16
            }}
          >
            <Table
              columns={detailCols}
              dataSource={record.features || []}
              pagination={false}
              size="middle"
              rowKey="_id"
              bordered
              scroll={{ x: 1400 }}
              style={{ minWidth: 1400 }}
            />
          </div>
        
        {/* Overall Remark Section */}
        {isPending ? (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Text strong style={{ color: BRAND, fontSize: 14, display: 'block', marginBottom: 8 }}>
              Overall Remark (optional):
            </Text>
            <Input.TextArea
              rows={2}
              placeholder="Add your overall remarks about the UAT here…"
              value={overallRemarks[record._id] || ''}
              disabled={!canRespond}
              onChange={(e) => setOverallRemarks((prev) => ({ ...prev, [record._id]: e.target.value }))}
              style={{ marginBottom: 16 }}
            />
            <Space>
              {canRespond && (
                <Button
                  type="primary"
                  icon={<span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>send</span>}
                  onClick={() => handleRespond(record)}
                  loading={submitLoading[record._id]}
                  style={{ background: BRAND, borderColor: BRAND }}
                >
                  Submit Response
                </Button>
              )}
            </Space>
          </div>
        ) : (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            {record.overallRemark && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: BRAND }}>Overall Remark: </Text>
                <Text>{record.overallRemark}</Text>
              </div>
            )}
            <Space>
              <Button
                icon={<span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>print</span>}
                onClick={() => printAsPdf(record)}
                type="default"
              >
                Print / Save PDF
              </Button>
            </Space>
          </div>
        )}
        
        {/* Review History */}
        {(record.reviewHistory && record.reviewHistory.length > 0) && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: BRAND }}>Review History</Text>
            <div style={{ display: 'grid', gap: 8 }}>
              {record.reviewHistory.map((entry, index) => (
                <div key={`${entry.action}-${index}`} style={{ padding: 10, borderRadius: 8, background: '#f8fafb' }}>
                  <Text strong>{entry.action}</Text>
                  <div style={{ color: '#5f6368', fontSize: 12 }}>
                    {entry.note || 'No note provided'}
                  </div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    {entry.performedBy || 'System'} • {dayjs(entry.performedAt).format('MMM DD, YYYY HH:mm')} • {entry.statusBefore || '—'} → {entry.statusAfter || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </>
    );
  };

  // ── Main Table Columns ────────────────────────────────────────────────────
  const columns = [
    {
      title: <b>UAT NO</b>, 
      dataIndex: 'uatNumber', 
      key: 'uatNumber', 
      width: 120,
      render: (v) => <Tag color="geekblue">{v || '—'}</Tag>,
    },
    {
      title: <b>GLOBAL ADMIN</b>, 
      dataIndex: 'sentBy', 
      key: 'sentBy',
      width: 150,
    },
    {
      title: <b>PROJECT TITLE</b>, 
      key: 'project',
      render: (_, r) => <Text strong>{r.project?.title || '—'}</Text>,
    },
    {
      title: <b>DATE</b>, 
      key: 'date', 
      width: 130,
      render: (_, r) => r.date ? dayjs(r.date).format('MMM DD, YYYY') : '—',
    },
    {
      title: <b>STATUS</b>, 
      key: 'status', 
      width: 130,
      align: 'center',
      render: (_, r) => <StatusTag status={r.responseStatus} />,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 20, 
        padding: '16px 24px',
        background: '#fff', 
        borderRadius: 8, 
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <Space align="center" size="middle">
          <div style={{ 
            background: 'linear-gradient(135deg, #1a5c38 0%, #2e7d32 100%)', 
            padding: 14, 
            borderRadius: '50%', 
            display: 'flex', 
            boxShadow: '0 4px 12px rgba(26, 92, 56, 0.3)' 
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff' }}>
              task_alt
            </span>
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: 'Roboto', fontWeight: 600, color: '#202124' }}>
              UAT Portal — Stakeholder
            </Title>
            <Text type="secondary" style={{ fontSize: 14, letterSpacing: 0.2 }}>
              {isStakeholder 
                ? 'Review and respond to UAT sign-off requests assigned to you' 
                : 'View all UAT sign-off requests (Admin View)'}
            </Text>
          </div>
        </Space>
      </div>

      {/* ── Statistics Cards ────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${BRAND}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: BRAND, marginRight: 12 }}>
                pending_actions
              </span>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Pending Response</Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: BRAND }}>{pending}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #52c41a', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#52c41a', marginRight: 12 }}>
                check_circle
              </span>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Responded</Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#52c41a' }}>{responded}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#1890ff', marginRight: 12 }}>
                checklist
              </span>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Total UATs</Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1890ff' }}>{records.length}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Main UAT Table Card ──────────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Table Header with Search */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <Space align="center">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: BRAND }}>
              description
            </span>
            <Text strong style={{ fontSize: 16, color: BRAND }}>UAT Sign-Off Requests</Text>
            <Tag color={isStakeholder ? 'green' : 'blue'}>
              {isStakeholder ? 'My UATs Only' : 'All UATs (Admin)'}
            </Tag>
          </Space>
          <Space>
            <Input
              prefix={<span className="material-symbols-outlined" style={{ fontSize: 18, color: '#999' }}>search</span>}
              placeholder="Search UAT No, Project, Sender..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ width: 280, borderRadius: 20 }}
              allowClear
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={load} 
              loading={loading} 
              type="primary" 
              style={{ background: BRAND, borderColor: BRAND, borderRadius: 20 }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredRecords}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} records` }}
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <span 
                  className="material-symbols-outlined" 
                  onClick={e => onExpand(record, e)} 
                  style={{ 
                    color: '#5f6368', 
                    cursor: 'pointer', 
                    fontSize: 22, 
                    verticalAlign: 'middle', 
                    transition: 'all 0.2s' 
                  }}
                >
                  keyboard_arrow_down
                </span>
              ) : (
                <span 
                  className="material-symbols-outlined" 
                  onClick={e => onExpand(record, e)} 
                  style={{ 
                    color: '#5f6368', 
                    cursor: 'pointer', 
                    fontSize: 22, 
                    verticalAlign: 'middle', 
                    transition: 'all 0.2s' 
                  }}
                >
                  keyboard_arrow_right
                </span>
              ),
          }}
          rowClassName={(record, index) => {
            const isPending = record.responseStatus !== 'submitted';
            const baseClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
            return `${baseClass} ${isPending ? 'row-pending' : 'row-responded'}`;
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 80, color: '#ddd' }}>
                  inventory_2
                </span>
                <div style={{ marginTop: 16, fontSize: 16, color: '#999' }}>
                  {isStakeholder 
                    ? 'No UAT sign-offs assigned to you yet.' 
                    : 'No UAT sign-offs found.'}
                </div>
              </div>
            )
          }}
        />
      </Card>

      {/* Add custom CSS for row highlighting */}
      <style jsx="true">{`
        .row-pending {
          background-color: #fffbf0 !important;
        }
        .row-responded {
          background-color: #f6ffed !important;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
}
