import { fastify } from '~root/test/fastify';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';
import axios from 'axios';
import { MockInstance } from 'vitest';
import { premiumCarValuationMock, superCarValuationMock, SuperCarValudationResponseData } from './mocks';
import { SuccessResponse } from '@app/utils/api-response';
import { ValuationResult } from '@app/services/types/valuation';

describe('ValuationController (e2e)', () => {
  let axiosStub: MockInstance;
  beforeEach(() => {
    // Mock the external valuation function
    axiosStub = vi
        .spyOn(axios, 'get')
        .mockImplementation(async () => vi.fn);

    // Mock the repository methods to avoid database interaction
    vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
      insert: vi.fn().mockResolvedValue({}), // Mock insert operation
      findOne: vi.fn().mockResolvedValue(null), // Mock find operation
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request', async () => {
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: superCarValuationMock,
      });
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });

    it('should return with valid response body', async () => {
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: superCarValuationMock,
      });
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      const body = res.json() as SuccessResponse<ValuationResult>;
      expect(res.statusCode).toStrictEqual(200);
      expect(body.status).toStrictEqual('success');
      expect(body.message).toStrictEqual('Valuation returned successfully');
      expect(body.data).toStrictEqual(SuperCarValudationResponseData);
    });

    it('should return 503 if service cant contact both provider', async () => {
      axiosStub.mockRejectedValue(new Error('provider unavailable'));
      const requestBody: VehicleValuationRequest = {
        mileage: 300,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(503);
      expect(res.json().message).toStrictEqual('Valuation Service Unavailable');
    });

    it('should return secondary provider', async () => {
      axiosStub.mockRejectedValueOnce(new Error('super car unavailable'));
      axiosStub.mockResolvedValueOnce({
        data: premiumCarValuationMock,
      });

      const requestBody: VehicleValuationRequest = {
        mileage: 300,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });

  });


  describe('GET /valuations/', () => {
    it('should return 200 with valuation data when found', async () => {
      const mockValuation = {
        vrm: 'ABC123',
        lowestValue: 11500,
        highestValue: 12750,
        provider: 'SuperCar',
      };
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(mockValuation),
      } as any);
    
      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });
  
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        status: 'success',
        message: 'Valuation fetched successfully',
        data: {
          vrm: 'ABC123',
          lowestValue: 11500,
          highestValue: 12750,
          provider: 'SuperCar'
        }
      });
    });

    it('should return with valid response body for fetch', async () => {
      const mockValuation = {
        vrm: 'ABC123',
        lowestValue: 22350,
        highestValue: 24750,
        provider: 'SuperCar',
      };
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(mockValuation),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });

      const body = res.json() as SuccessResponse<ValuationResult>;
      expect(res.statusCode).toStrictEqual(200);
      expect(body.status).toStrictEqual('success');
      expect(body.message).toStrictEqual('Valuation fetched successfully');
      expect(body.data).toStrictEqual(SuperCarValudationResponseData);
    });


    it('should return 400 for invalid VRM format', async () => {
      const res = await fastify.inject({
        url: '/valuations/INVALID-VRM-TOO-LONG',
        method: 'GET',
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        status: 'error',
        message: 'Validation error: vrm length must be less than or equal to 7 characters long'
      });
    });

    it('should return 404 when valuation not found', async () => {
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/UNKNOWN',
        method: 'GET',
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({
        status: 'error',
        message: 'Valuation for VRM UNKNOWN not found'
      });
    });

    it('should return valuation with correct structure for legacy records', async () => {
      const legacyValuation = {
        vrm: 'OLD123',
        lowestValue: 11500,
        highestValue: 12750,
      };
  
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(legacyValuation),
      } as any);
      const res = await fastify.inject({
        url: '/valuations/OLD123',
        method: 'GET',
      });
  
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        status: 'success',
        message: 'Valuation fetched successfully',
        data: {
          vrm: 'OLD123',
          lowestValue: 11500, 
          highestValue: 12750,
          provider: 'Unknown', // Default for legacy
        }
      });
    });
  });
});
