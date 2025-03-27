import axios, { AxiosError } from 'axios';

import { VehicleValuation } from '@app/models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';
import { ValuationResult, SuperCarRequest } from '@app/services/types/valuation';
import { logResponse } from '../common/provider-logger';


export async function fetchValuationFromSuperCarValuation(data: SuperCarRequest): Promise<ValuationResult>{
    const { vrm, mileage } = data;
    const baseURL = 'https://run.mocky.io/v3/62aa0630-5aaa-4665-bc71-875941d6f482';
    const start = Date.now();
    const PROVIDER_NAME = 'SuperCar';

    try {
      const response = await axios.get<SuperCarValuationResponse>(
        `${baseURL}/valuations/${vrm}?mileage=${mileage}`,
      );

      const timeTaken = Date.now() - start;
      await logResponse({
        requestDate: new Date(),
        requestDuration: timeTaken,
        requestUrl: `${baseURL}/valuations/${vrm}`,
        responseCode: response.status,
        vrm,
        providerName: PROVIDER_NAME,
      });
    
      const valuation = new VehicleValuation();
    
      valuation.vrm = vrm;
      valuation.lowestValue = response.data.valuation?.lowerValue;
      valuation.highestValue = response.data.valuation?.upperValue;
      valuation.provider = 'SuperCar';
      return valuation;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError;
        await logResponse({
          requestDate: new Date(),
          requestDuration: Date.now() - start,
          requestUrl: `${baseURL}/valuations/${vrm}`,
          responseCode: err.response?.status!,
          errorCode: err.code,
          errorMessage: err.message,
          vrm,
          providerName: PROVIDER_NAME,
        });
      }
      if (error instanceof Error) {
        error.name = 'UnavailableProviderError';
      }
      throw error;
    }
}
