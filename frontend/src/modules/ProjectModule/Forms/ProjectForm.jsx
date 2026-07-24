import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, Select, Descriptions, Row, Col, Divider } from 'antd';

import { PlusCircleOutlined } from '@ant-design/icons';
import { DatePicker } from '@/components/CustomAntd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import MultipleAutoCompleteAsync from '@/components/MultipleAutoCompleteAsync';
import DeliverableRow from '@/modules/ErpPanelModule/DeleverableRow';
import RiskRow from '@/modules/ErpPanelModule/RiskRow';
import { Collapse } from 'antd';
import SecondaryAlert from '@/components/SecondaryAlert/Index';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
const { Option } = Select;

const { Panel } = Collapse;

export default function ProjectForm({ current = null, form }) {
  const addRiskField = useRef(null);
  const addDeliverableField = useRef(null);
  const authState = useSelector(selectAuth) || {};
  const currentUser = authState.current || authState;
  const projectForm = form;

  // Compute the director and projectManager IDs from the logged-in user's auth state.
  // directorId / managerId are only populated for Professional/Manager positions (set in login.js).
  // For Directors, they ARE the director, so we fall back to currentUser.id.
  const resolvedDirectorId =
    authState.directorId ||
    currentUser.directorId ||
    (currentUser.position === 'Director' ? currentUser.id : undefined);

  const resolvedManagerId =
    authState.managerId ||
    currentUser.managerId ||
    (currentUser.position === 'Manager' ? currentUser.id : undefined);

  const displayDirectorEmail =
    currentUser.directorEmail ||
    (currentUser.position === 'Director' ? currentUser.email : 'Not assigned');
  const displayManagerEmail =
    currentUser.managerEmail ||
    (currentUser.position === 'Manager' ? currentUser.email : 'Not assigned');

  useEffect(() => {
    if (addDeliverableField.current && typeof addDeliverableField.current.click === 'function') {
      addDeliverableField.current.click();
    }
  }, []);

  // Keep the hidden director / projectManager fields in sync with the auth state.
  // initialValue alone is not enough because it is only read at form-mount time;
  // if currentUser arrives from Redux after mount the values stay undefined.
  useEffect(() => {
    if (current) return;
    if (!form) return;
    form.setFieldsValue({
      director: resolvedDirectorId,
      projectManager: resolvedManagerId,
    });
  }, [current, form, resolvedDirectorId, resolvedManagerId]);

  return (
    <>
      <Collapse accordion defaultActiveKey="1">
        <Panel header="Basic Details" key="1">
          <Row xs={{ span: 24 }} sm={{ span: 18 }}>
            <Col className="gutter-row" span={12}>
              <Descriptions labelStyle={{ fontSize: '17px' }} size="small">
                <Descriptions.Item label="Director" span="3">
                  <h3>{displayDirectorEmail || 'Not assigned'}</h3>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col className="gutter-row" span={12}>
              <Descriptions labelStyle={{ fontSize: '17px' }} size="small">
                <Descriptions.Item label="Project Manager" span="3">
                  <h3>{displayManagerEmail || 'Not assigned'}</h3>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Category!',
                  },
                ]}
              >
                <AutoCompleteAsync
                  entity={'category'}
                  displayLabels={['categoryName']}
                  searchFields={'categoryName'}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Title!',
                  },
                ]}
              >
                <Input placeholder="Title" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Description!',
                  },
                ]}
              >
                <Input placeholder="Description" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Project Number"
                name="projectNumber"
                rules={[
                  {
                    required: true,
                    message: 'Project Number is required.',
                  },
                ]}
              >
                <Input placeholder="Project Number" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Service Provider"
                name="ownerName"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Service Provider!',
                  },
                ]}
              >
                <AutoCompleteAsync
                  entity={'serviceprovider'}
                  displayLabels={['name']}
                  searchFields={'name'}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Owner Contact"
                name="ownerContact"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Owner Contact!',
                  },
                ]}
              >
                <Input placeholder="Owner Contact" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item
                name="director"
                label="Director"
                hidden
                initialValue={resolvedDirectorId}
              >
                <Input readOnly />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item
                name="projectManager"
                label="Project Manager"
                hidden
                initialValue={resolvedManagerId}
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="teamLeader"
                label="Team Leader"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Leader!',
                  },
                ]}
              >
                <AutoCompleteAsync
                  entity={'user'}
                  displayLabels={['email']}
                  searchFields={'email'}
                />
              </Form.Item>
            </Col>
            {!current && (
              <>
                <Col className="gutter-row" span={12}>
                  <Form.Item
                    name="teamMember"
                    label="Team Member"
                    rules={[
                      {
                        required: true,
                        message: 'Please input Project Member!',
                      },
                    ]}
                  >
                    <MultipleAutoCompleteAsync
                      entity={'user'}
                      displayLabels={['email']}
                      searchFields={'email'}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Methodology"
                name="methodology"
                rules={[
                  {
                    required: true,
                    message: 'Project Methodology is required.',
                  },
                ]}
                initialValue={'agile'}
              >
                <Select
                  options={[
                    { value: 'agile', label: 'Agile Methodology' },
                    { value: 'waterfall', label: 'Waterfall Methodology' },
                  ]}
                ></Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Total Budget"
                name="totalBudget"
                rules={[
                  {
                    required: true,
                    message: 'Project Total Budget is required.',
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Total Budget" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Status"
                name="status"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project status!',
                  },
                ]}
                initialValue={'onGoing'}
              >
                <Select
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'onGoing', label: 'Ongoing' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                ></Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[
                  {
                    required: true,
                    message: 'Please input Project Priority!',
                  },
                ]}
                initialValue={'normal'}
              >
                <Select
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'topUrgent', label: 'Top Urgent' },
                  ]}
                ></Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  {
                    required: true,
                    type: 'object',
                    message: 'Start date is required.',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} showTime />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[
                  {
                    required: true,
                    type: 'object',
                    message: 'End date is required.',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} showTime />
              </Form.Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <Divider dashed />
      <SecondaryAlert message="Fill Deliverable detail below bellow." />

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
      <Form.List name="deliverables">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <DeliverableRow
                key={field.key}
                remove={remove}
                field={field}
                current={current}
              ></DeliverableRow>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusCircleOutlined />}
                ref={addDeliverableField}
              >
                Add Deliverable
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <SecondaryAlert message="Fill Risk detail below bellow." />
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col className="gutter-row" span={6}>
          <p>Name</p>
        </Col>
        <Col className="gutter-row" span={8}>
          <p>Description</p>
        </Col>

        <Col className="gutter-row" span={4}>
          <p>Possibility</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>Impact</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>EMV</p>
        </Col>
      </Row>
      <Form.List name="risk">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <RiskRow
                key={field.key}
                remove={remove}
                field={field}
                current={current}
                projectForm={projectForm}
              ></RiskRow>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusCircleOutlined />}
                ref={addRiskField}
              >
                Add Risk
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}
