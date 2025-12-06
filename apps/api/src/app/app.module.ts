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
import { MiniatureImagesModule } from '../modules/miniature-images/miniature-images.module';
import { TutorialsModule } from '../modules/tutorials/tutorials.module';
import { ColorSchemesModule } from '../modules/color-schemes/color-schemes.module';

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
    MiniatureImagesModule,
    TutorialsModule,
    ColorSchemesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
