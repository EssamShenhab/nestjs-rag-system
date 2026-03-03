import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessRequestDto } from './dto/process-request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('process/:project_id')
async process_endpoint(
  @Param('project_id') project_id: string,
  @Body() processRequestDto: ProcessRequestDto,
) {
  const { file_id, chunk_size, overlap_size } = processRequestDto;

  const fileContent = await this.processService.getFileContent(
    project_id,
    file_id,
  );

  const fileChunks = await this.processService.processFileContent(
    fileContent,
    chunk_size,
    overlap_size,
  );

  if (!fileChunks || fileChunks.length === 0) {
    throw new BadRequestException({
      signal: 'PROCESSING_FAILED',
    });
  }

  return fileChunks;
}
}
