import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileValidationPipe } from './pipes/upload-file-validation.pipe';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload/:project_id')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('project_id', ParseIntPipe) project_id: number,
    @UploadedFile(UploadFileValidationPipe) file: Express.Multer.File,
  ) {
    return this.documentsService.ingestDocument(file, project_id);
  }
}
