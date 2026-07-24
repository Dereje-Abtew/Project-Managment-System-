import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { request } from '@/request';

const ReportForm = ({ isUpdateForm }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const formRef = React.useRef(null);

  const fetchProjectDetails = async (projectId) => {
    if (!projectId) return;
    try {
      const { result } = await request.read({ entity: 'project', id: projectId });
      if (result) {
        setProjectDetails(result);
        
        if (formRef.current) {
          const teamNames = result.teamMember ? result.teamMember.map(member => `${member.firstName || ''} ${member.lastName || ''}`.trim()).join(', ') : 'N/A';
          formRef.current.setFieldsValue({
            teams: teamNames || 'N/A',
            budget: result.totalBudget || 'N/A',
            startDate: result.startDate ? dayjs(result.startDate) : null,
            endDate: result.endDate ? dayjs(result.endDate) : null,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    }
  };

  return (
    <>
      <Form.Item name="projectName" label="Report Title" rules={[{ required: true, message: 'Please enter report title' }]}>
        <Input placeholder="Enter Report Title" />
      </Form.Item>

      <Form.Item name="project" label="Project" rules={[{ required: true, message: 'Please select a project' }]}>
        <AutoCompleteAsync
          entity={'project'}
          displayLabels={['title']}
          searchFields={'title'}
          onChange={(value) => fetchProjectDetails(value)}
        />
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {(form) => {
          formRef.current = form;
          return null;
        }}
      </Form.Item>

      <Form.Item name="description" label="Report Description" rules={[{ required: true, message: 'Please enter report description' }]}>
        <Input.TextArea rows={2} placeholder="Enter Report Description" />
      </Form.Item>

      <Form.Item name="teams" label="Teams">
        <Input.TextArea rows={4} readOnly />
      </Form.Item>

      <Form.Item name="budget" label="Budget">
        <Input prefix="$" readOnly />
      </Form.Item>

      <Form.Item 
        name="startDate" 
        label="Start Date"
        getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
      >
        <DatePicker style={{ width: '100%' }} disabled />
      </Form.Item>

      <Form.Item 
        name="endDate" 
        label="End Date"
        getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
      >
        <DatePicker style={{ width: '100%' }} disabled />
      </Form.Item>
    </>
  );
};

export default ReportForm;

