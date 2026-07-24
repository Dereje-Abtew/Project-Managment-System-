import React from 'react';
import { Redirect } from 'react-router-dom';
// Create is not applicable — analytics are auto-computed from project data
export default function GeneralReportCreate() {
  return <Redirect to="/generalReport" />;
}
