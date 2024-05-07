import type { HttpClientMeta } from './metadata-storage';
import { clients, symbol } from './metadata-storage';

export const HttpClient = (meta: HttpClientMeta): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(symbol, meta, target);

    clients.push(target);
  };
};
