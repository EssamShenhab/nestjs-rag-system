import { BadRequestException, Injectable } from '@nestjs/common';
import { ProjectService } from 'src/project/project.service';
import { join, extname } from 'path';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { ProcessingEnum, ResponseSignal } from 'src/models/enums';
import { ChunkService } from 'src/chunk/chunk.service';
import { AssetsService } from 'src/asset/asset.service';

@Injectable()
export class ProcessService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly chunkService: ChunkService,
    private readonly assetsService: AssetsService,
  ) {}

  private getFileExtension(file_id: string) {
    return extname(file_id);
  }

  private async getFileLoader(project_id: string, file_id: string) {
    const projectPath = await this.projectService.getProjectPath(project_id);
    const filePath = join(projectPath, file_id);
    const fileExtension = this.getFileExtension(file_id);

    if (fileExtension === ProcessingEnum.PDF) {
      return {
        async load() {
          const parser = new PDFParse({ url: filePath });

          const result = await parser.getText();

          return [
            new Document({
              pageContent: result.text.replace(/\s+/g, ' ').trim(),
              metadata: { source: filePath },
            }),
          ];
        },
      };
    }

    if (fileExtension === ProcessingEnum.TXT) {
      return new TextLoader(filePath);
    }

    throw new BadRequestException({
      signal: ResponseSignal.FILE_TYPE_NOT_SUPPORTED,
    });
  }

  async getFileContent(project_id: string, file_id: string) {
    const loader = await this.getFileLoader(project_id, file_id);
    return loader.load();
  }

  async processFileContent(
    file_content: Document[],
    chunk_size: number = 100,
    chunk_overlap: number = 20,
  ) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size,
      chunkOverlap: chunk_overlap,
    });

    const chunks = await textSplitter.splitDocuments(file_content);

    return chunks;
  }

  async processFile(
    project_id: number,
    asset_uuid: string,
    chunk_size = 100,
    chunk_overlap = 20,
  ) {
    const project = await this.projectService.getProjectOrCreateOne(project_id);

    if (!project) {
      throw new BadRequestException({
        signal: ResponseSignal.PROJECT_NOT_FOUND_ERROR,
      });
    }

    const asset = await this.assetsService.getAssetByUuid(asset_uuid);

    if (!asset) {
      throw new BadRequestException({
        signal: ResponseSignal.NO_FILES_ERROR,
      });
    }

    const docs = await this.getFileContent(
      project_id.toString(),
      asset.asset_name,
    );

    const chunks = await this.processFileContent(
      docs,
      chunk_size,
      chunk_overlap,
    );

    if (!chunks.length) {
      throw new BadRequestException({
        signal: ResponseSignal.PROCESSING_FAILED,
      });
    }

    const dbChunks = chunks.map((chunk, index) => ({
      chunk_text: chunk.pageContent,
      chunk_order: index,
      chunk_project_id: project.project_id,
      chunk_asset_id: asset.asset_id,
      chunk_metadata: chunk.metadata ?? {},
    }));

    await this.chunkService.insertManyChunks(dbChunks);

    return chunks.length;
  }
}
