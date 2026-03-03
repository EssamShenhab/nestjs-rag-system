import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileValidationPipe } from './pipes/upload-file-validation.pipe';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload/:project_id')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('project_id') project_id: string,
    @UploadedFile(UploadFileValidationPipe) file: Express.Multer.File,
  ) {
    return this.documentsService.uploadFile(file, project_id);
  }

  // @Get()
  // findAll() {
  //   return this.documentsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.documentsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateDocumentDto: UploadDocumentDto,
  // ) {
  //   return this.documentsService.update(+id, updateDocumentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.documentsService.remove(+id);
  // }
}
