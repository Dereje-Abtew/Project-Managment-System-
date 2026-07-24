import { makeApiRequest } from '@/components/Kanban/request/apiRequest';
import {
  CheckCircleOutlined,
  InfoCircleTwoTone,
  PauseCircleOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Col, Drawer, List, Progress, Row } from 'antd';
import { useState } from 'react';

import SecondaryAlert from '@/components/SecondaryAlert/Index';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_DANGER_COLOR,
  COMPANY_SUCCESS_COLOR,
} from '@/constants/companyConstants';
import { selectAuth } from '@/redux/auth/selectors';
import { getTwoColors } from '@/utils/helpers';
import { useSelector } from 'react-redux';
import AddIssueModal from './AddIssueModal';
import DropdownMenu from './DropdownMenu';
import IssueModal from './IssueModal';

function IssueDrawer({
  project,
  setProject,
  isIssueDrawerVisible,
  setIssueDrawerVisible,
  tasks,
  risks,
}) {
  const currentUser = useSelector(selectAuth);
  const [issue, setIssue] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAddIssueModalOpen, setAddIssueModal] = useState(false);

  const handleIssueDetails = (issue) => {
    setIssue(issue);
    setOpen(true);
  };
  const onCreate = async (values) => {
    const requestData = {
      ...values,
      registeredBy: currentUser.id,
    };
    let res;
    if (!values.edit) {
      res = await makeApiRequest(
        'post',
        `project/${project._id}/issue`,
        requestData,
        'Issue created successfully',
        'Failed to create issue'
      );
      if (res && res.success) {
        const modifiedIssue = res.result;
        const updatedProject = { ...project };
        const issues = updatedProject.issue;
        issues.push(modifiedIssue);
        updatedProject.issue = issues;
        setProject(updatedProject);
      }
    } else {
      res = await makeApiRequest(
        'put',
        `project/${project._id}/issue/${values.issueId}`,
        requestData,
        'Issue updated successfully',
        'Failed to update issue'
      );

      if (res && res.success) {
        const updatedIssue = res.result;
        const updatedIssueList = project.issue.map((issue) => {
          if (issue._id === updatedIssue._id) {
            return updatedIssue;
          }
          return issue;
        });
        const updatedProject = { ...project, issue: updatedIssueList };
        setProject(updatedProject);
      }
    }
  };
  const handleDelete = async (e, issueId) => {
    e.stopPropagation();
    const res = await makeApiRequest(
      'delete',
      `project/${project._id}/issue/${issueId}`,
      null,
      'Issue deleted successfully',
      'Failed to delete issue'
    );

    if (res && res.success) {
      if (res && res.success) {
        const issueIdToRemove = res.result._id; // Replace with the actual _id of the member to be removed

        const updatedProject = { ...project };
        const issues = updatedProject.issue;
        const updateIssues = issues.filter((issue) => issue._id !== issueIdToRemove);
        updatedProject.issue = updateIssues;
        setProject(updatedProject);
      }
    }
  };

  return (
    <Drawer
      width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
      title={
        <>
          <Row>
            <Col span={16}>
              {project.title}
              <Progress percent={project.achievement} strokeColor={getTwoColors()} />
            </Col>
            <Col span={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setAddIssueModal(true);
                }}
                type="primary"
              >
                Add Issue
              </Button>
            </Col>
          </Row>
        </>
      }
      placement="right"
      closable={true}
      visible={isIssueDrawerVisible}
      closeIcon={<RollbackOutlined />}
      onClose={() => {
        setIssueDrawerVisible(false);
      }}
    >
      <div className="mb-4">
        <SecondaryAlert message="The following are issues that were registered yet." />
      </div>

      <List itemLayout="horizontal">
        {project &&
          project.issue.map((issue, index) => (
            <List.Item
              extra={
                <div
                  style={{
                    position: 'absolute',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <DropdownMenu
                    isAddIssueModalOpen={isAddIssueModalOpen}
                    setAddIssueModal={setAddIssueModal}
                    risks={risks}
                    tasks={tasks}
                    handleDelete={handleDelete}
                    onCreate={onCreate}
                    isTaskOwner={issue.registeredBy?._id === currentUser.id}
                    issueId={issue._id}
                    issue={issue}
                    members={project !== undefined ? project.teamMember : []}
                    leader={
                      project !== undefined
                        ? project.teamLeader
                        : undefined || project !== undefined
                        ? project.projectManager
                        : undefined || project !== undefined
                        ? project.director
                        : undefined
                    }
                    style={{ zIndex: 1 }}
                  />
                  <InfoCircleTwoTone
                    twoToneColor={COMPANY_BLUE_COLOR}
                    style={{ fontSize: '140%', marginLeft: '10px' }}
                    onClick={() => handleIssueDetails(issue)}
                  />
                </div>
              }
              key={index}
              className="link-item-clickable"
              style={{ paddingLeft: '15px', paddingRight: '70px', position: 'relative' }}
            >
              <List.Item.Meta
                avatar={
                  issue.status.toLowerCase() === 'notsolved' ? (
                    <WarningOutlined style={{ fontSize: '140%', color: COMPANY_DANGER_COLOR }} />
                  ) : issue.status.toLowerCase() === 'solved' ? (
                    <CheckCircleOutlined
                      style={{ fontSize: '140%', color: COMPANY_SUCCESS_COLOR }}
                    />
                  ) : (
                    <PauseCircleOutlined style={{ fontSize: '140%', color: COMPANY_BLUE_COLOR }} />
                  )
                }
                title={issue.title}
                description={<span style={{ paddingRight: '60px' }}>{issue.description}</span>}
              />
            </List.Item>
          ))}
      </List>

      <AddIssueModal
        isAddIssueModalOpen={isAddIssueModalOpen}
        setAddIssueModal={setAddIssueModal}
        projectId={project._id}
        risks={risks}
        tasks={tasks}
        onCreate={onCreate}
        members={project !== undefined ? project.teamMember : []}
        leader={
          project !== undefined
            ? project.teamLeader
            : undefined || project !== undefined
            ? project.projectManager
            : undefined || project !== undefined
            ? project.director
            : undefined
        }
      />
      <IssueModal
        issue={issue}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </Drawer>
  );
}

export default IssueDrawer;
