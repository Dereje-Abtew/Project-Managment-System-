import { Button, Result } from 'antd';
import { ErpLayout } from '@/layout';
import PageLoader from '@/components/PageLoader';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import UserForm from '@/forms/UserForm';
import configPage from './config';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

export default function UserUpdate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const config = { ...configPage };

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [config.entity, dispatch, id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  useLayoutEffect(() => {
    if (currentResult) {
      dispatch(erp.currentAction({ actionType: 'update', data: currentResult }));
    }
  }, [currentResult, dispatch]);

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
      <UpdateItem config={config} UpdateForm={UserForm} />
    </ErpLayout>
  );
}
