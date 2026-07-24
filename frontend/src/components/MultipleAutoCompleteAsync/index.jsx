import React, { useState, useEffect, useRef } from 'react';
import { request } from '@/request';

import useOnFetch from '@/hooks/useOnFetch';
import { useDebounce } from 'react-use';
import { Select } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

export default function MultipleAutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  value,
  onChange,
}) {
  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState([]);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = (options) => {
    return request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };

  useEffect(() => {
    if (debouncedValue !== '') {
      const options = {
        q: debouncedValue,
        fields: searchFields,
      };
      onFetch(() => asyncSearch(options));
    }

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    if (searchText && searchText.trim() !== '') {
      isSearching.current = true;
      setSearching(true);
      setOptions([]);
      if (!Array.isArray(currentValue)) {
        setCurrentValue([]);
      }
      setValToSearch(searchText);
    }
  };

  useEffect(() => {
    if (isSearching.current) {
      if (isSuccess) {
        setOptions(result);
      } else {
        setSearching(false);
        setCurrentValue([]);
        setOptions([]);
      }
    }
  }, [isSuccess, result]);

  useEffect(() => {
    if (value && isUpdating.current) {
      if (!isSearching.current) {
        setOptions([value]);
      }
      setCurrentValue(value);
      onChange(value);
      isUpdating.current = false;
    }
  }, [value]);

  const CustomOption = ({ children, value, selected }) => {
    <Select.Option key={value} value={value}>
      {selected && <CheckOutlined />}
      {children}
    </Select.Option>;
  };
  return (
    <Select
      mode="multiple"
      loading={isLoading}
      showSearch
      maxTagCount="responsive"
      allowClear
      placeholder={'Search Here'}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : 'Not Found'}
      value={currentValue}
      onSearch={onSearch}
      onChange={(newValue) => {
        if (onChange) {
          onChange(newValue);
        }
        setCurrentValue(newValue);
      }}
    >
      {selectOptions.map((optionField) => (
        <CustomOption
          key={optionField[outputValue] || optionField}
          value={optionField[outputValue] || optionField}
        >
          {labels(optionField)}
        </CustomOption>
      ))}
    </Select>
  );
}
