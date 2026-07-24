import React, { useCallback, useEffect, useState } from 'react';
import { Dropdown, Button, PageHeader, Table, Descriptions, Menu, Checkbox, Space, Input } from 'antd';

import { EditOutlined, ReloadOutlined, DownOutlined, UnorderedListOutlined, DownloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';

import uniqueId from '@/utils/uinqueId';
import useResponsiveTable from '@/hooks/useResponsiveTable';
import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';
import PageLoader from '../PageLoader';
import { exportToExcel, exportToCSV, exportToJSON, exportToTXT, exportToXML, exportToSQL } from '@/utils/exportUtils';

export default function DataTable({ config, DropDownRowMenu, AddNewItem }) {
  let { entity, dataTableColumns: originalColumns = [], DATATABLE_TITLE, searchConfig = {} } = config;

  const actionColumn = {
    title: 'Action',
    key: 'action',
    render: (row) => (
      <Dropdown
        overlay={DropDownRowMenu({ row, config, exportRow: (format) => handleExport(format, row) })}
        trigger={['click']}
        placement="bottomRight"
      >
        <EditOutlined
          style={{ cursor: 'pointer', color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
        />
      </Dropdown>
    ),
  };

  const serialColumn = {
    title: '#',
    key: 'serial',
    width: 80,
    align: 'center',
    render: (_text, _record, index) => {
      const current = pagination?.current || 1;
      const pageSize = pagination?.pageSize || 10;
      return (current - 1) * pageSize + (index + 1);
    },
  };

  // Ensure each original column has a stable string `key` so visibility toggles work
  const normalizedOriginal = originalColumns.map((col, idx) => {
    if (col.key) return col;
    // derive key from dataIndex or title
    let derived = '';
    if (col.dataIndex) {
      if (Array.isArray(col.dataIndex)) derived = col.dataIndex.join('.');
      else derived = String(col.dataIndex);
    } else if (col.columnLabel) {
      derived = String(col.columnLabel).replace(/\s+/g, '_').toLowerCase();
    } else if (typeof col.title === 'string') {
      derived = col.title.replace(/\s+/g, '_').toLowerCase();
    } else {
      derived = `col_${idx}`;
    }
    return { ...col, key: derived };
  });

  const dataTableColumns = [serialColumn, ...normalizedOriginal, actionColumn];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, []);

  useEffect(() => {
    dispatch(crud.list({ entity }));
  }, []);

  // Columns with defaultHidden:true start hidden (matches CI data-visible="false")
  const [visibleColumns, setVisibleColumns] = useState(
    dataTableColumns
      .filter(col => col.key && !col.defaultHidden)
      .map(col => col.key)
  );

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const filteredColumns = dataTableColumns.filter(
    (col) => visibleColumns.includes(col.key) || col.key === 'action' || col.key === 'serial'
  );

  const styledColumns = filteredColumns.map(col => ({
    ...col,
    onHeaderCell: () => ({ style: { whiteSpace: 'nowrap', fontWeight: 600 } }),
  }));

  // Global search state (client-side filtering when searchConfig provided)
  const [globalSearch, setGlobalSearch] = useState('');

  const getValueByDataIndex = (record, dataIndex) => {
    if (!record) return '';
    if (Array.isArray(dataIndex)) return dataIndex.reduce((acc, k) => (acc ? acc[k] : undefined), record);
    if (typeof dataIndex === 'string' && dataIndex.includes('.')) return dataIndex.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), record);
    return record[dataIndex];
  };

  // Determine which fields to search in global search
  const searchFields = Array.isArray(searchConfig.searchFields)
    ? searchConfig.searchFields
    : searchConfig.searchFields
    ? [searchConfig.searchFields]
    : [];

  const displayedItems = (items || []).filter((record) => {
    if (!globalSearch) return true;
    const q = String(globalSearch).toLowerCase();
    if (searchFields.length === 0) {
      // if no specific fields provided, search across all visible columns with dataIndex
      return styledColumns.some((col) => {
        if (!col.dataIndex) return false;
        const v = getValueByDataIndex(record, col.dataIndex);
        return v != null && String(v).toLowerCase().includes(q);
      });
    }
    return searchFields.some((f) => {
      const v = getValueByDataIndex(record, f);
      return v != null && String(v).toLowerCase().includes(q);
    });
  });

  const { expandedRowData, tableColumns, tableHeader } = useResponsiveTable(
    styledColumns,
    displayedItems
  );

  const handleExport = (format, specificRow = null) => {
    // Strip out the Action column and extra formatting for export
    const dataToExport = specificRow ? [specificRow] : (displayedItems || items || []);
    const exportData = dataToExport.map(item => {
      let cleanItem = {};
      filteredColumns.forEach(col => {
        if (col.title !== 'Action' && col.dataIndex) {
           let val = Array.isArray(col.dataIndex) ? getValueByDataIndex(item, col.dataIndex) : getValueByDataIndex(item, col.dataIndex);
           cleanItem[col.columnLabel || col.key || col.dataIndex] = val;
        }
      });
      return cleanItem;
    });

    const filename = `${config.entity || 'export'}_data${specificRow ? '_single' : ''}`;
    switch(format) {
      case 'json': exportToJSON(exportData, filename); break;
      case 'xml': exportToXML(exportData, filename); break;
      case 'csv': exportToCSV(exportData, filename); break;
      case 'txt': exportToTXT(exportData, filename); break;
      case 'sql': exportToSQL(exportData, filename, config.entity); break;
      case 'excel': exportToExcel(exportData, filename); break;
      default: break;
    }
  };

  const exportMenu = (
    <Menu onClick={(e) => handleExport(e.key)}>
      <Menu.Item key="json">JSON</Menu.Item>
      <Menu.Item key="xml">XML</Menu.Item>
      <Menu.Item key="csv">CSV</Menu.Item>
      <Menu.Item key="txt">TXT</Menu.Item>
      <Menu.Item key="sql">SQL</Menu.Item>
      <Menu.Item key="excel">MS-Excel</Menu.Item>
    </Menu>
  );

  const columnMenu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.ItemGroup title="Toggle Columns">
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', gap: '6px' }}>
          {dataTableColumns
            .filter(c => c.key && c.key !== 'action' && c.key !== 'serial')
            .map(c => (
              <label
                key={c.key}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(c.key)}
                  onChange={(e) => {
                    const newVis = e.target.checked
                      ? [...visibleColumns, c.key]
                      : visibleColumns.filter(k => k !== c.key);
                    setVisibleColumns(newVis);
                  }}
                />
                {/* columnLabel is a plain-text label for the menu */}
                {c.columnLabel || (typeof c.title === 'string' ? c.title : c.key)}
              </label>
            ))
          }
        </div>
      </Menu.ItemGroup>
    </Menu>
  );

  return (
    <>
      <div ref={tableHeader}>
        <PageHeader
          onBack={() => window.history.back()}
          title={DATATABLE_TITLE}
          ghost={false}
          extra={[
              <Input.Search
                placeholder={searchConfig.displayLabels ? `Search ${searchConfig.displayLabels.join(', ')}` : 'Search…'}
                allowClear
                onSearch={(v) => setGlobalSearch(v)}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{ width: 240, marginRight: 8 }}
                key="global-search"
              />,
              <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<ReloadOutlined />}>
                Refresh
              </Button>,
            <Dropdown key="column-visibility" overlay={columnMenu} trigger={['click']}>
              <Button icon={<UnorderedListOutlined />} />
            </Dropdown>,
            <Dropdown key="export-data" overlay={exportMenu} trigger={['click']}>
              <Button icon={<DownloadOutlined />}><DownOutlined /></Button>
            </Dropdown>,
            <AddNewItem key={`${uniqueId()}`} config={config} />,
          ]}
          style={{
            padding: '20px 0px',
          }}
        ></PageHeader>
      </div>

      {listIsLoading ? (
        <div className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen">
          <PageLoader />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={tableColumns}
            rowKey={(item) => item._id}
            dataSource={items}
            pagination={pagination}
            loading={listIsLoading}
            onChange={handelDataTableLoad}
            scroll={{ x: Math.max(
              // compute a minimum width based on column widths (fallback 150 each)
              tableColumns.reduce((sum, c) => sum + (c.width || 150), 0),
              800
            ) }}
            
          />
        </div>
      )}
    </>
  );
}
