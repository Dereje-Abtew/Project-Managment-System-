import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import UserForm from '@/forms/UserForm';
import configPage from './config';

export default function UserCreate() {
  const config = {
    ...configPage,
  };

  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={UserForm} />
    </ErpLayout>
  );
}
