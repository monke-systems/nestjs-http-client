import type { MeterRegistryType } from '@monkee/small-standards';

export type HttpClientTemplateOpts = {
  baseUrl: string;
  timeout: number;
  keepAlive: boolean;
};

export type HttpClientModuleConfig = {
  prometheusMetrics: boolean;
  clients: Record<string, HttpClientTemplateOpts>;
};

export type HttpClientModuleOpts = {
  config: HttpClientModuleConfig;
  dependencies: {
    meterRegistry: MeterRegistryType;
  };
};
