import { Form, Input } from 'antd';

export default function UserProfileForm() {
  return (
    <>
      <Form.Item
        label="First Name"
        name="firstName"
        rules={[
          {
            required: true,
            message: 'Please input your First Name!',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="Last Name"
        name="lastName"
        rules={[
          {
            required: true,
            message: 'Please input your Last Name!',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item label="E-mail" name="email">
        <Input disabled />
      </Form.Item>
      <Form.Item label="Position" name="position">
        <Input disabled />
      </Form.Item>
      <Form.Item
        label="Job Title"
        name="jobTitle"
        rules={[
          {
            required: true,
            message: 'Please input your Job Title!',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="Phone"
        name="phone"
        rules={[
          {
            required: true,
            message: 'Please input your Phone number!',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
    </>
  );
}
