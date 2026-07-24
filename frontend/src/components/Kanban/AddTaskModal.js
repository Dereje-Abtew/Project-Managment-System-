import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DatePicker, Row, Switch, Col, Select, InputNumber, Divider } from 'antd';

import moment from 'moment';

import { Form, Input, Modal } from 'antd';
import { API_BASE_URL } from '@/config/serverConfig';
import SecondaryAlert from '../SecondaryAlert/Index';

import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import {
  ASSIGNED_LABEL,
  BACKLOG_LABEL,
  COMPLETED_LABEL,
  DONE_LABEL,
  INPROGRESS_LABEL,
} from '@/constants/kanbanBoardCardLabels';
axios.defaults.baseURL = API_BASE_URL;
const { Option } = Select;

const AddTaskModal = ({
  isAddTaskModalOpen,
  setAddTaskModal,
  projectId = null,
  taskId = null,
  edit = false,
  onCreate,
  deliverables,
  tasks,
  members,
  qualityAssurances,
  leader,
  isWaterFall,
}) => {
  let deliverableData =
    deliverables !== undefined
      ? deliverables.map(({ _id: value, name: label }) => ({
          value,
          label,
        }))
      : [];
  let activeTasksData =
    tasks !== undefined ? tasks.filter((task) => task.assignedStatus === 'active') : [];

  let tasksData = activeTasksData.map(({ _id: value, title: label }) => ({
    value,
    label,
  }));

  const updatedMembersData =
    leader !== undefined && members !== undefined
      ? [
          ...new Set(
            [
              ...members.map(({ _id: value, firstName, lastName }) => ({
                value,
                label: `${firstName} ${lastName}`,
              })),
              {
                value: leader._id,
                label: `${leader.firstName} ${leader.lastName}`,
              },
            ].map(JSON.stringify)
          ),
        ].map(JSON.parse)
      : [];
  const updatedQualityAssuranceData =
    leader !== undefined && qualityAssurances !== undefined
      ? [
          ...qualityAssurances.map(({ _id: value, firstName, lastName }) => ({
            value,
            label: `${firstName} ${lastName}`,
          })),
          {
            value: leader._id,
            label: `${leader.firstName} ${leader.lastName}`,
          },
        ]
      : [];
  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [taskAssuranceId, setTaskAssuranceId] = useState();
  useEffect(() => {
    if (edit && isAddTaskModalOpen) {
      const task = tasks.find((task) => task._id === taskId);
      setTaskAssuranceId(task.assuredBy?._id);
      form.setFieldsValue({
        deliverable: task.deliverable,
        title: task.title,
        remark: task.remark,
        actual: task.actual,
        stage: task.stage,
        description: task.description,
        assignedTo: task.assignedTo?._id,
        assuredBy: task.assuredBy?._id,
        submissionDate: moment(task.submissionDate),
        assignedDate: moment(task.assignedDate),
        weight: task.weight,
        cost: task.cost,
        actualCost: task.actualCost,
        priority: task.priority || 'medium',
        dependOnTask: task.dependOnTask,
      });
    }
  }, [isAddTaskModalOpen]);
  const [isDependent, setIsDependent] = useState(false);

  const onChange = (checked) => {
    setIsDependent(checked);
  };
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  const handleDeliverableChange = (value) => {
    const deliverable = deliverables.find((item) => item._id === value);
    setSelectedDeliverable(deliverable);
  };

  const currentUser = useSelector(selectAuth);

  const isTaskAssurance = taskAssuranceId === currentUser.id;
  const statusOptions = [
    BACKLOG_LABEL,
    ASSIGNED_LABEL,
    INPROGRESS_LABEL,
    DONE_LABEL,
    ...(isTaskAssurance ? [COMPLETED_LABEL] : []),
  ];
  return (
    <>
      <Modal
        centered
        width="800px"
        className="modal-dialog-centered"
        visible={isAddTaskModalOpen}
        title={!edit ? <h1>Add Task</h1> : <h1>Edit Task</h1>}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setAddTaskModal(false)}
        onOk={() => {
          form
            .validateFields()
            .then(async (values) => {
              values = { ...values, edit: edit, taskId: taskId };
              const success = await onCreate(values);
              if (success) {
                form.resetFields();
                setAddTaskModal(false);
              }
            })
            .catch((error) => {});
        }}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Row>
            {!isWaterFall && (
              <>
                <Col span={24}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title of task!' }]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                </Col>

                {/* Assigned To — show on both create and edit */}
                <Col span={12}>
                  <Form.Item name="assignedTo" label="Assigned To">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a member"
                      optionFilterProp="children"
                      filterOption={filterOption}
                      options={updatedMembersData}
                    />
                  </Form.Item>
                </Col>

                {/* Assured By — show on both create and edit */}
                <Col span={12}>
                  <Form.Item style={{ width: '95%' }} name="assuredBy" label="Assured By">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a QA"
                      optionFilterProp="children"
                      filterOption={filterOption}
                      options={updatedQualityAssuranceData}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {isWaterFall && edit && (
              <>
                <Col span={24}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title of task!' }]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="assignedTo" label="Assigned To">
                    <Select
                      showSearch allowClear placeholder="Select a member"
                      optionFilterProp="children" filterOption={filterOption}
                      options={updatedMembersData}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item style={{ width: '95%' }} name="assuredBy" label="Assured By">
                    <Select
                      showSearch allowClear placeholder="Select a QA"
                      optionFilterProp="children" filterOption={filterOption}
                      options={updatedQualityAssuranceData}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {isWaterFall && !edit && (
              <>
                <Col span={24}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title of task!' }]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="assignedTo" label="Assigned To">
                    <Select
                      showSearch allowClear placeholder="Select a member"
                      optionFilterProp="children" filterOption={filterOption}
                      options={updatedMembersData}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item style={{ width: '95%' }} name="assuredBy" label="Assured By">
                    <Select
                      showSearch allowClear placeholder="Select a QA"
                      optionFilterProp="children" filterOption={filterOption}
                      options={updatedQualityAssuranceData}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {/* edit-only fields (actualCost, actual) handled below */}
            <Col span={24}>
              <Form.Item
                name="deliverable"
                label="Deliverable"
                rules={[
                  {
                    required: true,
                    message: 'Please select Deliverable?',
                  },
                ]}
              >
                <Select
                  showSearch
                  allowClear={true}
                  placeholder="Select a deliverable"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={deliverableData}
                  onChange={handleDeliverableChange}
                ></Select>
              </Form.Item>
            </Col>

            {selectedDeliverable && (
              <>
                <Col span={24} className="mb-4">
                  <SecondaryAlert message="Deliverable duration and weight will be displayed here." />
                </Col>

                <Col span={9}>
                  <p>
                    Start Date:
                    {' ' + moment(selectedDeliverable.startDate).format('MMMM Do YYYY, h:mm:ss a')}
                  </p>
                </Col>
                <Col span={9}>
                  <p>
                    End Date:
                    {' ' + moment(selectedDeliverable.endDate).format('MMMM Do YYYY, h:mm:ss a')}
                  </p>
                </Col>
                <Col span={6}>
                  <p>
                    Weight:
                    {selectedDeliverable.weight}
                  </p>
                </Col>
                <Divider dashed />
              </>
            )}

            <Col span={12}>
              <Form.Item
                style={{ width: '95%' }}
                name="assignedDate"
                label="Start Date"
                rules={[
                  {
                    required: true,
                    message: 'Please input the start date of task!',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Start Date" showTime />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="submissionDate"
                label="Submission Date"
                rules={[
                  {
                    required: true,
                    message: 'Submission date is required!',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Submission Date" showTime />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={{ width: '95%' }}
                name="cost"
                label="Cost"
                rules={[
                  {
                    required: true,
                    message: 'Task cost is required!',
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Cost" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Weight"
                rules={[
                  {
                    required: true,
                    message: 'Enter valid weight between 1 and 100!',
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Weight" />
              </Form.Item>
            </Col>

            {/* Priority — from CodeIgniter: Low / Medium / High */}
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                initialValue="medium"
                rules={[{ required: true, message: 'Please select task priority!' }]}
              >
                <Select placeholder="Select Priority">
                  <Option value="low">
                    <span style={{ color: '#22bb33' }}>● Low</span>
                  </Option>
                  <Option value="medium">
                    <span style={{ color: '#D4A917' }}>● Medium</span>
                  </Option>
                  <Option value="high">
                    <span style={{ color: '#dc3545' }}>● High</span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            {edit && (
              <>
                <Col span={12}>
                  <Form.Item
                    style={{ width: '95%' }}
                    name="actualCost"
                    label="Actual Cost"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the actual cost of task!',
                      },
                    ]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="Actual Cost" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="actual"
                    label="Actual Completed"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the actual Completed of task!',
                      },
                    ]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="Actual" />
                  </Form.Item>
                </Col>
              </>
            )}
            {isWaterFall && edit && (
              <Col span={24}>
                <Form.Item
                  name="stage"
                  label="Task Status"
                  rules={[
                    {
                      required: true,
                      message: 'Please select Task Status',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select a Status"
                    optionFilterProp="children"
                  >
                    {statusOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: 'Please input the description of task!',
                  },
                ]}
              >
                <TextArea placeholder="Description" />
              </Form.Item>
            </Col>
            {!edit && (
              <>
                <Col span={12}>
                  <div className="mb-5" style={{ width: '95%' }}>
                    <SecondaryAlert
                      message="Is dependent on another task?"
                      type="info"
                      showIcon
                      action={<Switch disabled={edit} onChange={onChange} />}
                    />
                  </div>
                </Col>

                {isDependent && (
                  <>
                    <Col span={12}>
                      <Form.Item
                        name="dependOnTask"
                        label="On which task it's depend on?"
                        rules={[
                          {
                            message: 'Please select Task?',
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          allowClear={true}
                          placeholder="Select a task"
                          optionFilterProp="children"
                          filterOption={filterOption}
                          options={tasksData}
                        ></Select>
                      </Form.Item>
                    </Col>
                  </>
                )}
              </>
            )}
            {edit && (
              <Col span={24}>
                <Form.Item name="remark" label="Remark">
                  <TextArea placeholder="Remark" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddTaskModal;
