import Joi from "joi";
import { FastifyInstance } from 'fastify';
import { VehicleValuation } from "@app/models/vehicle-valuation";
import { validateSpec } from '@app/utils/spec.validator';

const spec = Joi.object({
  vrm: Joi.string().trim().max(7).required()
});

export async function fetchService(request: { vrm: string}, fastify: FastifyInstance): Promise<VehicleValuation | null> {
  const { vrm } = validateSpec(spec, request);
  const valuationRepository = fastify.orm.getRepository(VehicleValuation);
  const valuation = await valuationRepository.findOneBy({ vrm });

  if(!valuation) {
    const err = new Error(`Valuation for VRM ${vrm} not found`);
    err.name = 'ValuationNotFoundError';
    throw err;
  }

  if(!valuation.provider) {
    valuation.provider = 'Unknown';
  }

  return valuation
}
