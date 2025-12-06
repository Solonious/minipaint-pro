import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto';
import {
  JwtPayload,
  TokenPair,
  AuthenticatedUser,
} from './interfaces/jwt-payload.interface';
import { BCRYPT_ROUNDS, TOKEN_EXPIRY } from './constants/auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(
      Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION,
    );

    await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        dto.email.toLowerCase(),
        emailVerificationToken,
      );
    } catch {
      this.logger.warn(
        `Failed to send verification email to ${dto.email}. User can request a new one.`,
      );
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokenPair(user.id, user.email, user.role, userAgent, ipAddress);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      // Token reuse detected - revoke all tokens for this user
      await this.logoutAll(storedToken.userId);
      throw new UnauthorizedException(
        'Token reuse detected. All sessions have been terminated.',
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Revoke the old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new token pair
    return this.generateTokenPair(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      userAgent,
      ipAddress,
    );
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new one.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return {
        message:
          'If an unverified account exists with this email, a verification email has been sent.',
      };
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(
      Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        emailVerificationToken,
      );
    } catch {
      this.logger.warn(`Failed to resend verification email to ${email}`);
    }

    return {
      message:
        'If an unverified account exists with this email, a verification email has been sent.',
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(
      Date.now() + TOKEN_EXPIRY.PASSWORD_RESET,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        passwordResetToken,
      );
    } catch {
      this.logger.warn(`Failed to send password reset email to ${email}`);
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: dto.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      user.passwordResetExpires &&
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Update password and revoke all refresh tokens (logout from all devices)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }

  async getMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role: role as JwtPayload['role'],
    };

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'fallback-secret',
        expiresIn: '15m',
      },
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);

    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expiresAt = this.parseExpiryToDate(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToDate(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
