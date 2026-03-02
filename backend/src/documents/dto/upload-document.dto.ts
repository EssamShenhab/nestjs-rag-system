import { IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  project_id: string;
}
