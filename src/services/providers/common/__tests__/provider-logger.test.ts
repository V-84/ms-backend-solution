import { FastifyInstance } from 'fastify';
import { ProviderLogs } from '@app/models/provider-logs';
import { ProviderLoggerRequest } from '@app/services/types/provider-logger';
import { initializeLogger, logResponse } from '../provider-logger';

describe('logResponse', () => {
  let fastifyMock: Partial<FastifyInstance>;
  let insertMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    insertMock = vi.fn().mockResolvedValue(undefined);

    fastifyMock = {
      orm: {
        getRepository: vi.fn().mockReturnValue({
          insert: insertMock,
        }),
      },
    } as unknown as FastifyInstance;

    initializeLogger(fastifyMock as FastifyInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  it('should insert log into repository when initialized', async () => {
    const request: ProviderLoggerRequest = {
      vrm: 'ABC124',
      providerName: 'Test',
      requestUrl: 'http://test.com',
      requestDate: new Date(),
      requestDuration: 100,
      responseCode: 200,
    }

    await logResponse(request);

    expect(fastifyMock?.orm?.getRepository).toHaveBeenCalledWith(ProviderLogs);
    expect(insertMock).toHaveBeenCalledWith(request);
  });
});