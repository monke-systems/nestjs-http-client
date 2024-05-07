export type HttpClientMeta = {
  id: string;
};

export const clients: object[] = [];
export const symbol = Symbol('http-client');

export const getAllHttpClientsToInit = (): object[] => {
  return clients;
};

export const getHttpClientMeta = (target: object): HttpClientMeta => {
  return Reflect.getMetadata(symbol, target);
};
