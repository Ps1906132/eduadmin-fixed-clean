declare class D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch(statements: D1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

declare class D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T>;
  run<T = any>(): Promise<{ results: T[]; success: boolean; duration: number }>;
  all<T = any>(): Promise<{ results: T[]; success: boolean; duration: number }>;
  raw(): Promise<any[]>;
}

declare class KVNamespace {
  get(key: string, options?: { type: 'text' }): Promise<string | null>;
  get(key: string, options: { type: 'json' }): Promise<any>;
  get(key: string, type?: 'text'): Promise<string | null>;
  get(key: string, type: 'json'): Promise<any>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; cursor: string; list_complete: boolean }>;
}

declare interface PagesFunction<Env = any, P extends Record<string, string> = {}, Data extends Record<string, any> = {}> {
  (context: EventContext<Env, P, Data>): Response | Promise<Response>;
}

declare interface EventContext<Env, Params, Data> {
  request: Request;
  env: Env;
  params: Params;
  data: Data;
  next(request: Request): Promise<Response>;
  waitUntil(promise: Promise<any>): void;
}
