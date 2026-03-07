import { Controller, Post, Body, Param } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessRequestDto } from './dto/process-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseSignal } from 'src/models/enums';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('process/:project_id')
  async processEndpoint(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: ProcessRequestDto,
  ) {
    const { file_id, chunk_size, overlap_size } = dto;

    const chunks = await this.processService.processFile(
      project_id,
      file_id,
      chunk_size,
      overlap_size,
    );

    return {
      signal: ResponseSignal.PROCESSING_SUCCESS,
      inserted_chunks: chunks,
    };
  }
}
