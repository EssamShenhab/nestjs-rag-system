import { Module } from '@nestjs/common';
import { VectordbService } from './vectordb.service';

@Module({
  providers: [VectordbService]
})
export class VectordbModule {}
