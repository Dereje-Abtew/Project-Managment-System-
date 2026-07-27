require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const User       = require('../models/coreModels/User');
const Permission = require('../models/appModels/Permission');
const Resource   = require('../models/appModels/Resource');
const Role       = require('../models/appModels/Role');
const Chief      = require('../models/appModels/Chief');
const Department = require('../models/appModels/Department');
const Division   = require('../models/appModels/Division');
const Category   = require('../models/appModels/Category');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: upsert a user by email
// ─────────────────────────────────────────────────────────────────────────────
async function upsertUser(data) {
  const dummy   = new User();
  const hashed  = dummy.generateHash(data.plainPassword);
  const payload = { ...data, password: hashed };
  delete payload.plainPassword;

  const user = await User.findOneAndUpdate(
    { email: data.email },
    { $set: payload },
    { upsert: true, new: true }
  );
  return user;
}

async function setupApp() {
  try {
    // ── 1. PERMISSIONS ───────────────────────────────────────────────────────
    const permNames = ['create', 'read', 'update', 'delete', 'report'];
    const perms = await Promise.all(
      permNames.map((name) =>
        Permission.findOneAndUpdate({ name }, { name }, { upsert: true, new: true })
      )
    );
    const permByName = Object.fromEntries(perms.map((p) => [p.name, p]));
    console.log('✅ Permissions ready.');

    // ── 2. RESOURCES (menu items) ─────────────────────────────────────────────
    const allPerms   = perms.map((p) => p._id);
    const readOnly   = [permByName['read']._id];

    const resourcesData = [
      { url: '/',          name: 'Dashboard',  isSubMenu: false, permissions: readOnly   },
      { url: '/project',   name: 'Project',    isSubMenu: false, permissions: allPerms   },
      { url: '/division',  name: 'Division',   isSubMenu: true,  parentMenu: 'Structure', permissions: allPerms },
      { url: '/department',name: 'Department', isSubMenu: true,  parentMenu: 'Structure', permissions: allPerms },
      { url: '/chief',     name: 'Chief',      isSubMenu: true,  parentMenu: 'Structure', permissions: allPerms },
      { url: '/category',  name: 'Category',   isSubMenu: false, permissions: allPerms   },
      { url: '/user',      name: 'User',       isSubMenu: false, permissions: allPerms   },
      { url: '/report',    name: 'Report',          isSubMenu: false, permissions: allPerms   },
      { url: '/generalReport', name: 'General Report', isSubMenu: false, permissions: allPerms   },
      { url: '/serviceprovider', name: 'Service Provider', isSubMenu: false, permissions: allPerms },
      { url: '/send-requirement', name: 'Send Requirement', isSubMenu: false, permissions: allPerms },
      { url: '/approve-requirement', name: 'Approve Requirement', isSubMenu: false, permissions: allPerms },
      { url: '/requirement-template', name: 'Requirement Template', isSubMenu: false, permissions: allPerms },
      { url: '/role',      name: 'Role',       isSubMenu: true,  parentMenu: 'Settings',  permissions: allPerms },
    ];

    const resources = await Promise.all(
      resourcesData.map((d) =>
        Resource.findOneAndUpdate(
          { name: d.name, url: d.url, isSubMenu: d.isSubMenu },
          d,
          { upsert: true, new: true }
        )
      )
    );
    const resByName = Object.fromEntries(resources.map((r) => [r.name, r]));
    console.log('✅ Resources ready.');

    // ── 3. ROLES ──────────────────────────────────────────────────────────────
    //
    // ROLE EXPLANATION:
    //
    // Admin        — full access to everything (system management)
    // Director     — can create/manage projects + view all reports
    // ProjectMgr   — creates projects, manages team, assigns tasks
    // TeamLeader   — manages tasks inside a project (add/edit/delete tasks)
    // Professional — view project, update their own task progress
    // QA           — quality assurance: can move tasks to Completed stage
    //
    const roleDefs = [
      {
        name: 'Admin',
        description: 'Full system access. Manages users, roles, org structure.',
        // Admin gets ALL permissions on ALL resources
        resources: resources.map((r) => ({ resource: r._id, permissions: allPerms })),
      },
      {
        name: 'Director',
        description: 'Oversees projects. Approves project creation and monitors reports.',
        resources: [
          { resource: resByName['Dashboard']._id,              permissions: readOnly },
          { resource: resByName['Project']._id,                permissions: allPerms },
          { resource: resByName['Report']._id,                 permissions: [permByName['read']._id, permByName['report']._id] },
          { resource: resByName['General Report']._id,         permissions: [permByName['read']._id, permByName['report']._id] },
          { resource: resByName['User']._id,                   permissions: [permByName['read']._id] },
          { resource: resByName['Category']._id,               permissions: [permByName['read']._id] },
          { resource: resByName['Send Requirement']._id,       permissions: allPerms },
          { resource: resByName['Approve Requirement']._id,    permissions: allPerms },
          { resource: resByName['Requirement Template']._id,   permissions: allPerms },
          { resource: resByName['Service Provider']._id,       permissions: allPerms },
        ],
      },
      {
        name: 'ProjectManager',
        description: 'Creates and manages projects. Assigns team leaders and members.',
        resources: [
          { resource: resByName['Dashboard']._id,              permissions: readOnly },
          { resource: resByName['Project']._id,                permissions: allPerms },
          { resource: resByName['Report']._id,                 permissions: [permByName['read']._id, permByName['report']._id] },
          { resource: resByName['General Report']._id,         permissions: [permByName['read']._id, permByName['report']._id] },
          { resource: resByName['User']._id,                   permissions: [permByName['read']._id] },
          { resource: resByName['Category']._id,               permissions: [permByName['read']._id] },
          { resource: resByName['Send Requirement']._id,       permissions: allPerms },
          { resource: resByName['Requirement Template']._id,   permissions: allPerms },
          { resource: resByName['Service Provider']._id,       permissions: [permByName['read']._id] },
        ],
      },
      {
        name: 'TeamLeader',
        description: 'Leads project execution. Adds tasks, assigns to professionals.',
        resources: [
          { resource: resByName['Dashboard']._id,      permissions: readOnly },
          { resource: resByName['Project']._id,        permissions: [permByName['read']._id, permByName['update']._id] },
          { resource: resByName['Report']._id,         permissions: [permByName['read']._id] },
          { resource: resByName['General Report']._id, permissions: [permByName['read']._id] },
          { resource: resByName['User']._id,           permissions: [permByName['read']._id] },
        ],
      },
      {
        name: 'Professional',
        description: 'Team member. Updates task progress (actual weight/cost).',
        resources: [
          { resource: resByName['Dashboard']._id,      permissions: readOnly },
          { resource: resByName['Project']._id,        permissions: [permByName['read']._id, permByName['update']._id] },
          { resource: resByName['Report']._id,         permissions: [permByName['read']._id] },
          { resource: resByName['General Report']._id, permissions: [permByName['read']._id] },
        ],
      },
      {
        name: 'QA',
        description: 'Quality Assurance. Reviews and marks tasks as Completed.',
        resources: [
          { resource: resByName['Dashboard']._id,      permissions: readOnly },
          { resource: resByName['Project']._id,        permissions: [permByName['read']._id, permByName['update']._id] },
          { resource: resByName['Report']._id,         permissions: [permByName['read']._id] },
          { resource: resByName['General Report']._id, permissions: [permByName['read']._id] },
        ],
      },
    ];

    const roleMap = {};
    for (const def of roleDefs) {
      const role = await Role.findOneAndUpdate(
        { name: def.name },
        { $set: { description: def.description, resources: def.resources } },
        { upsert: true, new: true }
      );
      roleMap[def.name] = role;
      console.log(`✅ Role [${def.name}] ready.`);
    }

    // ── 4. ORG STRUCTURE ──────────────────────────────────────────────────────
    //
    // Structure:
    //   Chief: Information Technology
    //     └── Department: Application & Program Management
    //           └── Division: Program Management
    //
    let chief = await Chief.findOneAndUpdate(
      { chiefName: 'Information Technology' },
      { chiefName: 'Information Technology' },
      { upsert: true, new: true }
    );
    console.log('✅ Chief ready.');

    let department = await Department.findOneAndUpdate(
      { departmentName: 'Application & Program Management', chief: chief._id },
      { departmentName: 'Application & Program Management', chief: chief._id },
      { upsert: true, new: true }
    );
    console.log('✅ Department ready.');

    let division = await Division.findOneAndUpdate(
      { divisionName: 'Program Management', department: department._id },
      { divisionName: 'Program Management', department: department._id },
      { upsert: true, new: true }
    );
    console.log('✅ Division ready.');

    // ── 5. PROJECT CATEGORIES ─────────────────────────────────────────────────
    const categoryNames = [
      'Core Banking',
      'Digital Banking',
      'Infrastructure',
      'Compliance & Risk',
      'HR & Operations',
    ];
    for (const categoryName of categoryNames) {
      await Category.findOneAndUpdate(
        { categoryName },
        { categoryName, enabled: true },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories ready.');

    // ── 6. USERS ──────────────────────────────────────────────────────────────
    //
    // USER EXPLANATION & LOGIN CREDENTIALS:
    //
    // Each user has a position that controls what org data is resolved at login:
    //
    // POSITION    ROLE            WHAT HAPPENS AT LOGIN
    // ─────────── ─────────────── ──────────────────────────────────────────
    // (Admin)     Admin           Full access, no position restriction
    // Director    Director        Gets department/chief resolved
    // Manager     ProjectManager  Gets directorId+directorEmail in session
    // Manager     TeamLeader      Gets directorId+managerId in session
    // Professional Professional  Gets directorId+managerId in session
    // Professional QA             Gets directorId+managerId in session
    //
    const usersToCreate = [
      {
        firstName: 'Global',
        lastName:  'Admin',
        email:     'admin@globalbank.et',
        plainPassword: 'Admin@1234!',
        phone:     '+251911000000',
        jobTitle:  'System Administrator',
        position:  'Director',            // Admin can be Director position
        role:      roleMap['Admin']._id,
        chief:      chief._id,
        department: department._id,
        division:   division._id,
      },
      {
        // DIRECTOR — When a Manager/Professional logs in, this user's ID
        // appears as directorId and directorEmail in their session.
        // The ProjectManager selects this user as Director when creating a project.
        firstName: 'Abebe',
        lastName:  'Kebede',
        email:     'abebe.kebede@globalbank.et',
        plainPassword: 'Director@1234',
        phone:     '+251911000001',
        jobTitle:  'IT Director',
        position:  'Director',
        role:      roleMap['Director']._id,
        department: department._id,
      },
      {
        // PROJECT MANAGER — Creates projects. Their ID is auto-filled as
        // projectManager when they open the Create Project form.
        firstName: 'Tigist',
        lastName:  'Haile',
        email:     'tigist.haile@globalbank.et',
        plainPassword: 'Manager@1234',
        phone:     '+251911000002',
        jobTitle:  'Project Manager',
        position:  'Manager',
        role:      roleMap['ProjectManager']._id,
        division:   division._id,
      },
      {
        // TEAM LEADER — When assigned as teamLeader on a project,
        // can add tasks, assign them, and export reports.
        firstName: 'Samuel',
        lastName:  'Tesfaye',
        email:     'samuel.tesfaye@globalbank.et',
        plainPassword: 'Leader@1234',
        phone:     '+251911000003',
        jobTitle:  'Team Lead',
        position:  'Manager',
        role:      roleMap['TeamLeader']._id,
        division:   division._id,
      },
      {
        // PROFESSIONAL 1 — Team member. Can drag tasks on Kanban board
        // (Backlog → Assigned → In Progress → Done).
        firstName: 'Meron',
        lastName:  'Alemu',
        email:     'meron.alemu@globalbank.et',
        plainPassword: 'Member@1234',
        phone:     '+251911000004',
        jobTitle:  'Software Developer',
        position:  'Professional',
        role:      roleMap['Professional']._id,
        division:   division._id,
      },
      {
        // PROFESSIONAL 2 — Another team member.
        firstName: 'Dawit',
        lastName:  'Girma',
        email:     'dawit.girma@globalbank.et',
        plainPassword: 'Member@1234',
        phone:     '+251911000005',
        jobTitle:  'Business Analyst',
        position:  'Professional',
        role:      roleMap['Professional']._id,
        division:   division._id,
      },
      {
        // QUALITY ASSURANCE — When assigned as qualityAssurance on a project,
        // can move tasks from Done → Completed (final approval step).
        firstName: 'Hana',
        lastName:  'Bekele',
        email:     'hana.bekele@globalbank.et',
        plainPassword: 'QA@1234567',
        phone:     '+251911000006',
        jobTitle:  'QA Engineer',
        position:  'Professional',
        role:      roleMap['QA']._id,
        division:   division._id,
      },
    ];

    for (const u of usersToCreate) {
      await upsertUser(u);
      console.log(`✅ User [${u.email}] ready.`);
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('✅ Setup complete! Login credentials:');
    console.log('──────────────────────────────────────────────────────────');
    console.log('Role            Email                              Password');
    console.log('──────────────────────────────────────────────────────────');
    console.log('Admin           admin@globalbank.et                Admin@1234!');
    console.log('Director        abebe.kebede@globalbank.et         Director@1234');
    console.log('ProjectManager  tigist.haile@globalbank.et         Manager@1234');
    console.log('TeamLeader      samuel.tesfaye@globalbank.et       Leader@1234');
    console.log('Professional    meron.alemu@globalbank.et          Member@1234');
    console.log('Professional    dawit.girma@globalbank.et          Member@1234');
    console.log('QA              hana.bekele@globalbank.et          QA@1234567');
    console.log('══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.log('\n🚫 Error!', error.message);
    process.exit(1);
  }
}

setupApp();
