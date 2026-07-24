import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';
import { useProfileContext } from '@/context/profileContext';
import { selectCurrentItem } from '@/redux/crud/selectors';
import history from '@/utils/history';
import uniqueId from '@/utils/uinqueId';
import { EditOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Descriptions, Divider, PageHeader, Row } from 'antd';
import { useSelector } from 'react-redux';

const UserInfo = ({ config }) => {
  const { profileContextAction } = useProfileContext();
  const { modal, updatePanel } = profileContextAction;
  const { ENTITY_NAME } = config;
  const { result } = useSelector(selectCurrentItem);

  const displayPosition = result?.position || '-';
  const displayJobTitle = result?.jobTitle || '-';
  const displayPhone = result?.phone || '-';

  // Chief name: use computed userChiefName from server, fallback to autopopulated chief.chiefName
  const displayChiefName =
    result?.userChiefName ||
    result?.chief?.chiefName ||
    result?.division?.department?.chief?.chiefName ||
    '-';

  // Department name: use autopopulated department, or via division → department
  const displayDepartmentName =
    result?.department?.departmentName ||
    result?.division?.department?.departmentName ||
    '-';

  // Division name: use autopopulated division
  const displayDivisionName = result?.division?.divisionName || '-';

  // Director name: computed by server for Professional/Manager; Director is themselves
  const displayDirectorName =
    result?.directorName ||
    (result?.position === 'Director'
      ? `${result?.firstName || ''} ${result?.lastName || ''}`.trim()
      : '-');

  // Manager name: computed by server for Professional; Manager is themselves
  const displayManagerName =
    result?.managerName ||
    (result?.position === 'Manager'
      ? `${result?.firstName || ''} ${result?.lastName || ''}`.trim()
      : '-');

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        title={ENTITY_NAME}
        ghost={false}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              updatePanel.open();
            }}
            type="primary"
            icon={<EditOutlined style={{ fontSize: COMPANY_ICONS_SIZE }} />}
          >
            Edit
          </Button>,
          <Button
            key={`${uniqueId()}`}
            icon={
              <LockOutlined style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }} />
            }
            onClick={() => {
              modal.open();
            }}
          >
            Change Password
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Row align="middle">
        <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 5 }}>
          <Avatar size={100} className="last  bg-blue-500" style={{ float: 'left' }}>
            {result?.firstName?.charAt(0)?.toUpperCase() || ''}
          </Avatar>
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 18 }}>
          <Descriptions labelStyle={{ fontSize: '17px' }} size="small">
            <Descriptions.Item label="First Name" span="3" style={{ paddingTop: '20px' }}>
              <h3>{result?.firstName || '-'}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Last Name" span="3">
              <h3>{result?.lastName || '-'}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Email" span="3">
              <h3>{result?.email || '-'}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Position" span="3">
              <h3>{displayPosition}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Job Title" span="3">
              <h3>{displayJobTitle}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Phone" span="3">
              <h3>{displayPhone}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Chief Name" span="3">
              <h3>{displayChiefName}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Department Name" span="3">
              <h3>{displayDepartmentName}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Division Name" span="3">
              <h3>{displayDivisionName}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Director" span="3">
              <h3>{displayDirectorName}</h3>
            </Descriptions.Item>
            <Descriptions.Item label="Manager" span="3">
              <h3>{displayManagerName}</h3>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <Divider />
      <Button
        key={`${uniqueId()}`}
        icon={<LogoutOutlined />}
        className="right"
        onClick={() => history.push('/logout')}
      >
        Sign Out
      </Button>
    </>
  );
};

export default UserInfo;
