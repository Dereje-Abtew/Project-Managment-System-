import {
  COMPANY_BLUE_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import SecondaryAlert from '../SecondaryAlert/Index';

const ProjectsBarChart = ({ projects }) => {
  const projectNames = projects.map((project) => project.title);
  const achievements = projects.map((project) => project.achievement);

  const chartData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Achievement',
        data: achievements,
        hoverBackgroundColor: COMPANY_SUCCESS_COLOR,
        hoverBorderColor: COMPANY_YELLOW_COLOR,
        hoverBorderWidth: 1,

        backgroundColor: COMPANY_BLUE_COLOR,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <SecondaryAlert message="Here are the list of On Going Projects with their Achievements." />
      <Bar data={chartData} options={chartOptions} className="mb-4" />
    </div>
  );
};

export default ProjectsBarChart;
