import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import RoleForm from '@/modules/RoleModule/Forms/RoleForm';

export default function CreateRoleModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={RoleForm} />
    </ErpLayout>
  );
}
