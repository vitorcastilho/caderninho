import { listInvestmentsAction } from '@/server/actions/investment.actions';
import { InvestmentList } from '@/client/components/investments/InvestmentList';

export default async function InvestmentsPage() {
  const result = await listInvestmentsAction(undefined);

  const investments = result.success ? result.data : [];

  return <InvestmentList initialInvestments={investments} />;
}
