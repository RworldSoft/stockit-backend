import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetCurrentUserId } from '@common/decorators/get-current-user-id.decorator';
import { UpdateProfileDto } from './dto/user.dto';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles(UserRole.OWNER, UserRole.SALE_OPERATOR, UserRole.STORE_MANAGER)
  @ApiOperation({ description: 'Get Current User' })
  async getCurrentUser(@GetCurrentUserId() userId: string) {
    return this.userService.getCurrentUser(userId);
  }

  @Put('profile')
  @Roles(UserRole.OWNER, UserRole.SALE_OPERATOR, UserRole.STORE_MANAGER)
  @ApiOperation({ description: 'Update User Profile' })
  async updateUserProfile(
    @GetCurrentUserId() userId: string,

    @Body() dto: UpdateProfileDto, 
  ) {
    return this.userService.updateUserProfile(userId, dto);
  }
}
