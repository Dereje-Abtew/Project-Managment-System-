import { Col, DatePicker, Row, Select } from 'antd';
import { useEffect } from 'react';

import moment from 'moment';

import { Form, Input, Modal } from 'antd';

const AddIssueModal = ({
  isAddIssueModalOpen,
  setAddIssueModal,
  issueId = null,
  issue,
  edit = false,
  onCreate,
  tasks,
  risks,
  members,
  leader,
}) => {
  let tasksData = tasks.map(({ _id: value, title: label }) => ({
    value,
    label,
  }));
  let risksData = risks.map(({ _id: value, name: label }) => ({
    value,
    label,
  }));

  const updatedMembersData =
    leader !== undefined && members !== undefined
      ? [
          ...members.map(({ _id: value, firstName, lastName }) => ({
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
  useEffect(() => {
    if (edit && isAddIssueModalOpen) {
      form.setFieldsValue({
        title: issue.title,
        risk: issue.risk,
        task: issue.task,
        description: issue.description,
        status: issue.status,
        assignedTo: issue.assignedTo?._id,
        startDate: moment(issue.startDate),
        endDate: moment(issue.endDate),
      });
    }
  }, [isAddIssueModalOpen]);

  return (
    <>
      <Modal
        centered
        width="800px"
        className="modal-dialog-centered"
        visible={isAddIssueModalOpen}
        title={!edit ? <h1>Add Issue</h1> : <h1>Edit Issue</h1>}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setAddIssueModal(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              values = { ...values, edit: edit, issueId: issueId };
              onCreate(values);
              setAddIssueModal(false);
            })
            .catch((error) => {});
        }}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Row>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                style={{ width: '95%' }}
                rules={[
                  {
                    required: true,
                    message: 'Please input the title of issue!',
                  },
                ]}
              >
                <Input placeholder="Title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="Assigned To"
                rules={[
                  {
                    required: true,
                    message: 'For whom this issue will be assigned?',
                  },
                ]}
              >
                <Select
                  showSearch
                  allowClear={true}
                  placeholder="Select a member"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={updatedMembersData}
                ></Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  {
                    required: true,
                    message: 'Start date is required!',
                  },
                ]}
              >
                <DatePicker style={{ width: '95%' }} placeholder="Start Date" showTime />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[
                  {
                    required: true,
                    message: 'End date is required!',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="End Date" showTime />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="risk" label="On which risk it's depend on?" style={{ width: '95%' }}>
                <Select
                  showSearch
                  allowClear={true}
                  placeholder="Select a risk"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={risksData}
                ></Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="task"
                label="On which task it's depend on?"
                rules={[
                  {
                    required: true,
                    message: 'Please select task?',
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
            {!edit && (
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    {
                      required: true,
                      message: 'Please input the description of issue!',
                    },
                  ]}
                >
                  <TextArea rows={2} placeholder="Description" />
                </Form.Item>
              </Col>
            )}
            {edit && (
              <>
                <Col span={12}>
                  <Form.Item
                    style={{ width: '95%' }}
                    name="description"
                    label="Description"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the description of issue!',
                      },
                    ]}
                  >
                    <TextArea rows={2} placeholder="Description" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[
                      {
                        required: true,
                        message: 'Please select issue status!',
                      },
                    ]}
                    initialValue={'notsolved'}
                  >
                    <Select
                      options={[
                        { value: 'notsolved', label: 'Not Solved' },
                        { value: 'solved', label: 'Solved' },
                        { value: 'inprogress', label: 'In Progress' },
                      ]}
                    ></Select>
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddIssueModal;
