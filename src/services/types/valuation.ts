import { FailoverTrackingData } from "./failover";

export type ValuationResult = {
  vrm: string;
  lowestValue: number;
  highestValue: number;
  provider: string;
};


export type FailoverTracker = {
  recordSuccess: () => void;
  getMetrics: () => FailoverTrackingData;
  resetMetrics: () => FailoverTrackingData;
  recordFailure: () => void;
  shouldUseFallback: () => boolean;
};

export type SuperCarRequest = {
  vrm: string, 
  mileage: number
};
