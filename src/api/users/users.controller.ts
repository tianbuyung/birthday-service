import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';

import {
  ApiWrappedCreatedResponse,
  ApiWrappedOkResponse,
} from '@/common/decorators/api-wrapped-response.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

const USER_ID_PARAM = {
  name: 'id',
  type: String,
  description: 'User MongoDB ObjectId',
  example: '6634a1f2e4b0c123456789ab',
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiWrappedCreatedResponse(UserResponseDto)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiWrappedOkResponse(UserResponseDto, true)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiParam(USER_ID_PARAM)
  @ApiWrappedOkResponse(UserResponseDto)
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiParam(USER_ID_PARAM)
  @ApiWrappedOkResponse(UserResponseDto)
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam(USER_ID_PARAM)
  @ApiWrappedOkResponse(UserResponseDto)
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usersService.remove(id);
  }
}
