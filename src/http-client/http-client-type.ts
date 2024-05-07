import type { HttpClientTemplate } from './http-client-template';

export type HttpClientType = new (http: HttpClientTemplate) => HttpClientType;
