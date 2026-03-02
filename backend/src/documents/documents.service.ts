import { Injectable } from '@nestjs/common';
// import { CreateDocumentDto } from './dto/create-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  uploadFile(file: Express.Multer.File, project_id: string) {
    return {
      originalname: file.originalname,
      project_id: project_id,
    };
  }

  findAll() {
    return `This action returns all documents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UploadDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
