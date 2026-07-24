import React from 'react';
import { Collapse, Badge, Row, Col } from 'antd';
import moment from 'moment';
import { CaretRightOutlined } from '@ant-design/icons';
import { COMPANY_BLUE_COLOR } from '@/constants/companyConstants';
const { Panel } = Collapse;

function CollapsablePanel({ items }) {
  const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label">{title}:</p>
      {content}
    </div>
  );

  const getItems = () => {
    return items.map((item, index) => {
      return (
        <Panel
          key={index}
          header={item.name}
          className="link-item-clickable mb-5"
          extra={genExtra(item.weight)}
        >
          <Row className="mb-3">
            <Col span={24}>
              <DescriptionItem title="Description" content={<b>{item.description}</b>} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col span={12}>
              <DescriptionItem
                title="Start Date"
                content={<b>{moment(item.startDate).format('MMMM Do YYYY, h:mm:ss a')}</b>}
              />
            </Col>
            <Col span={12}>
              <DescriptionItem
                title="End Date"
                content={<b>{moment(item.endDate).format('MMMM Do YYYY, h:mm:ss a')}</b>}
              />
            </Col>
          </Row>
        </Panel>
      );
    });
  };

  const genExtra = (weight) => (
    <Badge
      style={{
        backgroundColor: COMPANY_BLUE_COLOR,
        marginLeft: '10px',
        borderRadius: '5px',
      }}
      count={weight + '%'}
    />
  );

  return (
    <>
      <Collapse
        style={{ backgroundColor: 'white' }}
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      >
        {getItems()}
      </Collapse>

      {/* 
         <Collapse expandIconPosition="right" ghost={true} bordered={false}>
       {items.map((item, index) => (
         <>
           <Panel
             extra={genExtra(item.weight)}
             className="link-item-clickable mb-5"
             header={<>{item.name}</>}
             key={index}
           ></Panel>
         </>
       ))}
     </Collapse> */}
    </>
  );
}

export default CollapsablePanel;
