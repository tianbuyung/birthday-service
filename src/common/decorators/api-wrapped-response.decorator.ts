import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { createWrappedResponseDto } from '@/common/dto/wrapped-response.dto';

export const ApiWrappedOkResponse = <T>(type: Type<T>, isArray = false) =>
  applyDecorators(
    ApiOkResponse({ type: createWrappedResponseDto(type, isArray) }),
  );

export const ApiWrappedCreatedResponse = <T>(type: Type<T>) =>
  applyDecorators(ApiCreatedResponse({ type: createWrappedResponseDto(type) }));
