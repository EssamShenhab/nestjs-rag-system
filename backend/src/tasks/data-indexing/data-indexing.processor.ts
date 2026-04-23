import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NlpService } from 'src/nlp/nlp.service';

export interface DataIndexingJobData {
  project_id: number;
  do_reset: number;
}

@Processor('tasks.data_indexing.index_data_content', { concurrency: 2 })
export class DataIndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(DataIndexingProcessor.name);

  constructor(private readonly nlpService: NlpService) {
    super();
  }

  async process(job: Job<DataIndexingJobData>) {
    const { project_id, do_reset } = job.data;

    return this.nlpService.indexProject(project_id, do_reset);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Indexing job ${job.id} for project ${job.data.project_id}`,
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
