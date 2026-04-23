import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProcessRequestDto } from './dto/process-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseSignal } from 'src/models/enums';
import { FileProcessingJobData } from 'src/tasks/file-processing/file-processing.processor';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FlowService } from 'src/flow/flow.service';

@ApiTags('api_v1', 'data')
@Controller('api/v1/data')
export class ProcessController {
  constructor(
    @InjectQueue('tasks.file_processing.process_project_files')
    private readonly fileProcessingQueue: Queue,
    private readonly flowService: FlowService,
  ) {}

  @Post('process/:project_id')
  async processEndpoint(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: ProcessRequestDto,
  ) {
    const { file_id, chunk_size, overlap_size, do_reset } = dto;

    const job = await this.fileProcessingQueue.add('process-files', {
      project_id,
      chunk_size,
      overlap_size,
      do_reset,
      file_id,
    } as FileProcessingJobData);

    return {
      signal: ResponseSignal.PROCESSING_SUCCESS,
      job_id: job.id,
    };
  }

  @Post('process-and-push/:project_id')
  async processAndPushEndpoint(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: ProcessRequestDto,
  ) {
    const { file_id, chunk_size, overlap_size, do_reset } = dto;

    const flow = await this.flowService.runPipeline({
      project_id,
      file_id,
      chunk_size,
      overlap_size,
      do_reset,
    });

    return {
      signal: ResponseSignal.PROCESSING_SUCCESS,
      job_id: flow.job.id,
    };
  }
}
