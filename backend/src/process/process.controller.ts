import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessRequestDto } from './dto/process-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseSignal } from 'src/models/enums';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('process/:project_id')
  async processEndpoint(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: ProcessRequestDto,
  ) {
    const { file_id, chunk_size, overlap_size, do_reset } = dto;

    const { inserted_chunks, processed_files } =
      await this.processService.processFiles(
        project_id,
        chunk_size,
        overlap_size,
        do_reset,
        file_id,
      );
    return {
      signal: ResponseSignal.PROCESSING_SUCCESS,
      inserted_chunks,
      processed_files,
    };
  }
}
