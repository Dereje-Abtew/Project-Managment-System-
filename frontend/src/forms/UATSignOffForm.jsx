import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Upload, Button, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import { useDebounce } from 'react-use';

// ─── Base64 file uploader ─────────────────────────────────────────────────────
const Base64Upload = ({ value, onChange }) => {
  const [fileList, setFileList] = useState([]);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ name: file.name, url: e.target.result });
      setFileList([file]);
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <Upload
      beforeUpload={handleBeforeUpload}
      onRemove={() => { setFileList([]); onChange(null); }}
      fileList={fileList}
      maxCount={1}
    >
      <Button icon={<UploadOutlined />}>Select File</Button>
    </Upload>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────
const UATSignOffForm = ({ isUpdateForm = false }) => {
  const { current } = useSelector(selectAuth);
  const currentUserName = current ? `${current.firstName} ${current.lastName}` : '';

  // Access the form instance to set serviceProvider field programmatically
  const form = Form.useFormInstance();

  const [spDisplay, setSpDisplay] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const [valToSearch, setValToSearch]       = useState('');
  const [debouncedVal, setDebouncedVal]     = useState('');
  const [searching, setSearching]           = useState(false);

  const [, cancel] = useDebounce(() => setDebouncedVal(valToSearch), 500, [valToSearch]);
  const { onFetch, result, isSuccess } = useOnFetch();

  useEffect(() => {
    if (debouncedVal) {
      onFetch(() => request.search({ entity: 'project', options: { q: debouncedVal, fields: 'title' } }));
    }
    return () => cancel();
  }, [debouncedVal]);

  useEffect(() => {
    if (isSuccess && result) {
      setProjectOptions(result);
      setSearching(false);
    } else if (!isSuccess) {
      setProjectOptions([]);
      setSearching(false);
    }
  }, [isSuccess, result]);

  // When a project is selected, auto-fill the service provider from ownerName
  const handleProjectChange = (selectedId) => {
    const project = projectOptions.find((p) => p._id === selectedId);
    if (!project) return;

    const owner = project.ownerName; // autopopulated ServiceProvider object
    if (owner && owner._id) {
      // Set the hidden serviceProvider field to the SP's _id
      form.setFieldsValue({ serviceProvider: owner._id });
      setSpDisplay(`${owner.name}${owner.company ? ` — ${owner.company}` : ''}`);
    } else {
      form.setFieldsValue({ serviceProvider: undefined });
      setSpDisplay('');
    }
  };

  return (
    <>
      <Form.Item
        name="askedBy"
        label="UAT Asked By"
        initialValue={currentUserName}
        rules={[{ required: true, message: 'Please input who asked for UAT!' }]}
      >
        <Input readOnly />
      </Form.Item>

      <Form.Item
        name="date"
        label="Date"
        initialValue={moment()}
        rules={[{ required: true, message: 'Please select a date!' }]}
        getValueProps={(value) => ({ value: value ? moment(value) : null })}
      >
        <DatePicker style={{ width: '100%' }} disabled />
      </Form.Item>

      {/* Project selector — drives the SP auto-fill */}
      <Form.Item
        name="project"
        label="Project"
        rules={[{ required: true, message: 'Please select a project!' }]}
        extra="Selecting a project automatically fills the service provider."
      >
        <Select
          showSearch
          placeholder="Search project by title…"
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          notFoundContent={searching ? '… Searching' : 'Not Found'}
          onSearch={(q) => { if (q) { setSearching(true); setProjectOptions([]); setValToSearch(q); } }}
          onChange={handleProjectChange}
        >
          {projectOptions.map((p) => (
            <Select.Option key={p._id} value={p._id}>{p.title}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Hidden field — stores the SP _id set programmatically */}
      <Form.Item name="serviceProvider" hidden rules={[{ required: true, message: 'Service provider is required. Please select a project that has a service provider assigned.' }]}>
        <Input />
      </Form.Item>

      {/* Read-only display of the auto-filled SP */}
      <Form.Item label="Service Provider (auto-filled from project)">
        <Input
          value={spDisplay || 'Will fill automatically when you select a project'}
          readOnly
          style={{
            background: '#f5f5f5',
            cursor: 'default',
            color: spDisplay ? '#1a5c38' : '#aaa',
            fontWeight: spDisplay ? 500 : 400,
          }}
        />
      </Form.Item>

      <Form.Item
        name="file"
        label="Upload UAT File"
        rules={[{ required: !isUpdateForm, message: 'Please upload a UAT file!' }]}
      >
        <Base64Upload />
      </Form.Item>
    </>
  );
};

export default UATSignOffForm;
