import React from 'react';
import { Avatar, Progress, Tooltip, Dropdown, Menu } from 'antd';
import {
  SettingFilled,
  BarsOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { erp } from '@/redux/erp/actions';
import { selectItemById } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { GetPermissions } from '@/utils/permissionsUtils';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';

dayjs.extend(relativeTime);

// CI brand colors
const BRAND_YELLOW = COMPANY_YELLOW_COLOR;
const BRAND_BLUE = COMPANY_BLUE_COLOR;

function initials(user) {
  if (!user) return '?';
  const f = user.firstName?.[0] || user.email?.[0] || '?';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase();
}

export default function ProjectGridCard({ project }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;
  const item = useSelector(selectItemById(project._id));
  const permissions = GetPermissions('project');

  const achievement = project.achievement ?? 0;

  // Days overdue / remaining
  const endDate = dayjs(project.endDate);
  const now = dayjs();
  const diffDays = endDate.diff(now, 'day');
  const isOverdue = diffDays < 0 && project.status !== 'closed';

  const members = [
    project.teamLeader,
    ...(Array.isArray(project.teamMember) ? project.teamMember : []),
  ].filter(Boolean);

  function handleView() {
    dispatch(erp.currentItem({ data: item || project }));
    history.push(`/project/read/${project._id}`);
  }

  function handleTasks() {
    dispatch(erp.currentItem({ data: item || project }));
    history.push(`/project/${project._id}`);
  }

  function handleEdit() {
    dispatch(erp.currentAction({ actionType: 'update', data: item || project }));
    history.push(`/project/update/${project._id}`);
  }

  function handleDelete() {
    dispatch(erp.currentAction({ actionType: 'delete', data: item || project }));
    modal.open();
  }

  const menu = (
    <Menu style={{ minWidth: 120, padding: 8, borderRadius: 8, fontSize: 15 }}>
      {permissions.includes('read') && (
        <Menu.Item key="details" onClick={handleView}>
          Details
        </Menu.Item>
      )}
      {permissions.includes('update') && (
        <Menu.Item key="edit" onClick={handleEdit}>
          Edit
        </Menu.Item>
      )}
      {permissions.includes('read') && (
        <Menu.Item key="tasks" onClick={handleTasks}>
          Tasks
        </Menu.Item>
      )}
      {permissions.includes('delete') && (
        <Menu.Item key="trash" onClick={handleDelete}>
          <span style={{ color: '#ff4d4f' }}>Trash</span>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div style={styles.card}>
      {/* Header stripe */}
      <div style={{ ...styles.stripe, background: COMPANY_BLUE_COLOR }} />

      {/* Body */}
      <div style={styles.body}>
        {/* Top row: Title + Settings */}
        <div style={styles.topRow}>
          <h3 style={styles.title} title={project.title}>
            {project.title}
          </h3>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <SettingFilled style={styles.gearIcon} />
          </Dropdown>
        </div>

        {/* Badges */}
        <div style={styles.badgeRow}>
          <span style={styles.ciBadge}>
            <BarsOutlined style={{ marginRight: 4 }} />
            {project.status === 'closed' ? 'Closed' : project.status === 'pending' ? 'Pending' : 'On Going'}
          </span>
          {isOverdue && (
            <span style={styles.ciBadge}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {Math.abs(diffDays)} Days Overdue
            </span>
          )}
          {!isOverdue && project.status !== 'closed' && diffDays >= 0 && (
            <span style={styles.ciBadge}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {diffDays} Days Left
            </span>
          )}
          {/* Task completion count — use `stage` field, not `status` */}
          <span style={styles.ciBadge}>
            <AppstoreOutlined style={{ marginRight: 4 }} />
            {project.task
              ? `${project.task.filter((t) => t.stage === 'Completed').length}/${project.task.length}`
              : '0/0'}{' '}
            Task Completed
          </span>
        </div>

        {/* Description */}
        <p style={styles.desc}>{project.description || `${project.title}...`}</p>

        {/* Team members */}
        <div style={styles.section}>
          <span style={styles.sectionLabel}>Team Members</span>
          <Avatar.Group maxCount={5} size={32}>
            {members.map((m, i) => (
              <Tooltip key={i} title={m.email || `${m.firstName} ${m.lastName}`}>
                <Avatar style={{ backgroundColor: BRAND_YELLOW, color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                  {initials(m)}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>

        {/* Progress */}
        <div style={styles.section}>
          <span style={styles.sectionLabel}>Progress</span>
          <Progress
            percent={achievement}
            strokeColor={achievement >= 100 ? '#22bb33' : '#2E8B3A'}
            trailColor="#f0f0f0"
            strokeWidth={10}
            format={(pct) => (
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{pct}%</span>
            )}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 6,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
    border: '1px solid #f0f0f0',
  },
  stripe: {
    height: 3,
    width: '100%',
  },
  body: {
    padding: '20px',
    flex: 1,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#1a1a2e',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  gearIcon: {
    color: BRAND_YELLOW,
    fontSize: 20,
    cursor: 'pointer',
    marginLeft: 12,
  },
  desc: {
    margin: '12px 0 20px',
    fontSize: 13,
    color: '#8c8c8c',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  badgeRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  ciBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 500,
    padding: '3px 12px',
    borderRadius: 20,
    background: COMPANY_BLUE_COLOR,
    color: '#fff',
  },
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: 500,
    marginBottom: 10,
    borderLeft: `4px solid ${COMPANY_YELLOW_COLOR}`,
    paddingLeft: 8,
  },
};

