import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api_v1')
@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async getHello() {
    return this.appService.getHello();
  }
}
