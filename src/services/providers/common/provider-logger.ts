import  { FastifyInstance } from 'fastify';
import { ProviderLogs } from "@app/models/provider-logs";
import { ProviderLoggerRequest } from "@app/services/types/provider-logger";

let fastifyInstance: FastifyInstance;

export function initializeLogger(fastify: FastifyInstance) {
  fastifyInstance = fastify;
}

export async function logResponse(request: ProviderLoggerRequest): Promise<void> {
  try {
    if (!fastifyInstance) {
      throw new Error('Logger not initialized. Call initializeLogger first.');
    }
  
    const logRepository = fastifyInstance.orm.getRepository(ProviderLogs);  
    await logRepository.insert(request);
  } catch (_) {
    console.log('unable to log')
  }

}
