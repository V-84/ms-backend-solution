export type ProviderLoggerRequest = {
  vrm: string;
  providerName: string;
  requestUrl: string;
  requestDuration: number;
  responseCode: number;
  requestDate: Date;
  errorMessage?: string;
  errorCode?: string;
};