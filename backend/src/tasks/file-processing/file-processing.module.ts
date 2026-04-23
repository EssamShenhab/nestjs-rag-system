import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FileProcessingProcessor } from './file-processing.processor';
import { ProcessModule } from 'src/process/process.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'tasks.file_processing.process_project_files' }),
    ProcessModule,
  ],
  providers: [FileProcessingProcessor],
  exports: [BullModule],
})
export class FileProcessingModule {}
