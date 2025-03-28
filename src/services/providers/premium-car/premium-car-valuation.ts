import axios from 'axios';
import { XMLParser } from 'fast-xml-parser'
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { PremiumCarValuationResponse } from './types/premium-car-valuation-response';
import { ValuationResult } from '@app/services/types/valuation';
import { logResponse } from '../common/provider-logger';

export async function fetchValuationFromPremiumCarValuation(vrm: string): Promise<ValuationResult> {
  const PROVIDER_NAME = 'PremiumCar';
  const baseURL = 'https://run.mocky.io/v3/463eaf0e-3b29-4443-94db-d3ef175c6767';
  const start = Date.now();
  try {
    const response = await axios.get(
      `${baseURL}/valueCar/?vrm=${vrm}`,
      {
        headers: {
          'Accept': 'application/xml'
        }
      }
    );
    const parser = new XMLParser();
    let jsonResponse:PremiumCarValuationResponse | null;
    try {
      jsonResponse  = parser.parse(response.data);
    } catch (_) {
      jsonResponse = null;
    }

    const timeTaken = Date.now() - start;

    await logResponse({
      requestDate: new Date(),
      requestDuration: timeTaken,
      requestUrl: `${baseURL}/valueCar/?vrm=${vrm}`,
      responseCode: response.status,
      vrm,
      providerName: PROVIDER_NAME,
    });

    if(!jsonResponse) {
      throw new Error('Invalid response from PremiumCar');
    }
    const valuation = new VehicleValuation();

    valuation.vrm = vrm;
    valuation.lowestValue = Math.min(jsonResponse.root.ValuationPrivateSaleMinimum, jsonResponse.root.ValuationDealershipMinimum);
    valuation.highestValue = Math.max(jsonResponse.root.ValuationPrivateSaleMaximum, jsonResponse.root.ValuationDealershipMaximum);
    valuation.provider = PROVIDER_NAME;

    return valuation;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      await logResponse({
        requestDate: new Date(),
        requestDuration: Date.now() - start,
        requestUrl: `${baseURL}/valueCar?=${vrm}`,
        responseCode: error.response?.status,
        errorCode: error.code,
        errorMessage: error.message,
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
