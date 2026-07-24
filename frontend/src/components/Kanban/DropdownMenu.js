import React, { useState } from 'react';
import { Popover } from '@headlessui/react';
import { Popconfirm } from 'antd';
import { EditTwoTone } from '@ant-design/icons';
import AddTaskModal from '@/components/Kanban/AddTaskModal';
import { COMPANY_BLUE_COLOR } from '@/constants/companyConstants';
const DropdownMenu = ({
  isTaskOwner,
  taskId,
  handleDelete,
  projectId,
  onCreate,
  tasks,
  deliverables,
  members,
  qualityAssurances,
  leader,
  isWaterFall,
  position,
}) => {
  const [isEditTaskModalOpen, setEditTaskModal] = useState(false);

  const handleSetEditModal = (e) => {
    e.stopPropagation();
    setEditTaskModal(true);
  };
  return (
    <>
      {/* <Dropdown overlay={dropdownMenu} trigger={['click']}>
        <EllipsisOutlined style={{ cursor: 'pointer', fontSize: '24px' }} />
      </Dropdown> */}
      {isTaskOwner && (
        <Popover className={'relative'}>
          <Popover.Button className="right-1.5   rounded-sm focus:outline-none   ">
            <EditTwoTone
              className="last "
              twoToneColor={COMPANY_BLUE_COLOR}
              float="right"
              style={{
                float: 'right',
                fontSize: '150%',
              }}
            />
          </Popover.Button>
          <Popover.Panel className={`absolute z-10 ${position}-0`}>
            <div className="w-40 bg-white rounded-md border shadow select-none p-1 divide-y">
              <div className="py-[3px]">
                <button
                  onClick={(e) => handleSetEditModal(e)}
                  className="transition-colors duration-75 flex w-full items-center rounded-md px-2.5 py-2 text-sm space-x-2.5 text-slate-500 hover:bg-blue-500 hover:text-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    width={15}
                    viewBox="0 0 512 512"
                  >
                    <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
                  </svg>
                  <h2 className="leading-none text-sm ">Edit</h2>
                </button>
              </div>
              <div className="py-[3px]">
                <Popconfirm
                  style={{ color: 'red' }}
                  okText="Delete"
                  cancelText="Cancel"
                  placement="bottom"
                  title="Are you sure you want to delete this task?"
                  onConfirm={(e) => handleDelete(e, taskId)}
                >
                  <button className="transition-colors duration-75 flex w-full items-center rounded-md px-2.5 py-2 text-sm space-x-2 text-slate-500 hover:bg-red-500 hover:text-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      width={15}
                      viewBox="0 0 448 512"
                    >
                      <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                    </svg>

                    <h2 className="leading-none text-sm ">Delete</h2>
                  </button>
                </Popconfirm>
              </div>
            </div>
          </Popover.Panel>
        </Popover>
      )}

      <AddTaskModal
        isAddTaskModalOpen={isEditTaskModalOpen}
        setAddTaskModal={setEditTaskModal}
        projectId={projectId}
        taskId={taskId}
        edit={true}
        onCreate={onCreate}
        deliverables={deliverables}
        tasks={tasks}
        members={members}
        qualityAssurances={qualityAssurances}
        leader={leader}
        isWaterFall={isWaterFall}
      />
    </>
  );
};

export default DropdownMenu;
