import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageLoader from '@/components/PageLoader';
import { DatePicker, Row, Col, Form, Button, Table } from 'antd';
import moment from 'moment';
import { SearchOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { selectAuth } from '@/redux/auth/selectors';
import { useSelector } from 'react-redux';
import history from '@/utils/history';
import SecondaryAlert from '../SecondaryAlert/Index';
import { request } from '@/request';

function Report() {
  const currentUser = useSelector(selectAuth);

  const [project, setProject] = useState('');
  let { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [tasks, setTasks] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const getProject = async () => {
    const { result: projectResult } = await request.read({ entity: 'project', id });

    if (
      projectResult.teamLeader._id !== currentUser.id &&
      projectResult.projectManager._id !== currentUser.id &&
      projectResult.director._id !== currentUser.id
    ) {
      history.push('/unauthorized');
    }
    setProject(projectResult);

    setDeliverables(projectResult.deliverables);
    setTasks(projectResult.task);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    setLoading(true);
    getProject();
  }, [id]);

  const excludedColumns = ['_id', 'description'];

  const keys = [];
  for (const obj of deliverables) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !excludedColumns.includes(key)) {
        keys.push(key);
      }
    }
  }

  const projectTitle = project ? project.title : '';

  const handleExportDeliverablesOnly = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Deliverables');

    const titleCell = worksheet.getCell('A1');
    titleCell.value = projectTitle;
    titleCell.style = {
      font: { bold: true, size: 16 },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    worksheet.mergeCells('A1:H1');

    const headerRow = worksheet.getRow(2);
    headerRow.getCell('A').value = 'Deliverable';
    headerRow.getCell('B').value = 'Cost';
    headerRow.getCell('C').value = 'Actual Cost';
    headerRow.getCell('D').value = 'Weight';
    headerRow.getCell('E').value = 'Actual';
    headerRow.getCell('F').value = 'Performance';
    headerRow.getCell('G').value = 'Start Date';
    headerRow.getCell('H').value = 'End Date';

    headerRow.style = {
      font: { bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    let rowIndex = 3;

    reportData.forEach((deliverable) => {
      worksheet.getCell(`A${rowIndex}`).value = deliverable.name;
      worksheet.getCell(`B${rowIndex}`).value = deliverable.cost;
      worksheet.getCell(`C${rowIndex}`).value = deliverable.deliverableActualBudget;
      worksheet.getCell(`D${rowIndex}`).value = deliverable.deliverableWeight;
      worksheet.getCell(`E${rowIndex}`).value = deliverable.deliverableActual;
      worksheet.getCell(`F${rowIndex}`).value = deliverable.performance;
      worksheet.getCell(`G${rowIndex}`).value = deliverable.startDate;
      worksheet.getCell(`H${rowIndex}`).value = deliverable.endDate;
      rowIndex++;
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
      });
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const contentLength = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, contentLength);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `${projectTitle} - Deliverables Only at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.xlsx`
    );
  };

  const handleExportDeliverablesWithTasks = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Deliverables with Tasks');

    const titleCell = worksheet.getCell('A1');
    titleCell.value = projectTitle;
    titleCell.style = {
      font: { bold: true, size: 16 },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    worksheet.mergeCells('A1:N1');

    const headerRow = worksheet.getRow(2);
    headerRow.getCell('A').value = 'Deliverable';
    headerRow.getCell('B').value = 'Deliverable Cost';
    headerRow.getCell('C').value = 'Deliverable Actual';
    headerRow.getCell('D').value = 'Deliverable Weight';
    headerRow.getCell('E').value = 'Actual Weight';
    headerRow.getCell('F').value = 'Deliverable Performance';

    headerRow.getCell('G').value = 'Task';
    headerRow.getCell('H').value = 'Assigned To';
    headerRow.getCell('I').value = 'Weight';
    headerRow.getCell('J').value = 'Planned';
    headerRow.getCell('K').value = 'Actual';
    headerRow.getCell('L').value = 'Prformance';
    headerRow.getCell('M').value = 'Start Date';
    headerRow.getCell('N').value = 'Submission Date';

    let rowIndex = 3;

    reportData.forEach((deliverable) => {
      const deliverableRowIndex = rowIndex;
      worksheet.getCell(`A${rowIndex}`).value = deliverable.name;
      worksheet.getCell(`B${rowIndex}`).value = deliverable.cost;
      worksheet.getCell(`C${rowIndex}`).value = deliverable.deliverableActualBudget;
      worksheet.getCell(`D${rowIndex}`).value = deliverable.deliverableWeight;
      worksheet.getCell(`E${rowIndex}`).value = deliverable.deliverableActual;
      worksheet.getCell(`F${rowIndex}`).value = deliverable.performance;

      deliverable.tasks.forEach((task) => {
        worksheet.getCell(`G${rowIndex}`).value = task.taskTitle;
        worksheet.getCell(`H${rowIndex}`).value = task.assignedTo;
        worksheet.getCell(`I${rowIndex}`).value = task.weight;
        worksheet.getCell(`J${rowIndex}`).value = task.planned;
        worksheet.getCell(`K${rowIndex}`).value = task.actual;
        worksheet.getCell(`L${rowIndex}`).value = task.performance;
        worksheet.getCell(`M${rowIndex}`).value = task.assignedDate;
        worksheet.getCell(`N${rowIndex}`).value = task.submissionDate;

        rowIndex++;
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
          };
        });
      });

      if (deliverable.tasks.length > 1) {
        worksheet.mergeCells(
          `A${deliverableRowIndex}:A${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
        worksheet.mergeCells(
          `B${deliverableRowIndex}:B${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
        worksheet.mergeCells(
          `C${deliverableRowIndex}:C${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
        worksheet.mergeCells(
          `D${deliverableRowIndex}:D${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
        worksheet.mergeCells(
          `E${deliverableRowIndex}:E${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
        worksheet.mergeCells(
          `F${deliverableRowIndex}:F${deliverableRowIndex + deliverable.tasks.length - 1}`
        );
      }
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const contentLength = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, contentLength);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `${projectTitle} - Deliverables with Tasks at ${moment().format(
        'MMMM Do YYYY, h:mm:ss a'
      )}.xlsx`
    );
  };

  const columns = [
    { title: 'Deliverable', dataIndex: 'name', key: 'name' },
    { title: 'Cost', dataIndex: 'cost', key: 'cost' },
    { title: 'Actual Cost', dataIndex: 'deliverableActualBudget', key: 'deliverableActualBudget' },
    { title: 'Weight', dataIndex: 'deliverableWeight', key: 'deliverableWeight' },
    { title: 'Actual', dataIndex: 'deliverableActual', key: 'deliverableActual' },
    { title: 'Performance', dataIndex: 'performance', key: 'performance' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startdate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
  ];

  const generateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      const filteredReportData = deliverables.map((deliverable) => {
        const deliverableTasks = tasks.filter((task) => task.deliverable === deliverable._id);

        const filteredTasks = tasks.filter((task) => {
          const taskStartDate = moment(task.assignedDate);
          const taskEndDate = moment(task.submissionDate);

          return (
            task.deliverable === deliverable._id &&
            (startDate === null || taskStartDate.isSameOrAfter(startDate, 'day')) &&
            (endDate === null || taskEndDate.isSameOrBefore(endDate, 'day'))
          );
        });

        const deliverableActual = deliverableTasks.reduce((sum, task) => {
          return sum + task.actual;
        }, 0);

        const deliverableActualBudget = deliverableTasks.reduce((sum, task) => {
          return sum + task.actualCost;
        }, 0);

        const performance = parseFloat(((deliverableActual / deliverable.weight) * 100).toFixed(1));

        return {
          ...deliverable,
          projectTitle,
          cost: deliverable.cost + '$',
          deliverableActualBudget: isNaN(deliverableActualBudget)
            ? 0 + '$'
            : deliverableActualBudget + '$',
          deliverableWeight: deliverable.weight,
          deliverableActual,
          performance: isNaN(performance) ? 0 + '%' : performance + '%',
          startDate: moment(deliverable.startDate).format('MMMM Do YYYY, h:mm:ss a'),
          endDate: moment(deliverable.endDate).format('MMMM Do YYYY, h:mm:ss a'),
          tasks: filteredTasks.map((task) => {
            const taskPerformance = parseFloat(((task.actual / task.weight) * 100).toFixed(1));

            const assignedDate = moment(task.assignedDate);
            const submissionDate = moment(task.submissionDate);

            const currentDate = moment();
            const totalDuration = Math.floor(
              submissionDate.diff(assignedDate) / (24 * 60 * 60 * 1000)
            );
            const elapsedDuration = Math.floor(
              currentDate.diff(assignedDate) / (24 * 60 * 60 * 1000)
            );

            const completedWeight = parseFloat(
              ((Math.min(elapsedDuration, totalDuration) / totalDuration) * task.weight).toFixed(1)
            );

            const planned = isNaN(completedWeight)
              ? 0
              : completedWeight +
                '(' +
                parseFloat(((completedWeight / task.weight) * 100).toFixed(1)) +
                '%)';

            return {
              taskTitle: task.title,
              assignedDate: moment(task.assignedDate).format('MMMM Do YYYY, h:mm:ss a'),
              submissionDate: moment(task.submissionDate).format('MMMM Do YYYY, h:mm:ss a'),
              assignedTo: task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName,
              assuredBy: task.assuredBy,
              actual: task.actual,
              weight: task.weight,
              performance: isNaN(taskPerformance) ? 0 + '%' : taskPerformance + '%',
              planned,
            };
          }),
        };
      });

      setReportData(filteredReportData);
      setIsLoading(false);
    }, 1000);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  return (
    <div className="px-4 py-4   w-full    ">
      {loading ? (
        <div className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen">
          <PageLoader />
        </div>
      ) : (
        <>
          <div className="mb-3 mt-3">
            <SecondaryAlert message="Filter tasks by start date and end date." />
          </div>
          <Form layout="vertical">
            <Row gutter={8}>
              <Col className="gutter-row" span={6}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    {
                      type: 'object',
                    },
                  ]}
                >
                  <DatePicker
                    id="startDateInput"
                    value={startDate}
                    onChange={handleStartDateChange}
                    style={{ width: '95%' }}
                    showTime
                  />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={6}>
                <Form.Item
                  name="endDate"
                  label="End Date "
                  rules={[
                    {
                      type: 'object',
                    },
                  ]}
                >
                  <DatePicker
                    id="endDateInput"
                    value={endDate}
                    onChange={handleEndDateChange}
                    style={{ width: '100%' }}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col flex="auto">
                <Button
                  type="primary"
                  loading={isLoading}
                  icon={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
                  onClick={generateReport}
                >
                  Search Tasks
                </Button>
              </Col>
            </Row>
            <Row className="flex justify-end mb-3">
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportDeliverablesOnly}
                >
                  Deliverables Only
                </Button>

                <Button
                  type="primary"
                  className="ml-3"
                  icon={<DownloadOutlined />}
                  onClick={handleExportDeliverablesWithTasks}
                >
                  Deliverables with Tasks
                </Button>
              </Col>
            </Row>
          </Form>{' '}
          <Table
            className="w-full overflow-x-scroll whitespace-nowrap"
            style={{ width: '100%' }}
            dataSource={reportData}
            columns={columns}
            rowKey={(record) => record._id}
            expandable={{
              expandRowByClick: true,
              expandedRowRender: (record) => (
                <Table
                  columns={[
                    { title: 'Task', dataIndex: 'taskTitle', key: 'taskTitle' },
                    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
                    { title: 'Weight', dataIndex: 'weight', key: 'weight' },
                    { title: 'Planned', dataIndex: 'planned', key: 'planned' },
                    { title: 'Actual', dataIndex: 'actual', key: 'actual' },
                    { title: 'Performance', dataIndex: 'performance', key: 'performance' },
                    { title: 'Start Date', dataIndex: 'assignedDate', key: 'assignedDate' },
                    {
                      title: 'Submission Date',
                      dataIndex: 'submissionDate',
                      key: 'submissionDate',
                    },
                  ]}
                  dataSource={record.tasks}
                  pagination={false}
                />
              ),
            }}
          />
        </>
      )}
    </div>
  );
}

export default Report;
