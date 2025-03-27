import { fetchValuationFromPremiumCarValuation } from './premium-car/premium-car-valuation'
import { fetchValuationFromSuperCarValuation } from './super-car/super-car-valuation';

import { failoverMechanism } from './common/failover-mechanism';
import { ValuationResult } from '../types/valuation';

export const fetchValuation = async (data: { vrm: string, mileage: number }): Promise<ValuationResult>  => {
  const failoverManager = await failoverMechanism();

  if(failoverManager.shouldUseFallback()) {
    return await fetchValuationFromPremiumCarValuation(data.vrm);
  }

  try {
    const valuation = await fetchValuationFromSuperCarValuation(data);
    failoverManager.recordSuccess();

    return valuation;
  } catch (error) {
    failoverManager.recordFailure();
    const valuation = await fetchValuationFromPremiumCarValuation(data.vrm);
    return valuation;
  }
}