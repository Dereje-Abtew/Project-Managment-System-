export const routesConfig = [
  {
    path: '/',
    component: 'Dashboard',
  },
  {
    path: '/profile',
    component: 'Profile',
  },
  {
    path: '/serviceprovider',
    component: 'ServiceProvider/index',
  },
  {
    path: '/serviceprovider/create',
    component: 'ServiceProvider/ServiceProviderCreate',
  },
  {
    path: '/serviceprovider/read/:id',
    component: 'ServiceProvider/ServiceProviderRead',
  },
  {
    path: '/serviceprovider/update/:id',
    component: 'ServiceProvider/ServiceProviderUpdate',
  },
  {
    path: '/send-requirement',
    component: 'ServiceProvider/RequirementWorkflow',
  },
  {
    path: '/approve-requirement',
    component: 'ServiceProvider/RequirementWorkflow',
  },
  {
    path: '/chief',
    component: 'Chief/index',
  },
  {
    path: '/chief/create',
    component: 'Chief/ChiefCreate',
  },
  {
    path: '/chief/read/:id',
    component: 'Chief/ChiefRead',
  },
  {
    path: '/chief/update/:id',
    component: 'Chief/ChiefUpdate',
  },
  {
    path: '/department',
    component: 'Department/index',
  },
  {
    path: '/department/create',
    component: 'Department/DepartmentCreate',
  },
  {
    path: '/department/read/:id',
    component: 'Department/DepartmentRead',
  },
  {
    path: '/departmnet/update/:id',
    component: 'Departmnet/DepartmnetUpdate',
  },
  {
    path: '/departmnet/:chiefId',
    component: 'Departmnet/ReadDeparment',
  },
  {
    path: '/division',
    component: 'Division/index',
  },
  {
    path: '/division/create',
    component: 'Division/DivisionCreate',
  },
  {
    path: '/division/read/:id',
    component: 'Division/DivisionRead',
  },
  {
    path: '/division/update/:id',
    component: 'Division/DivisionUpdate',
  },
  {
    path: '/division/:departmentId',
    component: 'Division/DivisionRead',
  },
  {
    path: '/user',
    component: 'User/index',
  },
  {
    path: '/user/create',
    component: 'User/UserCreate',
  },
  {
    path: '/user/read/:id',
    component: 'User/UserRead',
  },
  {
    path: '/user/update/:id',
    component: 'User/UserUpdate',
  },

  {
    path: '/category',
    component: 'Category/index',
  },
  {
    path: '/category/create',
    component: 'Category/CategoryCreate',
  },
  {
    path: '/category/read/:id',
    component: 'Category/CategoryRead',
  },
  {
    path: '/category/update/:id',
    component: 'Category/CategoryUpdate',
  },

  {
    path: '/project',
    component: 'Project/index',
  },
  {
    path: '/project/create',
    component: 'Project/ProjectCreate',
  },
  {
    path: '/project/read/:id',
    component: 'Project/ProjectRead',
  },
  {
    path: '/project/update/:id',
    component: 'Project/ProjectUpdate',
  },

  {
    path: '/project/:id',
    component: 'ProjectTodo/TodoRead',
  },

  {
    path: '/project/report/:id',
    component: 'ProjectTodo/TodoReport',
  },

  {
    path: '/role',
    component: 'Role/index',
  },
  {
    path: '/role/create',
    component: 'Role/RoleCreate',
  },
  {
    path: '/role/read/:id',
    component: 'Role/RoleRead',
  },
  {
    path: '/role/update/:id',
    component: 'Role/RoleUpdate',
  },
  {
    path: '/report',
    component: 'Report/index',
  },
  {
    path: '/report/create',
    component: 'Report/ReportCreate',
  },
  {
    path: '/generalReport',
    component: 'GeneralReport/index',
  },
  {
    path: '/generalReport/create',
    component: 'GeneralReport/GeneralReportCreate',
  },
  {
    path: '/generalReport/read/:id',
    component: 'GeneralReport/GeneralReportRead',
  },
  {
    path: '/generalReport/update/:id',
    component: 'GeneralReport/GeneralReportUpdate',
  },
];
