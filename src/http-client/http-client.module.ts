import type { CounterType, HistogramType } from '@monkee/small-standards';
import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { HttpClientTemplate } from './http-client-template';
import type { HttpClientType } from './http-client-type';
import type {
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} from './http-client.module-def';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './http-client.module-def';
import { getAllHttpClientsToInit, getHttpClientMeta } from './metadata-storage';

@Module({
  exports: [MODULE_OPTIONS_TOKEN],
})
@Global()
export class HttpClientModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const base = super.forRoot(options);
    const clients = HttpClientModule.createClients();

    base.providers!.push(...clients);
    base.exports = [...clients];

    return base;
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const base = super.forRootAsync(options);
    const clients = HttpClientModule.createClients();

    base.providers!.push(...clients);
    base.exports = [...clients];

    return base;
  }

  private static createClients(): FactoryProvider[] {
    const providers: FactoryProvider[] = [];

    const clients = getAllHttpClientsToInit() as HttpClientType[];

    for (const client of clients) {
      let requestTime: HistogramType | undefined;
      let httpErrors: CounterType | undefined;

      const module: FactoryProvider = {
        inject: [MODULE_OPTIONS_TOKEN],
        useFactory: (options: typeof OPTIONS_TYPE) => {
          if (options.config.prometheusMetrics) {
            if (requestTime === undefined) {
              requestTime = options.dependencies.meterRegistry.createHistogram(
                'http_client_request_time',
                'Http client request time in milliseconds',
                ['id', 'method', 'uri', 'status'],
              );
            }

            if (httpErrors === undefined) {
              httpErrors = options.dependencies.meterRegistry.createCounter(
                'http_client_errors',
                'Http client errors',
                ['id', 'method', 'uri', 'status', 'code'],
              );
            }
          }

          const meta = getHttpClientMeta(client);

          const clientId = meta.id;
          const clientConfig = options.config.clients[clientId];

          if (clientConfig === undefined) {
            throw new Error(
              `[Http client] Client opts for "${clientId}" not found in config`,
            );
          }

          const httpTemplate = new HttpClientTemplate(
            clientId,
            clientConfig,
            requestTime,
            httpErrors,
          );

          // eslint-disable-next-line new-cap
          return new client(httpTemplate);
        },
        provide: client,
      };

      providers.push(module);
    }

    return providers;
  }
}
