import React, { useState, useEffect } from 'react';
import { Divider, Progress } from 'antd';

import { Button, PageHeader, Row, Col, Descriptions, Tag } from 'antd';
import {
  EditOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';

import { useErpContext } from '@/context/erp';
import uniqueId from '@/utils/uinqueId';

import { selectCurrentItem } from '@/redux/erp/selectors';

import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import dayjs from 'dayjs';
import capitalizeFirstLetter from '@/utils/stringHelpers';
import SecondaryAlert from '@/components/SecondaryAlert/Index';
import { getTwoColors } from '@/utils/helpers';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_ICONS_SIZE,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';

const DeliverableItem = ({ item }) => {
  return (
    <Row gutter={[12, 0]} key={item._id}>
      <Col className="gutter-row" span={4}>
        <p>{item.name}</p>
      </Col>
      <Col className="gutter-row" span={6}>
        <p>
          {item.description.slice(0, 72)}
          {item.description.length > 72 && '...'}
        </p>
      </Col>
      <Col className="gutter-row" span={4}>
        <p>{dayjs(item.startDate).format('dddd, MMMM D, YYYY')}</p>
      </Col>
      <Col className="gutter-row" span={4}>
        <p>{dayjs(item.endDate).format('dddd, MMMM D, YYYY')}</p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p>{item.cost}</p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p>{item.weight}</p>
      </Col>
      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
    </Row>
  );
};

const RiskItem = ({ item }) => {
  return (
    <Row gutter={[12, 0]} key={item._id}>
      <Col className="gutter-row" span={6}>
        <p>{item.name}</p>
      </Col>
      <Col className="gutter-row" span={9}>
        <p>
          {item.description.slice(0, 72)}
          {item.description.length > 72 && '...'}
        </p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p>{item.possibility}</p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p>{item.impact}</p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p>{item.emv}</p>
      </Col>
      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
    </Row>
  );
};
export default function ReadProjectItem({ config, selectedItem }) {
  const { entity } = config;
  const dispatch = useDispatch();
  const { erpContextAction } = useErpContext();
  const history = useHistory();

  const { result: currentResult } = useSelector(selectCurrentItem);

  const { readPanel, updatePanel } = erpContextAction;

  const resetErp = {
    status: '',
    category: {
      categoryName: '',
    },
  };

  const [deliverableslist, setdeliverablesList] = useState([]);
  const [riskList, setRiskList] = useState([]);
  const [currentErp, setCurrentErp] = useState(selectedItem ?? resetErp);

  useEffect(() => {
    const controller = new AbortController();
    if (currentResult) {
      const { deliverables, risk } = currentResult;
      setCurrentErp(currentResult);

      if (risk) {
        setRiskList(risk);
      }
      if (deliverables) {
        setdeliverablesList(deliverables);
      }
    }
    return () => controller.abort();
  }, [currentResult]);

  const { status } = currentErp;

  const colorMap = {
    ongoing: [COMPANY_BLUE_COLOR, <PauseCircleOutlined />],
    pending: [COMPANY_YELLOW_COLOR, <PlayCircleOutlined />],
    other: [COMPANY_SUCCESS_COLOR, <CheckCircleOutlined />],
  };

  const [color, icon] = colorMap[status.toLowerCase()] || colorMap.other;

  return (
    <>
      <PageHeader
        onBack={() => {
          readPanel.close();
          history.goBack();
        }}
        title={`${currentErp.title} `}
        ghost={false}
        tags={
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace(/(.)([A-Z])/g, '$1 $2')}
          </Tag>
        }
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              readPanel.close();
              history.push(`/${entity.toLowerCase()}`);
            }}
            icon={
              <CloseCircleOutlined
                style={{
                  fontSize: COMPANY_ICONS_SIZE,
                }}
              />
            }
          >
            Close
          </Button>,

          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              updatePanel.open();
              history.push(`/${entity.toLowerCase()}/update/${currentErp._id}`);
            }}
            type="primary"
            icon={
              <EditOutlined
                style={{
                  fontSize: COMPANY_ICONS_SIZE,
                }}
              />
            }
          >
            Edit Project
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Divider dashed />
      <div className="mt-5 mb-5">
        <SecondaryAlert message="Project Basic Info" />
      </div>

      <Descriptions>
        <Descriptions.Item label="Project Category ">
          <strong>{currentErp.category.categoryName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Title ">
          <strong> {currentErp.title} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Description ">
          <strong> {currentErp.description} </strong>
        </Descriptions.Item>

        <Descriptions.Item label="Total Budget">
          <strong>{currentErp.totalBudget}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Actual Budget ">
          <strong> {currentErp.actualBudget} </strong>
        </Descriptions.Item>
        <Descriptions.Item label={`Achievement (${currentErp.achievement}%)`}>
          <Progress
            percent={currentErp.achievement}
            showInfo={false}
            strokeColor={getTwoColors()}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Methodology ">
          <strong> {currentErp.methodology} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Project Manager ">
          <strong>
            {currentErp.projectManager.firstName} {currentErp.projectManager.lastName}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Team Leader ">
          <strong>
            {currentErp.teamLeader.firstName} {currentErp.teamLeader.lastName}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Owner Contact ">
          <strong> {currentErp.ownerContact} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Owner Name ">
          <strong> {currentErp.ownerName} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Status ">
          <strong> {capitalizeFirstLetter(currentErp.status)} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Priority ">
          <strong> {capitalizeFirstLetter(currentErp.priority)} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Start Date ">
          <strong> {dayjs(currentErp.startDate).format('dddd, MMMM D, YYYY h:mm A	')}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="End Date ">
          <strong> {dayjs(currentErp.endDate).format('dddd, MMMM D, YYYY h:mm A	')}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Project No ">
          <strong> {capitalizeFirstLetter(currentErp.projectNumber)} </strong>
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-5 mb-5">
        <SecondaryAlert message="Project Deliverables listed below" />
      </div>

      <Divider dashed />

      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col className="gutter-row" span={4}>
          <p>Name</p>
        </Col>
        <Col className="gutter-row" span={6}>
          <p>Description</p>
        </Col>

        <Col className="gutter-row" span={4}>
          <p>Start Date</p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p>End Date</p>
        </Col>

        <Col className="gutter-row" span={3}>
          <p>Cost</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>Weight</p>
        </Col>
      </Row>
      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />

      {deliverableslist.map((item) => (
        <DeliverableItem key={item._id} item={item}></DeliverableItem>
      ))}

      <div className="mt-5 mb-5">
        <SecondaryAlert message="Project Risks listed below." />
      </div>
      <Divider />

      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col className="gutter-row" span={6}>
          <p>Name</p>
        </Col>
        <Col className="gutter-row" span={9}>
          <p>Description</p>
        </Col>

        <Col className="gutter-row" span={3}>
          <p>Possibility</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>Impact</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>EMV</p>
        </Col>
      </Row>
      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />

      {riskList.map((item) => (
        <RiskItem key={item._id} item={item}></RiskItem>
      ))}
    </>
  );
}
