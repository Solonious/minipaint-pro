import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { MiniaturesModule } from '../modules/miniatures/miniatures.module';
import { ArmiesModule } from '../modules/armies/armies.module';
import { PaintsModule } from '../modules/paints/paints.module';
import { RecipesModule } from '../modules/recipes/recipes.module';
import { ProgressModule } from '../modules/progress/progress.module';
import { AdminModule } from '../modules/admin/admin.module';
import { MiniatureImagesModule } from '../modules/miniature-images/miniature-images.module';
import { TutorialsModule } from '../modules/tutorials/tutorials.module';
import { ColorSchemesModule } from '../modules/color-schemes/color-schemes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    MiniaturesModule,
    ArmiesModule,
    PaintsModule,
    RecipesModule,
    ProgressModule,
    AdminModule,
    MiniatureImagesModule,
    TutorialsModule,
    ColorSchemesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards - order matters!
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
