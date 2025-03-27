import Joi from "joi";
import { FastifyInstance } from 'fastify';
import { VehicleValuation } from "@app/models/vehicle-valuation";
import { VehicleValuationRequest } from "@app/routes/valuation/types/vehicle-valuation-request";
import { validateSpec } from '@app/utils/spec.validator';
import { fetchValuation } from "@app/services/providers";
import { ValuationResult } from "../types/valuation";

const spec = Joi.object({
  vrm: Joi.string().trim().min(1).max(7).required(),
  mileage: Joi.number().positive().required(),
});

export async function createService(
  request: VehicleValuationRequest & { vrm: string}, 
  fastify: FastifyInstance,
): Promise<ValuationResult> {
  const data = validateSpec(spec, request);
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);

    const existingValuation = await valuationRepository.findOne({ 
    where: { vrm: data.vrm } 
  });
  
  if (existingValuation) {
    return existingValuation;
  }

    try {
      const valuationResponse = await fetchValuation(data);

      await valuationRepository.insert(valuationResponse);
      fastify.log.info('Valuation created: ', valuationResponse);
      return valuationResponse;
    } catch (err) {
      if ((err as { code?: string })?.code === 'SQLITE_CONSTRAINT') {
        return await valuationRepository.findOne({ where: { vrm: data.vrm } }) as ValuationResult;
      }
      throw err;
    }
}
