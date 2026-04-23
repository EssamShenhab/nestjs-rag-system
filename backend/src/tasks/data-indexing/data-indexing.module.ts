import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataIndexingProcessor } from './data-indexing.processor';
import { NlpModule } from 'src/nlp/nlp.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'tasks.data_indexing.index_data_content' }),
    NlpModule,
  ],
  providers: [DataIndexingProcessor],
  exports: [BullModule],
})
export class DataIndexingModule {}
