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
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/config.interface';
import { UploadFileValidationPipe } from './pipes/upload-file-validation.pipe';

@ApiTags('api_v1')
@Controller('api/v1')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @Post('upload/:project_id')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('project_id') project_id: string,
    @Body() body: UploadDocumentDto,
    @UploadedFile(UploadFileValidationPipe) file: Express.Multer.File) {
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
