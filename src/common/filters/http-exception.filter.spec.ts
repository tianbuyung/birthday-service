import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockReply: { status: jest.Mock; send: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockReply),
        getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('sends the HTTP status and string message from the exception', () => {
    const exception = new HttpException('User not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        path: '/api/test',
        timestamp: expect.any(String),
      }),
    );
  });

  it('extracts the message array from an object response (ValidationPipe error)', () => {
    const exception = new HttpException(
      {
        message: ['name must not be empty', 'email must be an email'],
        statusCode: 400,
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['name must not be empty', 'email must be an email'],
      }),
    );
  });
});
