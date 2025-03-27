import { FailoverTracker } from '@app/services/types/valuation';
import { cache, cacheKey } from './cache';
import { FailoverTrackingData } from '@app/services/types/failover';


export async function failoverMechanism (): Promise<FailoverTracker> {  
  
  const getFailoverData = (): FailoverTrackingData => {
    let data = cache.get<FailoverTrackingData>(cacheKey);

    if (!data) {
      data = { failures: 0, successes: 0 };
      cache.set(cacheKey, data);
    }

    return data;
  }

  const resetFailoverData = (): FailoverTrackingData => {
    const data = { failures: 0, successes: 0 };
    cache.set(cacheKey, data);

    return data;
  }

  const getFailureRate = (): number => {
    const { failures, successes } = getFailoverData();
    const totalRequests = failures + successes
    return totalRequests > 0 ? failures / totalRequests : 0;
  };

  return {
    getMetrics: () => getFailoverData(),
    resetMetrics: () => resetFailoverData(),
    recordSuccess: () => {
      const { failures, successes } = getFailoverData();
      cache.set(cacheKey, { failures, successes: successes + 1 });
    },
    recordFailure: () => {
      const { failures, successes } = getFailoverData();
      cache.set(cacheKey, { failures: failures + 1, successes });
    },
    shouldUseFallback: () => {
      const failureRateThreshold = 0.5;
      return getFailureRate() >= failureRateThreshold;
    },
  };
};