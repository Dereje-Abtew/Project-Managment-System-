import { Button, Result } from 'antd';

import { ErpLayout } from '@/layout';
import UpdateDeliverable from '@/modules/ErpPanelModule/UpdateDeliverable';
import ProjectForm from '@/modules/ProjectModule/Forms/ProjectForm';

import PageLoader from '@/components/PageLoader';

import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { selectAuth } from '@/redux/auth/selectors';

export default function UpdateProjectModule({ config }) {
  const dispatch = useDispatch();

  const { id } = useParams();
  const history = useHistory();

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem) || {};

  const currentUser = useSelector(selectAuth) || {};
  const currentUserId = (currentUser.current?.id || currentUser.current?._id) ||
                        (currentUser.id || currentUser._id);
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
  } else if (
    currentUser &&
    currentResult &&
    currentResult.teamLeader?._id !== currentUserId &&
    currentResult.projectManager?._id !== currentUserId &&
    currentResult.director?._id !== currentUserId
  ) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button
            type="primary"
            onClick={() => {
              history.push(`/${config.entity.toLowerCase()}`);
            }}
          >
            Back to Projects
          </Button>
        }
      />
    );
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <UpdateDeliverable config={config} UpdateForm={ProjectForm} />
        ) : (
          <Result
            status="404"
            title="Project not found"
            subTitle="Sorry, the Project you requested does not exist."
            extra={
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${config.entity.toLowerCase()}`);
                }}
              >
                Back to Projects
              </Button>
            }
          />
        )}
      </ErpLayout>
    );
}
