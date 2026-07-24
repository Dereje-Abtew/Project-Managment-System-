import { Button, Descriptions, Result } from 'antd';
import { ErpLayout } from '@/layout';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import configPage from './config';

export default function UserRead() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const config = { ...configPage };

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [config.entity, dispatch, id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  if (!isSuccess || !currentResult) {
    return (
      <ErpLayout>
        <Result
          status="404"
          title="Team Member not found"
          subTitle="Sorry, the team member you requested does not exist."
          extra={
            <Button type="primary" onClick={() => history.push(`/${config.entity.toLowerCase()}`)}>
              Back to Team Member list
            </Button>
          }
        />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <Descriptions
        title={`${currentResult.firstName || ''} ${currentResult.lastName || ''}`}
        bordered
        column={1}
        size="middle"
      >
        <Descriptions.Item label="Email">{currentResult.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{currentResult.phone}</Descriptions.Item>
        <Descriptions.Item label="Role">{currentResult.role?.name || currentResult.role || '-'}</Descriptions.Item>
        <Descriptions.Item label="Position">{currentResult.position || '-'}</Descriptions.Item>
        <Descriptions.Item label="Chief">{currentResult.chief?.chiefName || currentResult.chief || '-'}</Descriptions.Item>
        <Descriptions.Item label="Department">{currentResult.department?.departmentName || currentResult.department || '-'}</Descriptions.Item>
        <Descriptions.Item label="Division">{currentResult.division?.divisionName || currentResult.division || '-'}</Descriptions.Item>
        <Descriptions.Item label="Job Title">{currentResult.jobTitle || '-'}</Descriptions.Item>
        <Descriptions.Item label="Status">{currentResult.enabled ? 'Enabled' : 'Disabled'}</Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: 22 }}>
        <Button type="primary" onClick={() => history.push(`/${config.entity.toLowerCase()}/update/${id}`)}>
          Edit Team Member
        </Button>
      </div>
    </ErpLayout>
  );
}
