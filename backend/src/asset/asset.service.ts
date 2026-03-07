import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const entity = this.assetRepo.create(asset);
    return this.assetRepo.save(entity);
  }

  async getAllProjectAssets(
    asset_project_id: string,
    asset_type: string,
  ): Promise<Asset[]> {
    return this.assetRepo.find({
      where: {
        asset_project_id: Number(asset_project_id),
        asset_type: asset_type,
      },
    });
  }

  async getAssetRecord(
    asset_project_id: string,
    asset_name: string,
  ): Promise<Asset | null> {
    return this.assetRepo.findOne({
      where: {
        asset_project_id: Number(asset_project_id),
        asset_name: asset_name,
      },
    });
  }
  
  async getAssetByUuid(asset_uuid: string): Promise<Asset | null> {
    return this.assetRepo.findOne({
      where: {
        asset_uuid: asset_uuid,
      },
    });
  }
}
