import { BadRequestException, Injectable } from '@nestjs/common';
import { ProjectService } from 'src/project/project.service';
import { join, extname } from 'path';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from '@langchain/core/documents';


@Injectable()
export class ProcessService {
  constructor(private readonly projectService: ProjectService) {}

  private getFileExtension(file_id: string) {
    return extname(file_id);
  }

  private async getFileLoader(project_id: string, file_id: string) {
    const projectPath = await this.projectService.getProjectPath(project_id);
    const filePath = join(projectPath, file_id);
    const fileExtension = this.getFileExtension(file_id);

    if (fileExtension === '.pdf') {
      return new PDFLoader(filePath);
    }

    if (fileExtension === '.txt') {
      return new TextLoader(filePath);
    }

    throw new BadRequestException({
      signal: 'UNSUPPORTED_FILE_TYPE',
    });
  }

  async getFileContent(
    project_id: string,
    file_id: string,
  ) {
    const loader = await this.getFileLoader(project_id, file_id);
    return loader.load();
  }

  async processFileContent(file_content: Document[], chunk_size:number = 100, chunk_overlap:number = 20){
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size,
      chunkOverlap: chunk_overlap,
    });

    const chunks = await textSplitter.splitDocuments(file_content);

    return chunks;
  }

}
