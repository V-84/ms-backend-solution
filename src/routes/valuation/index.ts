import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { fetchService, createService } from '@app/services/valuation';
import { sendSuccessResponse, sendErrorResponse } from '@app/utils/api-response';

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
   try{
    const { vrm } = request.params;

    const result = await fetchService({ vrm }, fastify);
    return sendSuccessResponse(reply, result, 'Valuation fetched successfully');
  } catch (error: unknown) {
    const err = error as Error;
    let message =err?.message || 'An unexpected error occurred';
    let statusCode = 400;
    if(err.name === 'ValuationNotFoundError') statusCode = 404;
    if(err.name === 'QueryError') {
      statusCode = 500;
      message = 'An unexpected error occurred';
    }
    return sendErrorResponse(reply, message, statusCode);
  }
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    try {
      const data = { ...request.body, vrm: request.params.vrm };
      
      const valuation = await createService(data, fastify);
      return sendSuccessResponse(reply, valuation, 'Valuation returned successfully');
    } catch (error: unknown) {
      const err = error as Error;
      const message = err?.message || 'Internal Server Error';
      if(err.name === 'InternalServerError') {
        return sendErrorResponse(reply, 'An unexpected error occurred', 500);
      }

      if(err.name === 'UnavailableProviderError') {
        return sendErrorResponse(reply, 'Valuation Service Unavailable', 503);
      }
      return sendErrorResponse(reply, message, 400);
    }
  });
}
