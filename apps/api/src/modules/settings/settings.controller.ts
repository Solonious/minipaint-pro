import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import * as crypto from 'crypto';
import { SettingsService } from './settings.service';
import { UpdateProfileDto, ProfileResponseDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { REFRESH_TOKEN_COOKIE } from '../auth/constants/auth.constants';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ==================== Profile ====================

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  getProfile(@CurrentUser('id') userId: string): Promise<ProfileResponseDto> {
    return this.settingsService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.settingsService.updateProfile(userId, dto);
  }

  // ==================== Security ====================

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  getActiveSessions(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const currentTokenHash = refreshToken
      ? crypto.createHash('sha256').update(refreshToken).digest('hex')
      : undefined;
    return this.settingsService.getActiveSessions(userId, currentTokenHash);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.settingsService.revokeSession(userId, sessionId);
  }

  // ==================== Preferences ====================

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences' })
  getPreferences(@CurrentUser('id') userId: string) {
    return this.settingsService.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.settingsService.updatePreferences(userId, dto);
  }

  // ==================== Account ====================

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 400, description: 'Password is incorrect' })
  deleteAccount(
    @CurrentUser('id') userId: string,
    @Body('password') password: string,
  ) {
    return this.settingsService.deleteAccount(userId, password);
  }
}
