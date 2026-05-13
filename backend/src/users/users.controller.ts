import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsersServices } from './users.services';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JWTPayload } from 'src/utils/types';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersServices) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return this.usersService.register(body);
  }
  @Post('/login')
  async login(@Body() body: LoginUserDto) {
    return this.usersService.login(body);
  }
  @Get('/current-user')
  @Roles()
  @UseGuards(AuthGuard)
  async currentUser(@CurrentUser() payload: JWTPayload) {
    return this.usersService.findOne(payload.id);
  }

  @Get()
  @Roles()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @Roles()
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
