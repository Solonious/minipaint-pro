import { Module } from '@nestjs/common';
import { UnitTemplatesService } from './unit-templates.service';
import { UnitTemplatesController } from './unit-templates.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UnitTemplatesController],
  providers: [UnitTemplatesService],
  exports: [UnitTemplatesService],
})
export class UnitTemplatesModule {}
