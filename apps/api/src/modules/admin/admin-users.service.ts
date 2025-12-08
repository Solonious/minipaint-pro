import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserListQueryDto, UpdateUserDto } from './dto/user-management.dto';
import { Prisma, User, UserRole } from '@prisma/client';

// Fields to return (exclude sensitive data)
const userSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  emailVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type SafeUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'displayName'
  | 'role'
  | 'emailVerified'
  | 'isActive'
  | 'lastLoginAt'
  | 'createdAt'
  | 'updatedAt'
>;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: UserListQueryDto
  ): Promise<{ data: SafeUser[]; total: number; page: number; pageSize: number }> {
    const {
      page = 1,
      pageSize = 10,
      search,
      role,
      isActive,
      emailVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.UserWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Email verified filter
    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    // Order by
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get paginated results
    const data = await this.prisma.user.findMany({
      where,
      select: userSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string
  ): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent self-demotion from admin
    if (id === currentUserId && dto.role && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot demote yourself from admin');
    }

    // Prevent deactivating self
    if (id === currentUserId && dto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {};

    if (dto.displayName !== undefined) {
      updateData.displayName = dto.displayName;
    }

    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    if (dto.emailVerified !== undefined) {
      updateData.emailVerified = dto.emailVerified;
      // Clear verification token if manually verified
      if (dto.emailVerified) {
        updateData.emailVerificationToken = null;
        updateData.emailVerificationExpires = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  }

  async deactivate(id: string, currentUserId: string): Promise<SafeUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });
  }

  async forcePasswordReset(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Generate password reset token
    const token = this.generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    // In production, you would send an email here
    // For now, just return success message
    return {
      message: `Password reset initiated for ${user.email}. Token expires in 24 hours.`,
    };
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    verifiedUsers: number;
    recentSignups: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, activeUsers, adminCount, verifiedUsers, recentSignups] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        this.prisma.user.count({ where: { emailVerified: true } }),
        this.prisma.user.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      adminCount,
      verifiedUsers,
      recentSignups,
    };
  }

  private generateToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
