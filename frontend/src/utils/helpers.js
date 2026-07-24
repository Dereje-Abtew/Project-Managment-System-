import { parse } from 'querystring';
import dayjs from 'dayjs';
import { COMPANY_BLUE_COLOR, COMPANY_YELLOW_COLOR } from '@/constants/companyConstants';
function getPageQuery() {
  parse(window.location.href.split('?')[1]);
}

export function get(obj, key) {
  return key.split('.').reduce(function (o, x) {
    return o === undefined || o === null ? o : o[x];
  }, obj);
}

Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1');
  s = s.replace(/^\./, '');
  let a = s.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (o !== null) {
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    } else {
      return;
    }
  }
  return o;
};

export function has(obj, key) {
  return key.split('.').every(function (x) {
    if (typeof obj !== 'object' || obj === null || x in obj === false) return false;
    obj = obj[x];
    return true;
  });
}

export function valueByString(obj, string, devider) {
  if (devider === undefined) {
    devider = '|';
  }
  return string
    .split(devider)
    .map(function (key) {
      return get(obj, key);
    })
    .join(' ');
}

export function toFormData(form) {
  let formData = new FormData();
  const elements = form.querySelectorAll('input, select, textarea');
  for (let i = 0; i < elements.length; ++i) {
    const element = elements[i];
    const name = element.name;

    if (name && element.dataset.disabled !== 'true') {
      if (element.type === 'file') {
        const file = element.files[0];
        formData.append(name, file);
      } else {
        const value = element.value;
        if (value && value.trim()) {
          formData.append(name, value);
        }
      }
    }
  }

  return formData;
}

export function formatDate(param) {
  const date = new Date(param);
  let day = date.getDate().toString();
  let month = (date.getMonth() + 1).toString();
  const year = date.getFullYear();
  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  const fullDate = `${day}/${month}/${year}`;
  return fullDate;
}

export const isDate = function ({ date, format = 'YYYY-MM-DD' }) {
  if (typeof date == 'boolean') return false;
  if (typeof date == 'number') return false;
  if (dayjs(date, format).isValid()) return true;
  return false;
};

export function formatDatetime(param) {
  let time = new Date(param).toLocaleTimeString();
  return formatDate(param) + ' ' + time;
}

export const validatePhoneNumber = /^(?:[+\d()\-\s]+)$/;

export function bindValue(obj, parentElement) {
  parentElement.querySelectorAll('[data-property]').forEach((element) => {
    const type = element.dataset.type;
    let value = valueByString(obj, element.dataset.property);
    switch (type) {
      case 'date':
        value = formatDate(value);
        break;

      case 'datetime':
        value = formatDatetime(value);
        break;

      default:
        break;
    }
    element.innerHTML = value;
  });
}

export default getPageQuery;

export function getTwoColors() {
  return { '0%': COMPANY_YELLOW_COLOR, '100%': COMPANY_BLUE_COLOR };
}
