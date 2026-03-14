import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProjectService } from 'src/project/project.service';
import { join, extname } from 'path';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { ProcessingEnum, ResponseSignal } from 'src/models/enums';
import { ChunkService } from 'src/chunk/chunk.service';
import { AssetsService } from 'src/asset/asset.service';
import { NlpService } from 'src/nlp/nlp.service';
import { AssetTypeEnum } from 'src/models/enums/asset-type.enum';

@Injectable()
export class ProcessService {
  private readonly logger = new Logger(ProcessService.name);
  constructor(
    private readonly projectService: ProjectService,
    private readonly chunkService: ChunkService,
    private readonly assetsService: AssetsService,
    private readonly nlpService: NlpService,
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

    return textSplitter.splitDocuments(file_content);
  }

  async processFiles(
    project_id: number,
    chunk_size = 100,
    chunk_overlap = 20,
    do_reset = 0,
    file_id?: string,
  ): Promise<{ inserted_chunks: number; processed_files: number }> {
    const project = await this.projectService.getProjectOrCreateOne(project_id);
    if (!project) {
      throw new BadRequestException({
        signal: ResponseSignal.PROJECT_NOT_FOUND_ERROR,
      });
    }

    if (do_reset === 1) {
      await this.nlpService.resetVectorDbCollection(project);
      await this.chunkService.deleteChunksByProjectId(project.project_id);
    }

    let assetsToProcess: { asset_id: number; asset_name: string }[];

    if (file_id) {
      const asset = await this.assetsService.getAssetRecord(
        project_id.toString(),
        file_id,
      );
      if (!asset) {
        throw new BadRequestException({ signal: ResponseSignal.FILE_ID_ERROR });
      }
      assetsToProcess = [
        { asset_id: asset.asset_id, asset_name: asset.asset_name },
      ];
    } else {
      const assets = await this.assetsService.getAllProjectAssets(
        project_id.toString(),
        AssetTypeEnum.FILE,
      );
      if (!assets || assets.length === 0) {
        throw new BadRequestException({
          signal: ResponseSignal.NO_FILES_ERROR,
        });
      }
      assetsToProcess = assets.map((a) => ({
        asset_id: a.asset_id,
        asset_name: a.asset_name,
      }));
    }

    let inserted_chunks = 0;
    let processed_files = 0;

    for (const asset of assetsToProcess) {
      let docs: Document[];

      try {
        docs = await this.getFileContent(
          project_id.toString(),
          asset.asset_name,
        );
      } catch (err) {
        this.logger.error(
          `Error while processing file: ${asset.asset_name} — ${err}`,
        );
        continue;
      }

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
        chunk_order: index + 1,
        chunk_project_id: project.project_id,
        chunk_asset_id: asset.asset_id,
        chunk_metadata: chunk.metadata ?? {},
      }));

      await this.chunkService.insertManyChunks(dbChunks);
      inserted_chunks += chunks.length;
      processed_files += 1;
    }

    return { inserted_chunks, processed_files };
  }
}
