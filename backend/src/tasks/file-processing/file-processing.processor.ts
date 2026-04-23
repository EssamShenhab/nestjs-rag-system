import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessService } from 'src/process/process.service';

export interface FileProcessingJobData {
  project_id: number;
  chunk_size: number;
  overlap_size: number;
  do_reset: number;
  file_id?: string;
}

@Processor('tasks.file_processing.process_project_files', { concurrency: 2 })
export class FileProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessingProcessor.name);

  constructor(private readonly processService: ProcessService) {
    super();
  }

  async process(job: Job<FileProcessingJobData>) {
    const { project_id, chunk_size, overlap_size, do_reset, file_id } =
      job.data;

    return this.processService.processFiles(
      project_id,
      chunk_size,
      overlap_size,
      do_reset,
      file_id,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} for project ${job.data.project_id}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Job ${job.id} completed: ${JSON.stringify(job.returnvalue)}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} failed: ${job.failedReason}`);
  }
}
