import { listIncomeSourcesAction } from '@/server/actions/income-source.actions';
import { IncomeSourceList } from '@/client/components/income-sources/IncomeSourceList';

export default async function IncomeSourcesPage() {
  const result = await listIncomeSourcesAction(undefined);

  const incomeSources = result.success ? result.data : [];

  return <IncomeSourceList initialIncomeSources={incomeSources} />;
}
