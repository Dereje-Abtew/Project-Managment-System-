const express = require('express');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const userController = require('@/controllers/appControllers/userController');
const categoryController = require('@/controllers/appControllers/categoryController');
const roleController = require('@/controllers/appControllers/roleController');
const resourceController = require('@/controllers/appControllers/resourceController');
const permissionController = require('@/controllers/appControllers/permissionController');

const projectCommentController = require('@/controllers/appControllers/projectCommentController');
const projectController = require('@/controllers/appControllers/projectController');
const projectTodoController = require('@/controllers/appControllers/projectTodoController');
const projectIssueController = require('@/controllers/appControllers/projectIssueController');
const departmentController = require('@/controllers/appControllers/departmentController');
const reportController = require('@/controllers/appControllers/reportController');
const chiefController = require('@/controllers/appControllers/chiefController');
const divisionController = require('@/controllers/appControllers/divisionController');
const stakeholderController = require('@/controllers/appControllers/stakeholderController');
const stakeholderRequirementController = require('@/controllers/appControllers/stakeholderRequirementController');
const projectAnalyticsController = require('@/controllers/appControllers/projectAnalyticsController');

// ── Project Analytics (General Report Dashboard) ──────────────────────────
router.route('/project-report/analytics').get(catchErrors(projectAnalyticsController.getAnalytics));

router.route('/user/create').post(catchErrors(userController.create));
router.route('/user/read/:id').get(catchErrors(userController.read));
router.route('/user/update/:id').patch(catchErrors(userController.update));
router.route('/user/delete/:id').delete(catchErrors(userController.delete));
router.route('/user/search').get(catchErrors(userController.search));
router.route('/user/list').get(catchErrors(userController.list));
router.route('/user/filter').get(catchErrors(userController.filter));
router.route('/user/change-password/:id').patch(catchErrors(userController.changePassword));
router.route('/user/status/:id').patch(catchErrors(userController.status));

router.route('/category/create').post(catchErrors(categoryController.create));
router.route('/category/read/:id').get(catchErrors(categoryController.read));
router.route('/category/update/:id').patch(catchErrors(categoryController.update));
router.route('/category/delete/:id').delete(catchErrors(categoryController.delete));
router.route('/category/search').get(catchErrors(categoryController.search));
router.route('/category/list').get(catchErrors(categoryController.list));
router.route('/category/filter').get(catchErrors(categoryController.filter));

router.route('/chief/create').post(catchErrors(chiefController.create));
router.route('/chief/read/:id').get(catchErrors(chiefController.read));
router.route('/chief/update/:id').patch(catchErrors(chiefController.update));
router.route('/chief/delete/:id').delete(catchErrors(chiefController.delete));
router.route('/chief/search').get(catchErrors(chiefController.search));
router.route('/chief/list').get(catchErrors(chiefController.list));
router.route('/chief/filter').get(catchErrors(chiefController.filter));

//router.route('/department/:chiefId').get(catchErrors(departmentController.readDepartment));


router.route('/department/create').post(catchErrors(departmentController.create));
router.route('/department/read/:id').get(catchErrors(departmentController.read));
router.route('/department/update/:id').patch(catchErrors(departmentController.update));
router.route('/department/delete/:id').delete(catchErrors(departmentController.delete));
router.route('/department/search').get(catchErrors(departmentController.search));
router.route('/department/list').get(catchErrors(departmentController.list));
router.route('/department/filter').get(catchErrors(departmentController.filter));

//router.route('/division/:departmentId').get(catchErrors(divisionController.readDivision));

router.route('/division/create').post(catchErrors(divisionController.create));
router.route('/division/read/:id').get(catchErrors(divisionController.read));
router.route('/division/update/:id').patch(catchErrors(divisionController.update));
router.route('/division/delete/:id').delete(catchErrors(divisionController.delete));
router.route('/division/search').get(catchErrors(divisionController.search));
router.route('/division/list').get(catchErrors(divisionController.list));
router.route('/division/filter').get(catchErrors(divisionController.filter));

router.route('/report/create').post(catchErrors(reportController.create));
router.route('/report/read/:id').get(catchErrors(reportController.read));
router.route('/report/update/:id').patch(catchErrors(reportController.update));
router.route('/report/delete/:id').delete(catchErrors(reportController.delete));
router.route('/report/search').get(catchErrors(reportController.search));
router.route('/report/list').get(catchErrors(reportController.list));
router.route('/report/filter').get(catchErrors(reportController.filter));

router.route('/generalReport/create').post(catchErrors(reportController.create));
router.route('/generalReport/read/:id').get(catchErrors(reportController.read));
router.route('/generalReport/update/:id').patch(catchErrors(reportController.update));
router.route('/generalReport/delete/:id').delete(catchErrors(reportController.delete));
router.route('/generalReport/search').get(catchErrors(reportController.search));
router.route('/generalReport/list').get(catchErrors(reportController.list));
router.route('/generalReport/filter').get(catchErrors(reportController.filter));

router.route('/project/create').post(catchErrors(projectController.create));
router.route('/project/read/:id').get(catchErrors(projectController.read));
router.route('/project/update/:id').patch(catchErrors(projectController.update));
router.route('/project/delete/:id').delete(catchErrors(projectController.delete));
router.route('/project/search').get(catchErrors(projectController.search));
router.route('/project/list').get(catchErrors(projectController.list));
router.route('/project/filter').get(catchErrors(projectController.filter));
router.route('/project/summary').get(catchErrors(projectController.summary));

router.route('/projects').get(catchErrors(projectTodoController.listAll));
router.route('/projects/active').get(catchErrors(projectTodoController.listAllActive));
router.route('/project/:id').get(catchErrors(projectTodoController.readProject));
router.route('/project/:id/task').post(catchErrors(projectTodoController.create));
router.route('/project/:id/task/:taskId').get(catchErrors(projectTodoController.read));
router.route('/project/:id/task/:taskId').put(catchErrors(projectTodoController.update));
router.route('/project/:id/task/:taskId').delete(catchErrors(projectTodoController.delete));
router.route('/project/:id/todo').put(catchErrors(projectTodoController.reorder));
router.route('/project/:id/member').post(catchErrors(projectTodoController.addMember));
router
  .route('/project/:id/member/:memberId')
  .delete(catchErrors(projectTodoController.removeMember));

router
  .route('/project/:id/qualityAssurance')
  .post(catchErrors(projectTodoController.addQualityAssurance));
router
  .route('/project/:id/qualityAssurance/:qualityAssuranceId')
  .delete(catchErrors(projectTodoController.removeQualityAssurance));

router.route('/role/create').post(catchErrors(roleController.create));
router.route('/role/read/:id').get(catchErrors(roleController.read));
router.route('/role/update/:id').patch(catchErrors(roleController.update));
router.route('/role/delete/:id').delete(catchErrors(roleController.delete));
router.route('/role/search').get(catchErrors(roleController.search));
router.route('/role/list').get(catchErrors(roleController.list));
router.route('/role/filter').get(catchErrors(roleController.filter));

router.route('/resources').get(catchErrors(resourceController.listAll));

router.route('/permissions').get(catchErrors(permissionController.list));

router.route('/project/:id/issue').post(catchErrors(projectIssueController.create));
router.route('/project/:id/issue/:issueId').get(catchErrors(projectIssueController.read));
router.route('/project/:id/issue/:issueId').put(catchErrors(projectIssueController.update));
router.route('/project/:id/issue/:issueId').delete(catchErrors(projectIssueController.delete));

router.route('/stakeholder-requirement/login').post(catchErrors(stakeholderRequirementController.login));
router.route('/stakeholder-requirement/create').post(catchErrors(stakeholderRequirementController.create));
router.route('/stakeholder-requirement/list').get(catchErrors(stakeholderRequirementController.list));
router.route('/stakeholder-requirement/mine').get(catchErrors(stakeholderRequirementController.listMine));
router.route('/stakeholder-requirement/read/:id').get(catchErrors(stakeholderRequirementController.read));
router.route('/stakeholder-requirement/approve/:id').patch(catchErrors(stakeholderRequirementController.approve));
router.route('/stakeholder-requirement/reject/:id').patch(catchErrors(stakeholderRequirementController.reject));
router.route('/stakeholder-requirement/reverse/:id').patch(catchErrors(stakeholderRequirementController.reverseApproval));
router.route('/stakeholder-requirement/enhancement/:id').post(catchErrors(stakeholderRequirementController.enhancement));
router.route('/stakeholder-requirement/delete/:id').delete(catchErrors(stakeholderRequirementController.delete));

// ── Comment routes (from CodeIgniter) ──────────────────────────────────────
// POST   /project/:id/comment              → add a comment to a project
// DELETE /project/:id/comment/:commentId   → delete a project comment
router.route('/project/:id/comment').post(catchErrors(projectCommentController.add));
router.route('/project/:id/comment/:commentId').delete(catchErrors(projectCommentController.remove));

// ── Task comment routes ────────────────────────────────────────────────────
// POST   /project/:id/task/:taskId/comment              → add a comment to a task
// DELETE /project/:id/task/:taskId/comment/:commentId   → delete a task comment
const projectTodoCommentController = require('@/controllers/appControllers/projectTodoCommentController');
router.route('/project/:id/task/:taskId/comment').post(catchErrors(projectTodoCommentController.add));
router.route('/project/:id/task/:taskId/comment/:commentId').delete(catchErrors(projectTodoCommentController.remove));

// ── Requirement Template routes ────────────────────────────────────────────
const requirementTemplateController = require('@/controllers/appControllers/requirementTemplateController');
router.route('/requirement-template/create').post(catchErrors(requirementTemplateController.create));
router.route('/requirement-template/list').get(catchErrors(requirementTemplateController.list));
router.route('/requirement-template/list-by-provider/:providerId').get(catchErrors(requirementTemplateController.listByProvider));
router.route('/requirement-template/read/:id').get(catchErrors(requirementTemplateController.read));
router.route('/requirement-template/delete/:id').delete(catchErrors(requirementTemplateController.delete));

const uatSignOffController = require('@/controllers/appControllers/uatSignOffController');
router.route('/uat-signoff/list').get(catchErrors(uatSignOffController.list));
router.route('/uat-signoff/search').get(catchErrors(uatSignOffController.search));
router.route('/uat-signoff/filter').get(catchErrors(uatSignOffController.filter));
router.route('/uat-signoff/by-project/:projectId').get(catchErrors(uatSignOffController.listByProject));
router.route('/uat-signoff/by-provider/:providerId').get(catchErrors(uatSignOffController.listByProvider));
router.route('/uat-signoff/create').post(catchErrors(uatSignOffController.create));
router.route('/uat-signoff/read/:id').get(catchErrors(uatSignOffController.read));
router.route('/uat-signoff/update/:id').patch(catchErrors(uatSignOffController.update));
router.route('/uat-signoff/delete/:id').delete(catchErrors(uatSignOffController.delete));
router.route('/uat-signoff/:id/respond').patch(catchErrors(uatSignOffController.respond));
router.route('/uat-signoff/:id/reverse-approval').patch(catchErrors(uatSignOffController.reverseApproval));
router.route('/uat-signoff/:id/attach-pdf').patch(catchErrors(uatSignOffController.attachPdf));

module.exports = router;
