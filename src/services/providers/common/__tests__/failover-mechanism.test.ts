import { failoverMechanism } from '../failover-mechanism';

describe('ResponseTracker', () => {
  let responseTracker: Awaited<ReturnType<typeof failoverMechanism>>;

  beforeEach(async () => {
    responseTracker = await failoverMechanism();
  });

  it('should initialize metrics with zero', () => {
    const { failures, successes } = responseTracker.getMetrics();

    expect(failures).toBe(0);
    expect(successes).toBe(0);
  });


  it('should record successes correctly', () => {
    responseTracker.recordSuccess();
    responseTracker.recordSuccess();
    responseTracker.recordSuccess();
    responseTracker.recordSuccess();
    responseTracker.recordSuccess();
    const { successes } = responseTracker.getMetrics();


    // No failover should be triggered
    expect(successes).toBe(5);
  });

  it('should record failures correctly', () => {
    responseTracker.recordFailure();
    responseTracker.recordFailure();
    responseTracker.recordFailure();
    responseTracker.recordFailure();
    const { failures } = responseTracker.getMetrics();

    expect(failures).toBe(4);
  });

  it('should trigger failover when failure rate exceeds 50%', () => {
    responseTracker.resetMetrics();

    responseTracker.recordFailure();
    responseTracker.recordFailure();
    responseTracker.recordFailure(); // 3 failures
    responseTracker.recordSuccess(); // 1 success

    // Failure rate = 3/4 = 0.75 > 0.5 threshold → Failover should be triggered
    expect(responseTracker.shouldUseFallback()).toBe(true);
  });

});