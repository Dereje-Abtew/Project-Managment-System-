import React, { useEffect, useRef, useState } from 'react';
import { List } from 'antd';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';

import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

export default function ReadItem({ config }) {
  let { readColumns, entity } = config;
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState([]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const list = [];
    readColumns.map((props) => {
      const propsKey = props.dataIndex;
      const propsTitle = props.title;
      const isDate = props.isDate || false;
      let value = valueByString(currentResult, propsKey);
      value = isDate ? dayjs(value).format('DD/MM/YYYY') : value;
      list.push({ propsKey, label: propsTitle, value: value });
    });
    setListState(list);
  }, [currentResult]);

  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  const itemsList = listState.map((item) => (
    <React.Fragment key={item.propsKey}>
      <List.Item>
        <List.Item.Meta title={item.label} description={item.value} />
      </List.Item>
    </React.Fragment>
  ));

  return (
    <div style={show}>
      <List layout="vertical" title={entity}>
        {itemsList}
      </List>
    </div>
  );
}
