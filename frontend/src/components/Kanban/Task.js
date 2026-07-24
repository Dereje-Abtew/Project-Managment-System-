import history from '@/utils/history';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useParams } from 'react-router';
import { v4 as uuid } from 'uuid';

import {
  CheckCircleTwoTone,
  FileDoneOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  InfoCircleTwoTone,
  PauseCircleOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  UserOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  List,
  Popconfirm,
  Popover,
  Space,
} from 'antd';

import AddTaskModal from '@/components/Kanban/AddTaskModal';
import DropdownMenu from '@/components/Kanban/DropdownMenu';
import PageLoader from '@/components/PageLoader';

import IssueDrawer from '@/components/Kanban/Issues/IssueDrawer';
import ProjectDetailDrawer from '@/components/Kanban/ProjectDetailDrawer';
import { handleError, makeApiRequest } from '@/components/Kanban/request/apiRequest';
import { selectAuth } from '@/redux/auth/selectors';
import { Result, notification } from 'antd';
import { useSelector } from 'react-redux';
import AddMember from './AddMember';
import AddQualityAssurance from './AddQualityAssurance';
import TaskModal from './TaskModal';
import Waterfall from './Waterfall';

import { API_BASE_URL } from '@/config/serverConfig';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_DANGER_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import {
  ASSIGNED_LABEL,
  BACKLOG_LABEL,
  COMPLETED_LABEL,
  DONE_LABEL,
  INPROGRESS_LABEL,
} from '@/constants/kanbanBoardCardLabels';
import { request } from '@/request';
import isValidObjectId from '@/utils/helpers/isValidObjectId';
import axios from 'axios';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

const { Meta } = Card;

function Task() {
  document.title = 'Project Details - PMS';

  let { id } = useParams();
  const [projectNotFound, setProjectNotFound] = useState(false);

  const notFound = () => {
    return (
      <Result
        status="404"
        title="Project not found"
        subTitle="Sorry, the Project you requested does not exist."
        extra={
          <Button
            type="primary"
            onClick={() => {
              history.push(`/`);
            }}
          >
            Back to Home Page
          </Button>
        }
      />
    );
  }; // const decodedId = id.replace('_', '/');

  // const id = cryptoHelper.decrypt(id);

  const authState = useSelector(selectAuth);
  const currentUser = authState?.current || authState || {};
  // Normalize id — backend returns `id` on login, stored as `id` or `_id`
  const currentUserId = currentUser?.id || currentUser?._id;
  const [loading, setLoading] = useState(false);

  const [achievement, setAchievement] = useState(0);

  const onCreate = async (values) => {
    const requestData = {
      ...values,
      assignedBy: values.assignedTo,
    };
    let res;
    if (!values.edit) {
      res = await makeApiRequest(
        'post',
        `project/${id}/task`,
        requestData,
        'Task created successfully',
        'Failed to create task'
      );
      if (!res) return false;
      if (res.success) {
        const addedTask = res.result;
        setTasks((prev) => [...(prev || []), addedTask]);
        // Keep project.task in sync for weight calculations
        setProject((prev) =>
          prev ? { ...prev, task: [...(prev.task || []), addedTask] } : prev
        );
      }
    } else {
      res = await makeApiRequest(
        'put',
        `project/${id}/task/${values.taskId}`,
        requestData,
        'Task updated successfully',
        'Failed to update task'
      );
      if (!res) return false;
      if (res.success) {
        const updatedTask = res.result;
        setTasks((prev) =>
          (prev || []).map((task) => (task._id === updatedTask._id ? updatedTask : task))
        );
      }
    }
    return res.success;
  };

  const removeQualityAssurance = async (qualityAssuranceId) => {
    const res = await makeApiRequest(
      'delete',
      `project/${id}/qualityAssurance/${qualityAssuranceId}`,
      null,
      'Quality assurance removed successfully',
      'Failed to remove quality assurance'
    );
    if (res && res.success) {
      const QAIdToRemove = res.result._id; // Replace with the actual _id of the member to be removed

      const updatedProject = { ...project };
      const QAs = updatedProject.qualityAssurance;
      const updatedQAS = QAs.filter((QA) => QA._id !== QAIdToRemove);

      updatedProject.qualityAssurance = updatedQAS;
      setProject(updatedProject);
    }
    setOpen(false);
  };

  const removeMember = async (memberId) => {
    const res = await makeApiRequest(
      'delete',
      `project/${id}/member/${memberId}`,
      null,
      'Member removed successfully',
      'Failed to remove member'
    );
    if (res && res.success) {
      const memberIdToRemove = res.result._id; // Replace with the actual _id of the member to be removed

      const updatedProject = { ...project };
      const teamMembers = updatedProject.teamMember;
      const updatedTeamMembers = teamMembers.filter((member) => member._id !== memberIdToRemove);

      updatedProject.teamMember = updatedTeamMembers;
      setProject(updatedProject);
    }
    setOpen(false);
  };

  const onMemberCreate = async (values) => {
    const res = await makeApiRequest(
      'post',
      `project/${id}/member`,
      { teamMember: values.teamMember },
      'User added successfully',
      'Failed to add user'
    );
    if (res && res.success) {
      const addedMember = res.result;
      const updatedProject = { ...project };
      const teamMembers = updatedProject.teamMember;
      teamMembers.push(addedMember);
      updatedProject.teamMember = teamMembers;
      setProject(updatedProject);
      setAddMemberModal(false);
    }
    setOpen(false);
  };
  const updateTaskData = (data) => {
    axios
      .put(`project/${id}/todo`, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((taskRes) => {
        const taskData = taskRes.data;
        const newAchievement = taskData.achievement ?? achievement;
        setAchievement(newAchievement);

        // Auto-close notification when project reaches 100%
        if (newAchievement >= 100) {
          notification.success({
            message: 'Project Completed! 🎉',
            description: `All tasks are completed. The project "${project.title}" has been automatically closed.`,
            duration: 8,
          });
        }

        // Update the stage of the moved task in local state
        if (taskData._id) {
          setTasks((prev) =>
            (prev || []).map((task) =>
              task._id === taskData._id ? { ...task, stage: taskData.stage } : task
            )
          );
        }
      })
      .catch((error) => {
        handleError(error, 'Failed to save task order. Please try again.');
      });
  };

  const handleDelete = async (e, taskId) => {
    e.stopPropagation();
    const res = await makeApiRequest(
      'delete',
      `project/${id}/task/${taskId}`,
      null,
      'Task deleted successfully',
      'Failed to delete task'
    );
    if (res && res.success) {
      const removedId = res.result; // string taskId returned by backend
      setTasks((prev) => (prev || []).filter((task) => task._id !== removedId));
      // Also update project.task reference so weight calculations stay correct
      if (project) {
        setProject((prev) => ({
          ...prev,
          task: (prev.task || []).filter((t) => t._id !== removedId),
        }));
      }
    }
  };

  const onQualityAssuranceCreate = async (values) => {
    const res = await makeApiRequest(
      'post',
      `project/${id}/qualityAssurance`,
      { qualityAssurance: values.qualityAssurance },
      'Quality Assurance added successfully',
      'Failed to add Quality Assurance'
    );

    if (res && res.success) {
      const addedQA = res.result;
      const updatedProject = { ...project };
      const QAs = updatedProject.qualityAssurance;
      QAs.push(addedQA);
      updatedProject.qualityAssurance = QAs;
      setProject(updatedProject);
      setAddQualityAssuranceModal(false);
    }

    setOpen(false);
  };

  const allowBackwardDrag = (sourceColumnName, destColumnName) => {
    const allowedDestinations = {
      [COMPLETED_LABEL]: [],
      [DONE_LABEL]: [COMPLETED_LABEL],
      [INPROGRESS_LABEL]: [COMPLETED_LABEL, DONE_LABEL],
      [ASSIGNED_LABEL]: [COMPLETED_LABEL, DONE_LABEL, INPROGRESS_LABEL],
      [BACKLOG_LABEL]: [COMPLETED_LABEL, DONE_LABEL, INPROGRESS_LABEL, ASSIGNED_LABEL],
    };

    return allowedDestinations[sourceColumnName]?.includes(destColumnName) || false;
  };

  const isDependencyCompleted = (dependOnTaskId) => {
    let rootTask =
      tasks !== undefined ? tasks.find((task) => task._id === dependOnTaskId) : undefined;
    if (rootTask !== undefined) {
      if (rootTask.stage.toUpperCase() === COMPLETED_LABEL.toUpperCase()) {
        return true;
      }
    }
    return false;
  };

  const isUserRemoved = (assignedTo) => {
    let removedMember =
      project !== undefined
        ? project.removedTeamMember.find((member) => member._id === assignedTo._id)
        : undefined;
    if (removedMember !== undefined) {
      return true;
    }
    return false;
  };

  const isQualityAssuranceRemoved = (assuredBy) => {
    let removedAssurance =
      project !== undefined
        ? project.removedQualityAssurance.find((member) => member._id === assuredBy._id)
        : undefined;
    if (removedAssurance !== undefined) {
      return true;
    }
    return false;
  };

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    
    let data = {};
    let effectOnWeight = 'none';
    let weightToBeChanged = 0;
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      if (project && project.methodology === 'waterfall') {
        if (!allowBackwardDrag(sourceColumn.name, destColumn.name)) {
          notification.config({ duration: 10 });
          notification.info({
            message: `Dear User`,
            description: 'Tasks can not go backward in Waterfall methodology!',
          });
          return;
        }
      }

      if (sourceColumn.name === COMPLETED_LABEL) {
        if (currentUser && sourceColumn.items[source.index].assuredBy._id !== currentUserId) {
          notification.config({ duration: 10 });
          notification.info({
            message: `Dear User`,
            description: 'You are not assigned as a quality assurance for this Task.',
          });
          return;
        } else {
          weightToBeChanged = parseInt(sourceColumn.items[source.index].weight);
          effectOnWeight = 'minusFromExistingWeight';
        }
      }

      if (sourceColumn.items[source.index].dependOnTask) {
        if (!isDependencyCompleted(sourceColumn.items[source.index].dependOnTask)) {
          notification.config({ duration: 10 });
          notification.info({
            message: `Dear User`,
            description: 'This task is dependent on another task which is not completed yet!',
          });
          return;
        }
      }

      if (sourceColumn.items[source.index].assignedTo) {
        if (isUserRemoved(sourceColumn.items[source.index].assignedTo)) {
          notification.config({ duration: 10 });
          notification.info({
            message: `Dear User`,
            description: 'This task needs to be reassigned — the previous assigned user was removed!',
          });
          return;
        }
      } else {
        notification.config({ duration: 10 });
        notification.info({
          message: `Dear User`,
          description: 'This task is not assigned. Please assign a member for the task first.',
        });
        return;
      }

      if (destColumn.name === COMPLETED_LABEL) {
        if (!sourceColumn.items[source.index].assuredBy) {
          notification.config({ duration: 10 });
          notification.info({
            message: `Dear User`,
            description: 'This task has no Quality Assurance. Please assign first!',
          });
          return;
        } else {
          // Check QA identity first
          if (isQualityAssuranceRemoved(sourceColumn.items[source.index].assuredBy)) {
            notification.config({ duration: 10 });
            notification.info({
              message: `Dear User`,
              description: 'This task needs to be reassigned — the previous QA was removed!',
            });
            return;
          } else if (
            currentUser &&
            sourceColumn.items[source.index].assuredBy._id !== currentUserId
          ) {
            notification.config({ duration: 10 });
            notification.info({
              message: `Dear User`,
              description: 'You are not assigned to assure this Task.',
            });
            return;
          } else {
            // QA is valid. Auto-set actual = weight if not already set.
            // This mirrors the CodeIgniter behavior where QA dragging to Completed
            // confirms 100% completion without requiring the member to pre-fill actual.
            const taskItem = sourceColumn.items[source.index];
            const actualVal = parseInt(taskItem.actual) || 0;
            const weightVal = parseInt(taskItem.weight) || 0;

            if (actualVal !== weightVal) {
              // Auto-correct: update the task in local state so the API call will pass
              // The backend will receive actual === weight via the reorder payload
              sourceColumn.items[source.index] = { ...taskItem, actual: weightVal };
            }

            weightToBeChanged = weightVal;
            effectOnWeight = 'addToExistingWeight';
          }
        }
      }

      // ── Correct column state update: move item from source to dest ──
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      // API payload — only send {_id, stage} per column
      data = {
        [source.droppableId]: {
          name: sourceColumn.name,
          items: sourceItems.map(({ _id, stage }) => ({ _id, stage })),
        },
        [destination.droppableId]: {
          name: destColumn.name,
          items: destItems.map(({ _id, stage }) => ({ _id, stage })),
        },
        effectOnWeight,
        weightToBeChanged,
      };
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });

      data = {
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      };
    }

    updateTaskData(data);
  };

  const [isAddTaskModalOpen, setAddTaskModal] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModal] = useState(false);
  const [isAddQualityAssuranceModalOpen, setAddQualityAssuranceModal] = useState(false);
  const [open, setOpen] = useState(false);

  const [columns, setColumns] = useState({});
  const [deliverables, setDeliverables] = useState();
  const [tasks, setTasks] = useState();
  const [risks, setRisks] = useState();
  const [issues, setIssues] = useState();
  const [project, setProject] = useState('');

  useEffect(() => {
    tasks &&
      setColumns({
        [uuid()]: {
          name: BACKLOG_LABEL,
          items: tasks
            .filter((task) => task.stage === BACKLOG_LABEL)
            .sort((a, b) => {
              return a.order - b.order;
            }),
        },
        [uuid()]: {
          name: ASSIGNED_LABEL,
          items: tasks
            .filter((task) => task.stage === ASSIGNED_LABEL)
            .sort((a, b) => {
              return a.order - b.order;
            }),
        },
        [uuid()]: {
          name: INPROGRESS_LABEL,
          items: tasks
            .filter((task) => task.stage === INPROGRESS_LABEL)
            .sort((a, b) => {
              return a.order - b.order;
            }),
        },
        [uuid()]: {
          name: DONE_LABEL,
          items: tasks
            .filter((task) => task.stage === DONE_LABEL)
            .sort((a, b) => {
              return a.order - b.order;
            }),
        },
        [uuid()]: {
          name: COMPLETED_LABEL,
          items: tasks
            .filter((task) => task.stage === COMPLETED_LABEL)
            .sort((a, b) => {
              return a.order - b.order;
            }),
        },
      });
    if (project) {
      project.task = tasks;
    }
  }, [tasks]);

  useEffect(() => {
    setLoading(true);

    if (id && isValidObjectId(id)) {
      request
        .get({ entity: `/project/${id}` })
        .then((res) => {
          // res.data = res.data.result;
          setAchievement(res.result.achievement);
          setProject(res.result);
          setDeliverables(res.result.deliverables);
          setTasks(res.result.task);
          setRisks(res.result.risk);
          setIssues(res.result.issue);
          setLoading(false);
        })
        .catch((error) => {
          handleError(error, 'Something went wrong. Please try again!');
        });
    } else {
      setProjectNotFound(true);
    }
  }, [id]);

  const [isProjectDrawerVisible, setProjectDrawerVisible] = useState(false);
  const [isIssueDrawerVisible, setIssueDrawerVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState([]);

  const isTeamLeader = project?.teamLeader?._id === currentUserId;
  const isProjectManager = project?.projectManager?._id === currentUserId;

  if (projectNotFound) {
    return notFound();
  }

  if (loading) {
    return (
      <div className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen">
        <PageLoader />
      </div>
    );
  }
  return (
    <div className=" w-full  overflow-x-auto">
      <div className="flex items-center justify-between mb-6 ">
        <h1 className="text-xl text-gray-800 flex justify-start items-center space-x-2.5 min-w-[700px] w-full sm:w-1/2 md:w-1/3">
          <span style={{ minWidth: 'fit-content' }}>
            {project.title && project.title.slice(0, 25)}
            {project.title && project.title.length > 25 && '...'}
            <Badge
              style={{
                backgroundColor:
                  achievement > 80
                    ? COMPANY_SUCCESS_COLOR
                    : achievement > 20
                    ? COMPANY_BLUE_COLOR
                    : achievement <= 20
                    ? COMPANY_YELLOW_COLOR
                    : COMPANY_SECONDARY_COLOR,
                marginLeft: '10px',
                borderRadius: '5px',
              }}
              count={achievement + '%'}
            />
          </span>

          <Space>
            <Button
              type="primary"
              onClick={() => {
                setProjectDrawerVisible(true);
              }}
              icon={<InfoCircleOutlined />}
            >
              Details
            </Button>

            <Button
              type="primary"
              icon={<WarningOutlined />}
              onClick={() => {
                setIssueDrawerVisible(true);
              }}
            >
              Issues
            </Button>
            {(isTeamLeader || isProjectManager) && (
              <>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => {
                    history.push(`report/${project._id}`);
                  }}
                >
                  Export
                </Button>

                <Button
                  type="primary"
                  icon={<UnorderedListOutlined />}
                  onClick={() => setAddTaskModal(true)}
                  disabled={achievement === 100}
                >
                  Add Task
                </Button>
              </>
            )}
            <Avatar.Group shape="square">
              {project.teamMember &&
                project.teamMember.map((member, index) => (
                  <Popover
                    placement="bottomLeft"
                    title="About Member"
                    key={index}
                    content={
                      <Card
                        bordered={false}
                        style={{ width: 300 }}
                        actions={[
                          (isTeamLeader || isProjectManager) && (
                            <Popconfirm
                              style={{ color: 'red' }}
                              okText="Remove"
                              cancelText="Cancel"
                              placement="bottomLeft"
                              title="Are you sure you want to remove this user?"
                              onConfirm={() => removeMember(member._id)}
                            >
                              <UsergroupDeleteOutlined style={{ color: COMPANY_DANGER_COLOR }} />
                            </Popconfirm>
                          ),
                          <InfoCircleTwoTone twoToneColor={COMPANY_BLUE_COLOR} key="ellipsis" />,
                        ]}
                      >
                        <Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={`${member.firstName} ${member.lastName}`}
                          description={`@${member.jobTitle}`}
                        />
                      </Card>
                    }
                  >
                    <Avatar
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? COMPANY_YELLOW_COLOR : COMPANY_SECONDARY_COLOR,
                      }}
                    >
                      {member.firstName.slice(0, 1)}
                    </Avatar>
                  </Popover>
                ))}
              {(isTeamLeader || isProjectManager) && (
                <Avatar
                  icon={<UsergroupAddOutlined />}
                  onClick={() => setAddMemberModal(true)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: COMPANY_BLUE_COLOR,
                  }}
                ></Avatar>
              )}
            </Avatar.Group>

            <Divider type="vertical" />
            <Avatar.Group shape="square">
              {project.qualityAssurance &&
                project.qualityAssurance.map((member, index) => (
                  <Popover
                    key={index}
                    placement="bottomLeft"
                    title="About Quality Assurance"
                    content={
                      <Card
                        bordered={false}
                        style={{ width: 300 }}
                        actions={[
                          (isTeamLeader || isProjectManager) && (
                            <Popconfirm
                              style={{ color: 'red' }}
                              okText="Remove"
                              cancelText="Cancel"
                              placement="bottomLeft"
                              title="Are you sure you want to remove this Quality Assurance?"
                              onConfirm={() => removeQualityAssurance(member._id)}
                            >
                              <UsergroupDeleteOutlined style={{ color: COMPANY_DANGER_COLOR }} />
                            </Popconfirm>
                          ),

                          <InfoCircleTwoTone twoToneColor={COMPANY_BLUE_COLOR} key="ellipsis" />,
                        ]}
                      >
                        <Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={`${member.firstName} ${member.lastName} `}
                          description={`@${member.jobTitle}`}
                        />
                      </Card>
                    }
                  >
                    <Avatar
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? COMPANY_YELLOW_COLOR : COMPANY_SECONDARY_COLOR,
                      }}
                    >
                      {member.firstName.slice(0, 1)}
                    </Avatar>
                  </Popover>
                ))}

              {(isTeamLeader || isProjectManager) && (
                <Avatar
                  icon={<UserAddOutlined />}
                  onClick={() => setAddQualityAssuranceModal(true)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: COMPANY_BLUE_COLOR,
                  }}
                ></Avatar>
              )}
            </Avatar.Group>
            <Divider type="vertical" />
          </Space>
          <>
            <ProjectDetailDrawer
              project={project}
              isProjectDrawerVisible={isProjectDrawerVisible}
              setProjectDrawerVisible={setProjectDrawerVisible}
              deliverables={deliverables}
              tasks={tasks}
            ></ProjectDetailDrawer>
            <IssueDrawer
              project={project}
              setProject={setProject}
              isIssueDrawerVisible={isIssueDrawerVisible}
              setIssueDrawerVisible={setIssueDrawerVisible}
              risks={risks}
              tasks={tasks}
              issues={issues}
            ></IssueDrawer>
          </>
        </h1>
      </div>

      {project && project.methodology.toUpperCase() === 'WATERFALL' && (
        <Waterfall
          currentUser={currentUser}
          project={project && project}
          deliverables={project && project.deliverables}
          tasks={tasks}
          handleDelete={handleDelete}
          onCreate={onCreate}
          setOpen={setOpen}
          setCurrentTask={setCurrentTask}
        />
      )}
      {project && project.methodology.toUpperCase() === 'AGILE' && (
        <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
          <div className="flex ">
            {Object.entries(columns).map(([columnId, column]) => {
              return (
                <div
                  className={`h-580 ${
                    column.name.toUpperCase() === COMPLETED_LABEL.toUpperCase() ? '' : 'pr-4'
                  } min-w-max  w-full sm:w-1/2 md:w-1/3`}
                  key={columnId}
                >
                  <div className="pb-2.5 min-w-max w-full flex justify-between">
                    <div className="inline-flex items-center space-x-2 mr-4">
                      <h2 className=" text-[#1e293b] font-medium text-sm   leading-3">
                        {column.name}
                      </h2>
                      <span
                        className={`h-5 inline-flex   items-center justify-center px-2 mb-[2px] leading-none rounded-full text-xs font-semibold text-yellow-500 border border-yellow-300  `}
                      >
                        {column.items?.length < 1 ? '0' : column.items?.length}
                      </span>
                    </div>
                    {column.name.toUpperCase() === COMPLETED_LABEL.toUpperCase() && (
                      <CheckCircleTwoTone
                        twoToneColor={COMPANY_SUCCESS_COLOR}
                        size="large"
                        float="right"
                        style={{
                          float: 'right',
                          fontSize: '140%',
                        }}
                        className="mr-5"
                      />
                    )}

                    {column.name.toUpperCase() === DONE_LABEL.toUpperCase() && (
                      <FileDoneOutlined
                        size="large"
                        float="right"
                        style={{
                          color: COMPANY_BLUE_COLOR,
                          float: 'right',
                          fontSize: '140%',
                        }}
                        className="mr-5"
                      />
                    )}
                    {column.name.toUpperCase() === INPROGRESS_LABEL.toUpperCase() && (
                      <PauseCircleOutlined
                        size="large"
                        float="right"
                        style={{
                          color: COMPANY_BLUE_COLOR,
                          float: 'right',
                          fontSize: '140%',
                        }}
                        className="mr-5"
                      />
                    )}

                    {column.name.toUpperCase() === ASSIGNED_LABEL.toUpperCase() && (
                      <UserSwitchOutlined
                        size="large"
                        float="right"
                        style={{
                          color: COMPANY_YELLOW_COLOR,
                          float: 'right',
                          fontSize: '140%',
                        }}
                        className="mr-5"
                      />
                    )}

                    {column.name.toUpperCase() === BACKLOG_LABEL.toUpperCase() && (
                      <UnorderedListOutlined
                        size="large"
                        float="right"
                        style={{
                          color: COMPANY_SECONDARY_COLOR,
                          float: 'right',
                          fontSize: '140%',
                        }}
                        className="mr-5"
                      />
                    )}
                  </div>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <div
                          style={{
                            maxHeight: '580px',
                            overflowY: 'auto',
                          }}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`  overflow-x-hidden  pt-4 duration-75 transition-colors border-t-2 border-yellow-400 ${
                            snapshot.isDraggingOver && 'border-yellow-600'
                          }`}
                        >
                          {column.items.map((item, index) => {
                            return (
                              <Draggable
                                isDragDisabled={
                                  item.assignedTo?._id !== currentUserId &&
                                  project.teamLeader._id !== currentUserId &&
                                  project.projectManager._id !== currentUserId &&
                                  item.assuredBy?._id !== currentUserId
                                }
                                key={item._id}
                                draggableId={item._id}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{ ...provided.draggableProps.style }}
                                      className={`select-none px-3.5 pt-3.5 pb-2.5 mb-2 border min-w-max  rounded-md hover:border-blue-500 shadow-inner bg-white relative ${
                                        snapshot.isDragging && 'shadow-md'
                                      } ${
                                        new Date(item.submissionDate) < new Date() &&
                                        item.stage.toUpperCase() !==
                                          COMPLETED_LABEL.toUpperCase() &&
                                        'border-red-500'
                                      }
                                          ${
                                            item.stage.toUpperCase() ===
                                              COMPLETED_LABEL.toUpperCase() && 'border-green-500'
                                          }
                                         ${
                                           Math.ceil(
                                             (new Date(item.submissionDate) - new Date()) /
                                               (1000 * 60 * 60 * 24)
                                           ) >= 1 &&
                                           Math.ceil(
                                             (new Date(item.submissionDate) - new Date()) /
                                               (1000 * 60 * 60 * 24)
                                           ) <= 5 &&
                                           item.stage.toUpperCase() !==
                                             COMPLETED_LABEL.toUpperCase() &&
                                           ' border border-yellow-300'
                                         }`}
                                    >
                                      <div className="pb-0 ">
                                        <div className="flex item-center justify-between">
                                          <h3 className=" font-medium text-sm capitalize min-w-max w-full">
                                            {item.title.slice(0, 22)}
                                            {item.title.length > 22 && '. . .'}
                                          </h3>
                                          <Badge
                                            style={{
                                              backgroundColor:
                                                new Date(item.submissionDate) < new Date() &&
                                                item.stage.toUpperCase() !==
                                                  COMPLETED_LABEL.toUpperCase()
                                                  ? COMPANY_DANGER_COLOR
                                                  : item.stage.toUpperCase() ===
                                                      COMPLETED_LABEL.toUpperCase() ||
                                                    item.stage.toUpperCase() ===
                                                      DONE_LABEL.toUpperCase()
                                                  ? COMPANY_SUCCESS_COLOR
                                                  : item.stage.toUpperCase() ===
                                                    BACKLOG_LABEL.toUpperCase()
                                                  ? COMPANY_SECONDARY_COLOR
                                                  : item.stage.toUpperCase() ===
                                                    ASSIGNED_LABEL.toUpperCase()
                                                  ? COMPANY_YELLOW_COLOR
                                                  : COMPANY_BLUE_COLOR,
                                              marginRight: '5px',
                                              borderRadius: '5px',
                                            }}
                                            count={item.weight + '%'}
                                          />
                                          {item.stage.toUpperCase() ===
                                            COMPLETED_LABEL.toUpperCase() && (
                                            <>
                                              <Popover
                                                placement="bottomRight"
                                                content={
                                                  <Alert
                                                    style={{ paddingLeft: '10px' }}
                                                    message="Completed tasks are readonly."
                                                    type="success"
                                                    showIcon
                                                  />
                                                }
                                              >
                                                <CheckCircleTwoTone
                                                  twoToneColor={COMPANY_SUCCESS_COLOR}
                                                  float="right"
                                                  style={{
                                                    float: 'right',
                                                    fontSize: '150%',
                                                  }}
                                                />
                                              </Popover>
                                            </>
                                          )}
                                          {item.stage.toUpperCase() !==
                                            COMPLETED_LABEL.toUpperCase() && (
                                            <DropdownMenu
                                              isTaskOwner={
                                                item.assignedTo?._id === currentUserId ||
                                                project.teamLeader._id === currentUserId ||
                                                project.projectManager._id === currentUserId
                                              }
                                              taskId={item._id}
                                              handleDelete={handleDelete}
                                              projectId={id}
                                              onCreate={onCreate}
                                              item={item}
                                              deliverables={
                                                project !== undefined ? project.deliverables : []
                                              }
                                              tasks={project !== undefined ? project.task : []}
                                              members={
                                                project !== undefined ? project.teamMember : []
                                              }
                                              qualityAssurances={
                                                project !== undefined
                                                  ? project.qualityAssurance
                                                  : []
                                              }
                                              leader={
                                                project !== undefined
                                                  ? project.teamLeader
                                                  : undefined && project !== undefined
                                                  ? project.projectManager
                                                  : undefined
                                              }
                                              position={'right'}
                                            />
                                          )}
                                        </div>
                                        <p
                                          className={`  text-xs text-slate-500 py-2 leading-4 -tracking-tight `}
                                        >
                                          {item.description.slice(0, 40)}

                                          {item.description.length > 40 && '...'}
                                        </p>

                                        {/* Priority badge — from CodeIgniter */}
                                        <span
                                          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                                          style={{
                                            backgroundColor:
                                              item.priority === 'high'
                                                ? '#fff1f0'
                                                : item.priority === 'low'
                                                ? '#f6ffed'
                                                : '#fffbe6',
                                            color:
                                              item.priority === 'high'
                                                ? '#dc3545'
                                                : item.priority === 'low'
                                                ? '#22bb33'
                                                : '#D4A917',
                                            border: `1px solid ${
                                              item.priority === 'high'
                                                ? '#ffa39e'
                                                : item.priority === 'low'
                                                ? '#b7eb8f'
                                                : '#ffe58f'
                                            }`,
                                          }}
                                        >
                                          {item.priority
                                            ? item.priority.charAt(0).toUpperCase() +
                                              item.priority.slice(1)
                                            : 'Medium'}
                                        </span>

                                        <div className="flow-root">
                                          <span
                                            className="float-left"
                                            style={{ width: '200px', margin: '0' }}
                                          >
                                            <List itemLayout="horizontal">
                                              <List.Item style={{ padding: '0' }}>
                                                <List.Item.Meta
                                                  avatar={<UserOutlined />}
                                                  title={`${
                                                    item.assignedTo === ''
                                                      ? 'No assigned!'
                                                      : item.assignedTo === undefined
                                                      ? 'Not assigned!'
                                                      : `${item.assignedTo.firstName} ${item.assignedTo.lastName} `
                                                  }`}
                                                />
                                              </List.Item>
                                            </List>
                                          </span>

                                          <span className="float-right">
                                            <InfoCircleTwoTone
                                              onClick={() => {
                                                setOpen(true);
                                                setCurrentTask(item);
                                              }}
                                              twoToneColor={COMPANY_BLUE_COLOR}
                                              className="last mt-0"
                                              float="right"
                                              style={{
                                                float: 'right',
                                                fontSize: '140%',
                                              }}
                                            />
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      <AddTaskModal
        isAddTaskModalOpen={isAddTaskModalOpen}
        setAddTaskModal={setAddTaskModal}
        projectId={id}
        open={isAddTaskModalOpen}
        onCreate={onCreate}
        deliverables={project !== undefined ? project.deliverables : []}
        tasks={project !== undefined ? project.task : []}
        members={project !== undefined ? project.teamMember : []}
        qualityAssurances={project !== undefined ? project.qualityAssurance : []}
        leader={project !== undefined ? project.projectManager : undefined}
        isWaterFall={false}
      />
      <AddQualityAssurance
        isAddQualityAssuranceModalOpen={isAddQualityAssuranceModalOpen}
        setAddQualityAssuranceModal={setAddQualityAssuranceModal}
        projectId={id}
        open={isAddQualityAssuranceModalOpen}
        onQualityAssuranceCreate={onQualityAssuranceCreate}
      />
      <AddMember
        isAddMemberModalOpen={isAddMemberModalOpen}
        setAddMemberModal={setAddMemberModal}
        projectId={id}
        open={isAddMemberModalOpen}
        onMemberCreate={onMemberCreate}
      />

      <TaskModal
        open={open}
        currentTask={currentTask}
        projectId={id}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
  );
}

export default Task;
