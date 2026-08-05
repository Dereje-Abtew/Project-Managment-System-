import React from 'react';
import { Avatar, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectItemById } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import { GetPermissions } from '@/utils/permissionsUtils';

// Brand colors
const BRAND_YELLOW = '#e6a817';
const BRAND_GREEN = '#2E8B3A';
const DARK_NAVY = '#1a2b4a';

function initials(user) {
  if (!user) return '?';
  const f = user.firstName?.[0] || user.email?.[0] || '?';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase();
}

export default function UserGridCard({ user, onEdit }) {
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { modal } = crudContextAction;

  const item = useSelector(selectItemById(user._id)) || user;
  const permissions = GetPermissions('user');

  function handleDelete() {
    dispatch(crud.currentAction({ actionType: 'delete', data: item }));
    modal.open();
  }

  function handleEdit() {
    dispatch(crud.currentAction({ actionType: 'update', data: item }));
    onEdit && onEdit();
  }

  // Count projects and tasks (data may not exist in list, default to 0)
  const projectCount = user.projectCount ?? 0;
  const taskCount = user.taskCount ?? 0;
  const isActive = user.enabled !== false;

  return (
    <div style={styles.card}>
      {/* Yellow top border */}
      <div style={styles.topBorder} />

      {/* Upper section: Avatar + Stats */}
      <div style={styles.upperSection}>
        {/* Avatar with edit button + active checkmark */}
        <div style={styles.avatarWrapper}>
          <Avatar size={90} style={styles.avatar}>
            {initials(user)}
          </Avatar>

          {/* ✅ Green checkmark overlay for active users (from CodeIgniter style) */}
          {isActive && (
            <div style={styles.activeCheckmark}>
              <CheckOutlined style={{ fontSize: 11, color: '#fff' }} />
            </div>
          )}

          {permissions.includes('update') && (
            <button style={styles.editBtn} onClick={handleEdit} title="Edit">
              <EditOutlined style={{ fontSize: 14, color: '#595959' }} />
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Projects</span>
            <span style={styles.statBadge}>{projectCount}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Tasks</span>
            <span style={styles.statBadge}>{taskCount}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Status</span>
            <span style={{ ...styles.statusBadge, background: isActive ? BRAND_GREEN : '#aaa' }}>
              {isActive && <CheckOutlined style={{ fontSize: 11, marginRight: 4 }} />}
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Yellow divider line */}
      <div style={styles.divider} />

      {/* Lower section: Info grid */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>Name</span>
          <span style={styles.infoValue}>{user.firstName} {user.lastName}</span>
        </div>
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>Email</span>
          <span style={styles.infoValue}>{user.email}</span>
        </div>
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>Mobile</span>
          <span style={styles.infoValue}>{user.phone || '—'}</span>
        </div>
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>Role</span>
          <span style={styles.infoValue}>{user.role?.name || '—'}</span>
        </div>
        {user.jobTitle && (
          <div style={{ ...styles.infoCell, borderBottom: 'none' }}>
            <span style={styles.infoLabel}>Job Title</span>
            <span style={styles.infoValue}>{user.jobTitle}</span>
          </div>
        )}
        {(user.departmentName || user.divisionName) && (
          <div style={{ ...styles.infoCell, borderBottom: 'none' }}>
            <span style={styles.infoLabel}>Department</span>
            <span style={styles.infoValue}>
              {[user.departmentName, user.divisionName].filter(Boolean).join(' / ')}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons row */}
      {(permissions.includes('delete')) && (
        <div style={styles.actionRow}>
          <Popconfirm
            title="Are you sure you want to remove this member?"
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <button style={styles.trashBtn}>
              <DeleteOutlined style={{ marginRight: 4 }} />
              Delete
            </button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #f0f0f0',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  topBorder: {
    height: 4,
    background: BRAND_YELLOW,
    width: '100%',
  },
  upperSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '20px 20px 12px',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    background: BRAND_YELLOW,
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 1,
  },
  editBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '1px solid #d9d9d9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: 0,
    background: '#fff',
  },
  // ✅ Green checkmark on top-left of avatar for active users (from CodeIgniter)
  activeCheckmark: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: BRAND_GREEN,
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 500,
  },
  statBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 34,
    height: 34,
    borderRadius: '50%',
    background: '#1a2b4a',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 16px',
    borderRadius: 20,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
  },
  divider: {
    height: 2,
    background: BRAND_YELLOW,
    margin: '0 20px',
    borderRadius: 2,
    opacity: 0.5,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
    padding: '0',
  },
  infoCell: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 20px',
    borderBottom: '1px solid #f5f5f5',
  },
  infoLabel: {
    fontSize: 11,
    color: BRAND_GREEN,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 20px',
    borderTop: '1px solid #f5f5f5',
    background: '#fafafa',
  },
  trashBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'transparent',
    border: '1px solid #ff4d4f',
    color: '#ff4d4f',
    borderRadius: 6,
    padding: '5px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
};
