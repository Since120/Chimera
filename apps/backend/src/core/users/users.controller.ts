import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth';
import { UpdateUserProfileDto } from 'shared-types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the current user's profile
   */
  @Get('me')
  async getCurrentUser(@Req() req) {
    return req.user;
  }

  /**
   * Get a user by ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  /**
   * Update the current user's profile
   */
  @Patch('me')
  async updateCurrentUser(
    @Req() req,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(req.user.id, updateDto);
  }
}
