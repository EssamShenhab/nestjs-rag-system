import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { NlpService } from './nlp.service';
import { ApiTags } from '@nestjs/swagger';
import { PushRequestDto } from './dto/push-request.dto';
import { ParseIntPipe } from '@nestjs/common';
import { ResponseSignal } from 'src/models/enums/response-signal.enum';
import { SearchRequestDto } from './dto/search-request.dto';

@ApiTags('api_v1', 'nlp')
@Controller('api/v1/nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Post('index/push/:project_id')
  async indexProject(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: PushRequestDto,
  ) {
    const { inserted_items_count } = await this.nlpService.indexProject(
      project_id,
      dto.do_reset,
    );

    return {
      signal: ResponseSignal.INSERT_INTO_VECTORDB_SUCCESS,
      inserted_items_count,
    };
  }

  @Get('index/info/:project_id')
  async getProjectIndexInfo(
    @Param('project_id', ParseIntPipe) project_id: number,
  ) {
    return this.nlpService.getProjectIndexInfo(project_id);
  }

  @Post('index/search/:project_id')
  async searchIndex(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: SearchRequestDto,
  ) {
    return this.nlpService.searchIndex(project_id, dto.text, dto.limit);
  }

  @Post('index/answer/:project_id')
  async answerRag(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Body() dto: SearchRequestDto,
  ) {
    return this.nlpService.answerRag(project_id, dto.text, dto.limit);
  }
}
