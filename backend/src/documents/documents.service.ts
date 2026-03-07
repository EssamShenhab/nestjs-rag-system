import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { ProjectService } from 'src/project/project.service';
import { AssetsService } from 'src/asset/asset.service';
import { ResponseSignal } from 'src/models/enums';
import { AssetTypeEnum } from 'src/models/enums/asset-type.enum';

@Injectable()
export class DocumentsService {
  protected baseDir: string;
  protected filesDir: string;
  protected databaseDir: string;

  constructor(
    private readonly projectService: ProjectService,
    private readonly assetsService: AssetsService,
  ) {
    this.baseDir = process.cwd();

    this.filesDir = path.join(this.baseDir, 'src', 'assets', 'files');

    this.databaseDir = path.join(this.baseDir, 'src', 'assets', 'database');
  }

  uploadFile(file: Express.Multer.File, project_id: string) {
    return {
      project_id,
      file_id: file.filename,
    };
  }

  async getDatabasePath(dbName: string): Promise<string> {
    const databasePath = path.join(this.databaseDir, dbName);

    await fs.mkdir(databasePath, { recursive: true });

    return databasePath;
  }

  async generateUniqueFilepath(
    origFileName: string,
    project_id: string,
  ): Promise<[string, string]> {
    let randomKey = this.generateRandomString();

    const projectPath = await this.projectService.getProjectPath(project_id);

    const cleanedFileName = this.getCleanFileName(origFileName);

    let newFileName = `${randomKey}_${cleanedFileName}`;

    let newFilePath = path.join(projectPath, newFileName);

    while (fsSync.existsSync(newFilePath)) {
      randomKey = this.generateRandomString();

      newFileName = `${randomKey}_${cleanedFileName}`;

      newFilePath = path.join(projectPath, newFileName);
    }

    return [newFilePath, newFileName];
  }

  getCleanFileName(origFileName: string): string {
    let cleanedFileName = origFileName.trim();

    cleanedFileName = cleanedFileName.replace(/[^\w.]/g, '');

    cleanedFileName = cleanedFileName.replace(/ /g, '_');

    return cleanedFileName;
  }

  generateRandomString(length: number = 12): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  async ingestDocument(file: Express.Multer.File, project_id: number) {
    const project = await this.projectService.getProjectOrCreateOne(project_id);

    if (!project) {
      throw new Error('Project creation failed');
    }

    const file_path = file.path;
    const file_name = file.filename;

    const file_size = fsSync.statSync(file_path).size;

    const asset = await this.assetsService.createAsset({
      asset_project_id: project.project_id,
      asset_type: AssetTypeEnum.FILE,
      asset_name: file_name,
      asset_size: file_size,
    });

    return {
      signal: ResponseSignal.FILE_UPLOAD_SUCCESS,
      file_id: asset.asset_uuid,
    };
  }
}
