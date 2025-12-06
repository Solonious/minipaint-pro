import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MiniaturesModule } from '../modules/miniatures/miniatures.module';
import { ArmiesModule } from '../modules/armies/armies.module';
import { PaintsModule } from '../modules/paints/paints.module';
import { RecipesModule } from '../modules/recipes/recipes.module';
import { ProgressModule } from '../modules/progress/progress.module';
import { AdminModule } from '../modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    MiniaturesModule,
    ArmiesModule,
    PaintsModule,
    RecipesModule,
    ProgressModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
