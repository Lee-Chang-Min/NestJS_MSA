import {
  Controller,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
  // Query,
  // HttpStatus,
  // HttpCode,
  // SerializeOptions,
} from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiCreatedResponse,
//   ApiOkResponse,
//   ApiParam,
//   ApiTags,
// } from '@nestjs/swagger';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
