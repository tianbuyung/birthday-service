import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('wraps the response body in { data, statusCode, timestamp }', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ id: '123', name: 'John' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.data).toEqual({ id: '123', name: 'John' });
      expect(result.statusCode).toBe(201);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      done();
    });
  });

  it('uses the response statusCode from the Fastify reply', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(null),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.statusCode).toBe(200);
      done();
    });
  });
});
