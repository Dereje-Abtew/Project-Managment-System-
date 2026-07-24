import { Button, Result } from 'antd';
import { ErpLayout } from '@/layout';
import ReadRoleItem from './ReadRoleItem';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

export default function ReadRoleModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const history = useHistory();

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
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <ReadRoleItem config={config} selectedItem={currentResult} />
        ) : (
          <Result
            status="404"
            title="Role not found"
            subTitle="Sorry, the Role you requested does not exist."
            extra={
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${config.entity.toLowerCase()}`);
                }}
              >
                Back to Role Page
              </Button>
            }
          />
        )}
      </ErpLayout>
    );
}
