import {
  ASSIGNED_LABEL,
  BACKLOG_LABEL,
  COMPLETED_LABEL,
  DONE_LABEL,
  INPROGRESS_LABEL,
} from '@/constants/kanbanBoardCardLabels';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';

const PieChart = ({ project }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (project) {
      const { task } = project;
      // Use 4 stages: Completed, Backlog, In Progress (includes Assigned), Done
      const taskStages = [COMPLETED_LABEL, BACKLOG_LABEL, INPROGRESS_LABEL, DONE_LABEL];

      const summedWeights = taskStages.map((stage) => {
        const tasksInStage = task.filter((t) => {
          if (stage === INPROGRESS_LABEL) {
            // "In Progress" bucket: Assigned + In Progress tasks
            return t.stage === ASSIGNED_LABEL || t.stage === INPROGRESS_LABEL;
          }
          return t.stage === stage;
        });
        return tasksInStage.reduce((total, t) => total + (t.actual || 0), 0);
      });

      // Ensure chart total equals 100 — add remainder to backlog
      const totalAssigned = summedWeights.reduce((sum, w) => sum + w, 0);
      const adjustment = Math.max(0, 100 - totalAssigned);
      const backlogIndex = taskStages.indexOf(BACKLOG_LABEL);
      summedWeights[backlogIndex] += adjustment;

      const chartData = taskStages.map((stage, index) => ({
        // Rename "In Progress" to clarify it includes Assigned
        type: stage === INPROGRESS_LABEL ? 'Assigned / In Progress' : stage,
        value: summedWeights[index],
        color: getColorForStage(stage),
      }));

      setChartData(chartData);
    }
  }, [project]);
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const percentageData = chartData.map((item) => ({
    ...item,
    value: (item.value / totalValue) * 100,
  }));

  const myChartData = {
    labels: percentageData.map((item) => item.type),
    datasets: [
      {
        data: percentageData.map((item) => item.value),
        backgroundColor: percentageData.map((item) => item.color),
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const labelValue = context.raw.toFixed(2);
            return `${labelValue}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ minWidth: '250px', maxWidth: '300px', maxHeight: '300px', minHeight: '250px' }}>
      <Doughnut data={myChartData} options={options} />
    </div>
  );
};

const getColorForStage = (stage) => {
  switch (stage) {
    case COMPLETED_LABEL:
      return COMPANY_SUCCESS_COLOR;
    case BACKLOG_LABEL:
      return COMPANY_SECONDARY_COLOR;
    case INPROGRESS_LABEL:
      return COMPANY_YELLOW_COLOR;
    case DONE_LABEL:
      return COMPANY_BLUE_COLOR;
    default:
      return COMPANY_BLUE_COLOR;
  }
};

export default PieChart;
