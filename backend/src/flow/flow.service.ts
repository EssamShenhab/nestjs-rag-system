import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FlowService implements OnModuleInit, OnModuleDestroy {
  private flow: FlowProducer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.flow = new FlowProducer({
      connection: {
        host: this.config.get<string>('bullmq.BULLMQ_HOST'),
        port: this.config.get<number>('bullmq.BULLMQ_PORT'),
        username: this.config.get<string>('bullmq.BULLMQ_USERNAME'),
        password: this.config.get<string>('bullmq.BULLMQ_PASSWORD'),
      },
    });
  }

  async onModuleDestroy() {
    await this.flow?.close();
  }

  async runPipeline(data: any) {
    return this.flow.add({
      name: 'tasks.data_indexing.index_data_content',
      queueName: 'tasks.data_indexing.index_data_content',
      data: { project_id: data.project_id },
      children: [
        {
          name: 'tasks.file_processing.process_project_files',
          queueName: 'tasks.file_processing.process_project_files',
          data,
        },
      ],
    });
  }
}
