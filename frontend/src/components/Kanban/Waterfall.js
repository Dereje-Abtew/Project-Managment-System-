import {
  AlignLeftOutlined,
  AreaChartOutlined,
  CalendarOutlined,
  InfoCircleTwoTone,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Badge, Space, Table, Tabs } from 'antd';
import moment from 'moment';
import { useCallback, useEffect } from 'react';

import DropdownMenu from './DropdownMenu';

import {
  COMPANY_BLUE_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import useColumnSearch from '@/hooks/useColumnSearch';
import { erp } from '@/redux/erp/actions';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch } from 'react-redux';
import Timelines from '../Timelines';

const localizer = momentLocalizer(moment);

const { TabPane } = Tabs;
const Waterfall = ({
  currentUser,
  deliverables,
  tasks,
  project,
  handleDelete,

  onCreate,
  setOpen,
  setCurrentTask,
}) => {
  const dispatch = useDispatch();
  const entity = 'project';
  const id = project._id;
  const handelDataTableLoad = useCallback(() => {
    dispatch(erp.read({ entity, id }));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    dispatch(erp.read({ entity, id }));

    return () => {
      controller.abort();
    };
  }, []);
  const getColumnSearchProps = useColumnSearch();

  tasks &&
    tasks.sort((a, b) => {
      return new Date(b.submissionDate) - new Date(a.submissionDate);
    });

  const formattedTasks =
    tasks &&
    tasks.map((task) => ({
      id: task._id?.toString(),
      title: task.title,
      start: new Date(task.assignedDate),
      end: new Date(task.submissionDate),
      resourceId: task._id,
      desc: task.description,
    }));

  const updatedTasks =
    tasks &&
    tasks.map((task) => ({
      ...task,
      dependOnTask: tasks.find((t) => t._id === task.dependOnTask)?.title || 'No task dependency',
      assignedToId: task.assignedTo?._id,
      assignedTo:
        task.assignedTo === undefined
          ? 'Not Assigned'
          : task.assignedTo.firstName + ' ' + task.assignedTo.lastName,
      assuredBy:
        task.assuredBy === undefined
          ? 'Not Assigned'
          : task.assuredBy.firstName + ' ' + task.assuredBy.lastName,
    }));

  const mergedData =
    updatedTasks &&
    deliverables.map((deliverable, index) => ({
      ...deliverable,
      tasks: updatedTasks.filter((task) => task.deliverable === deliverable._id),
      key: index,
    }));

  const expandedRowRender = (record) => {
    const excludedColumns = [
      '_id',
      'description',
      'created_at',
      'updated_at',
      'index',
      'order',
      'deliverable',
      'assignedStatus',
      'assuredBy',
      'assignedBy',
      'assignedToId',
      'assignedDate',
      'remark',
      'actual',
      'assignedTo',
      'weight',
      'dependOnTask',
      'actualCost',
      'cost',
    ];

    const keys = [];
    for (const obj of updatedTasks) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !excludedColumns.includes(key)) {
          keys.push(key);
        }
      }
    }

    const columns = []; //

    const assignedTo = {
      title: <span className="font-bold">Assigned To</span>,

      dataIndex: 'assignedTo',
      key: 'assignedTo',
      ...getColumnSearchProps('assignedTo'),
    };
    const assuredBy = {
      title: <span className="font-bold">Assured By</span>,

      dataIndex: 'assuredBy',
      key: 'assuredBy',
      ...getColumnSearchProps('assuredBy'),
    };

    const weight = {
      title: <span className="font-bold">Weight</span>,

      dataIndex: 'weight',
      key: 'weight',
      ...getColumnSearchProps('weight'),
    };

    const plannedWeight = {
      title: 'Planned',
      dataIndex: 'planned',
      key: 'planned',

      render: (text, record) => {
        const assignedDate = moment(record.assignedDate);
        const submissionDate = moment(record.submissionDate);

        const currentDate = moment();
        const totalDuration = Math.floor(submissionDate.diff(assignedDate) / (24 * 60 * 60 * 1000));
        const elapsedDuration = Math.floor(currentDate.diff(assignedDate) / (24 * 60 * 60 * 1000));
        const completedWeight =
          totalDuration > 0
            ? parseFloat(
                (
                  (Math.min(elapsedDuration, totalDuration) / totalDuration) *
                  record.weight
                ).toFixed(1)
              )
            : 0;

        const completionPercentage = parseFloat(
          ((completedWeight / record.weight) * 100).toFixed(1)
        );

        return (
          <span>
            <Badge
              style={{
                backgroundColor:
                  completionPercentage > 80
                    ? COMPANY_SUCCESS_COLOR
                    : completionPercentage > 20
                    ? COMPANY_BLUE_COLOR
                    : completionPercentage <= 20
                    ? COMPANY_YELLOW_COLOR
                    : COMPANY_SECONDARY_COLOR,
                marginLeft: '10px',
                borderRadius: '5px',
              }}
              count={completedWeight + ' ( ' + completionPercentage + '% )'}
            />
          </span>
        );
      },
    };

    const actualWeight = {
      title: <span className="font-bold">Actual</span>,

      dataIndex: 'actual',
      key: 'actualColumn',
      ...getColumnSearchProps('actual'),
    };

    const weightPerformance = {
      title: 'Performance',
      dataIndex: 'performance',
      key: 'performance',

      render: (text, record) => {
        const actual = record.actual;
        const weight = record.weight;

        const totalWeight = 100;

        const progressPercentage = parseFloat(((actual / weight) * totalWeight).toFixed(1));

        return (
          <span>
            <Badge
              style={{
                backgroundColor:
                  progressPercentage > 80
                    ? COMPANY_SUCCESS_COLOR
                    : progressPercentage > 20
                    ? COMPANY_BLUE_COLOR
                    : progressPercentage <= 20
                    ? COMPANY_YELLOW_COLOR
                    : COMPANY_SECONDARY_COLOR,
                marginLeft: '10px',
                borderRadius: '5px',
              }}
              count={progressPercentage + '%'}
            />
          </span>
        );
      },
    };

    const cost = {
      title: <span className="font-bold">Cost</span>,

      dataIndex: 'cost',
      key: 'cost',
      ...getColumnSearchProps('cost'),
    };

    const actualCost = {
      title: <span className="font-bold">Actual Cost</span>,

      dataIndex: 'actualCost',
      key: 'actualCost',
      ...getColumnSearchProps('actualCost'),
    };

    const plannedCost = {
      title: 'Planned Cost',
      dataIndex: 'plannedCost',
      key: 'plannedCost',

      render: (text, record) => {
        const assignedDate = moment(record.assignedDate);
        const submissionDate = moment(record.submissionDate);
        const currentDate = moment();
        const totalDuration = Math.floor(submissionDate.diff(assignedDate) / (24 * 60 * 60 * 1000));
        const elapsedDuration = Math.floor(currentDate.diff(assignedDate) / (24 * 60 * 60 * 1000));

        const completedCost =
          totalDuration > 0
            ? parseFloat(
                ((Math.min(elapsedDuration, totalDuration) / totalDuration) * record.cost).toFixed(
                  1
                )
              )
            : 0;
        const completionPercentage =
          record.cost > 0 ? parseFloat(((completedCost / record.cost) * 100).toFixed(1)) : 0;
        return (
          <span>
            <Badge
              style={{
                backgroundColor:
                  completionPercentage > 80
                    ? COMPANY_SUCCESS_COLOR
                    : completionPercentage > 20
                    ? COMPANY_BLUE_COLOR
                    : completionPercentage <= 20
                    ? COMPANY_YELLOW_COLOR
                    : COMPANY_SECONDARY_COLOR,
                marginLeft: '10px',
                borderRadius: '5px',
              }}
              count={completedCost + ' ( ' + completionPercentage + '% )'}
            />
          </span>
        );
      },
    };

    const costPerformance = {
      title: 'Cost Performance',
      dataIndex: 'costPerformance',
      key: 'costPerformance',

      render: (text, record) => {
        const costOutOf = 100;

        const progressPercentage =
          record.cost > 0
            ? parseFloat(((record.actualCost / record.cost) * costOutOf).toFixed(1))
            : 0;

        return (
          <span>
            <Badge
              style={{
                backgroundColor:
                  progressPercentage > 80
                    ? COMPANY_SUCCESS_COLOR
                    : progressPercentage > 20
                    ? COMPANY_BLUE_COLOR
                    : progressPercentage <= 20
                    ? COMPANY_YELLOW_COLOR
                    : COMPANY_SECONDARY_COLOR,
                marginLeft: '10px',
                borderRadius: '5px',
              }}
              count={progressPercentage + '%'}
            />
          </span>
        );
      },
    };
    const editColumn = {
      title: 'Action',
      dataIndex: 'operation',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <InfoCircleTwoTone
            onClick={() => {
              setOpen(true);
              setCurrentTask(record);
            }}
            twoToneColor={COMPANY_BLUE_COLOR}
            className="last mt-0"
            float="right"
            style={{ float: 'right', fontSize: '140%' }}
          />
          <DropdownMenu
            isTaskOwner={
              record.assignedToId === (currentUser?.id || currentUser?._id) ||
              project.teamLeader._id === (currentUser?.id || currentUser?._id) ||
              project.projectManager._id === (currentUser?.id || currentUser?._id) ||
              project.director?._id === (currentUser?.id || currentUser?._id)
            }
            taskId={record._id}
            handleDelete={handleDelete}
            projectId={project !== undefined ? project._id : undefined}
            onCreate={onCreate}
            item={record}
            deliverables={deliverables}
            tasks={tasks}
            members={project !== undefined ? project.teamMember : []}
            qualityAssurances={project !== undefined ? project.qualityAssurance : []}
            leader={
              project !== undefined
                ? project.teamLeader
                : undefined || project !== undefined
                ? project.projectManager
                : undefined || project !== undefined
                ? project.director
                : undefined
            }
            isWaterFall={true}
            position={'left'}
          />
        </Space>
      ),
    };

    const title = {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    };

    const subDate = {
      title: 'Submission Date',
      dataIndex: 'submissionDate',
      key: 'submissionDate',

      render: (text, record) => {
        return moment(text).format('MMMM Do YYYY');
      },
    };
    const stage = {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
    };
    columns.push(editColumn);
    columns.push(title);
    columns.push(subDate);
    columns.push(stage);

    columns.push(assignedTo);
    columns.push(assuredBy);
    columns.push(cost);
    columns.push(plannedCost);
    columns.push(actualCost);
    columns.push(costPerformance);
    columns.push(weight);
    columns.push(plannedWeight);
    columns.push(actualWeight);
    columns.push(weightPerformance);

    return (
      <>
        <Table
          // className=" w-full whitespace-nowrap overflow-x-scroll"
          columns={columns}
          dataSource={record.tasks}
          pagination={false}
          onChange={handelDataTableLoad}
        />
      </>
    );
  };

  const excludedColumns = ['_id', 'description'];

  const keys = [];
  for (const obj of deliverables) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !excludedColumns.includes(key)) {
        keys.push(key);
      }
    }
  }

  const uniqueKeys = Array.from(new Set(keys));
  const columns = uniqueKeys.map((key) => {
    return {
      title: (
        <span className="font-bold">
          {key.charAt(0).toUpperCase() + key.slice(1).replace(/(.)([A-Z])/g, '$1 $2')}
        </span>
      ),
      dataIndex: key,
      key: key,
      ...getColumnSearchProps(key),
      render: (text, record) => {
        if (key === 'startDate' || key === 'endDate') {
          return moment(text).format('MMMM Do YYYY');
        }
        return text;
      },
    };
  });
  let formattedGanttTasks = [];

  if (tasks !== null && tasks !== undefined) {
    formattedGanttTasks = tasks
      .filter((task) => task._id && new Date(task.assignedDate) < new Date(task.submissionDate))
      .map((task) => ({
        id: task._id.toString(),
        name: task.title,
        start: new Date(task.assignedDate),
        end: new Date(task.submissionDate),
        type: 'task',
        progress: task.weight > 0 ? Math.min(100, Math.round((task.actual / task.weight) * 100)) : 0,
        isDisabled: true,
        dependencies: task.dependOnTask ? [task.dependOnTask.toString()] : [],
        styles: {
          progressColor: COMPANY_BLUE_COLOR,
          progressSelectedColor: COMPANY_SUCCESS_COLOR,
        },
      }));
  }

  return (
    <Tabs defaultActiveKey="1">
      <TabPane
        tab={
          <span>
            <UnorderedListOutlined />
            List
          </span>
        }
        key="1"
      >
        <Table
          className="w-full overflow-x-scroll whitespace-nowrap"
          columns={columns}
          expandRowByClick={true} // Enable row expansion on click
          expandable={{
            expandedRowRender,
          }}
          dataSource={mergedData}
          onChange={handelDataTableLoad}
          size="middle"
        />
      </TabPane>

      <TabPane
        tab={
          <span>
            <CalendarOutlined />
            Calendar
          </span>
        }
        key="2"
      >
        <Calendar
          localizer={localizer}
          events={formattedTasks}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 700,
          }}
        />
      </TabPane>

      <TabPane
        tab={
          <span>
            <AreaChartOutlined />
            Gantt
          </span>
        }
        key="3"
      >
        {formattedGanttTasks.length > 0 && (
          <>
            <Gantt tasks={formattedGanttTasks} />
          </>
        )}
      </TabPane>
      <TabPane
        tab={
          <span>
            <AlignLeftOutlined />
            Timelines
          </span>
        }
        key="4"
      >
        <div className="m-5">
          <Timelines items={tasks} />
        </div>
      </TabPane>
    </Tabs>
  );
};
export default Waterfall;
