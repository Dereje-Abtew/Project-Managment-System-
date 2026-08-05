import dayjs from 'dayjs';
import { Tag } from 'antd';

import ProjectDataTableModule from '@/modules/ProjectModule/ProjectDataTableModule';
import configPage from './config';
import { CheckCircleOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Project() {
  const getColumnSearchProps = useColumnSearch();

  document.title = 'Project - PMS';

  const searchConfig = {
    displayLabels: ['title', 'Stakeholder'],
    searchFields: ['title', 'ownerName.name'],
  };
  const entityDisplayLabels = ['title'];
  const dataTableColumns = [
    {
      title: 'Category',
      dataIndex: ['category', 'categoryName'],
    },
    {
      title: <b>Title</b>,
      dataIndex: 'title',

      ...getColumnSearchProps('title'),
    },
    {
      title: <b>Stakeholder</b>,
      dataIndex: ['ownerName', 'name'],
      ...getColumnSearchProps(['ownerName', 'name']),
    },
    {
      title: <b>Owner Contact</b>,
      width: 160,

      dataIndex: 'ownerContact',
      ...getColumnSearchProps('ownerContact'),
    },
    {
      title: 'Project Manager',
      dataIndex: ['projectManager', 'email'],
    },
    {
      title: 'Team Leader',
      dataIndex: ['teamLeader', 'email'],
    },

    {
      title: <b>Start Date</b>,
      dataIndex: 'startDate',
      ...getColumnSearchProps('startDate'),
      render: (date) => {
        return dayjs(date).format('dddd, MMMM D, YYYY');
      },
    },
    {
      title: <b>End Date</b>,
      dataIndex: 'endDate',
      ...getColumnSearchProps('endDate'),
      render: (date) => {
        return dayjs(date).format('dddd, MMMM D, YYYY');
      },
    },

    {
      title: <b>Status</b>,
      dataIndex: 'status',

      ...getColumnSearchProps('status'),
      render: (status) => {
        const colorMap = {
          ongoing: [COMPANY_BLUE_COLOR, <PauseCircleOutlined />],
          pending: [COMPANY_YELLOW_COLOR, <PlayCircleOutlined />],
          other: [COMPANY_SUCCESS_COLOR, <CheckCircleOutlined />],
        };

        const [color, icon] = colorMap[status && status.toLowerCase()] || colorMap.other;

        return (
          <Tag color={color} icon={icon}>
            {status?.charAt(0).toUpperCase() + status?.slice(1).replace(/(.)([A-Z])/g, '$1 $2')}
          </Tag>
        );
      },
    },
  ];

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels,
  };
  return <ProjectDataTableModule config={config} />;
}
