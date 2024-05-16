import * as http from 'node:http';
import * as https from 'node:https';
import { CounterType, HistogramType } from '@monkee/small-standards';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios';
import axios, { AxiosError } from 'axios';
import { HttpClientTemplateOpts } from './config';

export class HttpClientTemplate {
  private httpClient: AxiosInstance;

  constructor(
    private id: string,
    private opts: HttpClientTemplateOpts,
    private requestTime?: HistogramType,
    private errorsCounter?: CounterType,
  ) {
    const axiosOpts: CreateAxiosDefaults = {
      baseURL: opts.baseUrl,
      timeout: opts.timeout,
    };

    if (opts.keepAlive) {
      axiosOpts.httpAgent = new http.Agent({
        keepAlive: true,
      });

      axiosOpts.httpsAgent = new https.Agent({
        keepAlive: true,
      });
    }

    this.httpClient = axios.create(axiosOpts);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request<T = any>(
    config: HttpClientRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const start = Date.now();

    try {
      const response = await this.httpClient.request<T>(config);

      const end = Date.now();

      this.requestTime?.observe((end - start) / 1000, {
        id: this.id,
        method: config.method?.toUpperCase() ?? 'unknown',
        uri: config.url ?? 'unknown',
        status: response.status.toString(),
      });

      return response;
    } catch (error) {
      let status = 'unknown';
      let code = 'unknown';

      if (error instanceof AxiosError) {
        status = error.response?.status?.toString() ?? 'unknown';
        code = error.code ?? 'unknown';
      }

      const commonLabels = {
        id: this.id,
        method: config.method?.toUpperCase() ?? 'unknown',
        uri: config.url ?? 'unknown',
        status,
      };

      this.errorsCounter?.increment(1, {
        ...commonLabels,
        code,
      });
      this.requestTime?.observe(Date.now() - start, commonLabels);

      throw error;
    }
  }
}

export type HttpClientRequestConfig = {
  metricsId: string;
} & AxiosRequestConfig;
