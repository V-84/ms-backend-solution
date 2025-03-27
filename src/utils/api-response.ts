import { FastifyReply } from 'fastify';

export type SuccessResponse<T> = {
  status: 'success';
  message: string;
  data: T;
};

type ErrorResponse = {
  status: 'error';
  message: string;
  error?: {
    code?: string;
    details?: string;
  };
};

export function formatSuccessResponse<T>(data: T, message = 'Operation successful'): SuccessResponse<T> {
  return {
    status: 'success',
    message,
    data
  };
}

export function formatErrorResponse(message: string, error?: ErrorResponse['error']): ErrorResponse {
  return {
    status: 'error',
    message,
    error
  };
}

export function sendSuccessResponse<T>(reply: FastifyReply, data: T, message?: string, statusCode = 200) {
  return reply.code(statusCode).send(formatSuccessResponse(data, message));
}

export function sendErrorResponse(reply: FastifyReply, message: string, statusCode = 400, error?: ErrorResponse['error']) {
  return reply.code(statusCode).send(formatErrorResponse(message, error));
}