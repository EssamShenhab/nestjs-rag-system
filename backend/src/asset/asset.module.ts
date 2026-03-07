import { Module } from '@nestjs/common';
import { AssetsService } from './asset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetModule {}
