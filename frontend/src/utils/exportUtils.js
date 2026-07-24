import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename = 'export') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data, filename = 'export') => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
};

export const exportToTXT = (data, filename = 'export') => {
  const headers = Object.keys(data[0] || {}).join('\t');
  const rows = data.map(row => Object.values(row).join('\t')).join('\n');
  const txt = `${headers}\n${rows}`;
  downloadFile(txt, `${filename}.txt`, 'text/plain');
};

export const exportToXML = (data, filename = 'export') => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n';
  data.forEach(row => {
    xml += '  <row>\n';
    for (const key in row) {
      xml += `    <${key}>${row[key]}</${key}>\n`;
    }
    xml += '  </row>\n';
  });
  xml += '</rows>';
  downloadFile(xml, `${filename}.xml`, 'application/xml');
};

export const exportToSQL = (data, filename = 'export', tableName = 'table_name') => {
  if (data.length === 0) return;
  const keys = Object.keys(data[0]);
  let sql = `INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES\n`;
  const rows = data.map(row => {
    const values = keys.map(k => {
      let val = row[k];
      if (typeof val === 'string') {
        val = val.replace(/'/g, "''"); // Escape single quotes
        return `'${val}'`;
      }
      if (val === null || val === undefined) return 'NULL';
      return val;
    });
    return `(${values.join(', ')})`;
  });
  sql += rows.join(',\n') + ';';
  downloadFile(sql, `${filename}.sql`, 'application/sql');
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
