import { useState, useRef } from 'react';
import { Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { COMPANY_BLUE_COLOR, COMPANY_YELLOW_COLOR } from '@/constants/companyConstants';

const useColumnSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getValueByDataIndex = (record, dataIndex) => {
    if (record == null) return '';
    if (Array.isArray(dataIndex)) {
      return dataIndex.reduce((acc, key) => (acc ? acc[key] : undefined), record) ?? '';
    }
    // support dot notation string like 'project.ownerName'
    if (typeof dataIndex === 'string' && dataIndex.includes('.')) {
      return dataIndex.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), record) ?? '';
    }
    return record[dataIndex] ?? '';
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search by ${
            (Array.isArray(dataIndex)
              ? (dataIndex[dataIndex.length - 1] || '')
              : (typeof dataIndex === 'string' ? dataIndex : ''))
                .charAt(0).toUpperCase() + (Array.isArray(dataIndex)
              ? (dataIndex[dataIndex.length - 1] || '')
              : (typeof dataIndex === 'string' ? dataIndex : ''))
                .slice(1).replace(/(.)([A-Z])/g, '$1 $2')
          }`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? COMPANY_BLUE_COLOR : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      try {
        const val = getValueByDataIndex(record, dataIndex);
        return String(val).toLowerCase().includes(String(value).toLowerCase());
      } catch (err) {
        return false;
      }
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text, record) => {
      const displayText = text != null ? text : getValueByDataIndex(record, dataIndex);
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: COMPANY_YELLOW_COLOR,
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={displayText ? String(displayText) : ''}
        />
      ) : (
        displayText
      );
    },
  });

  return getColumnSearchProps;
};

export default useColumnSearch;
