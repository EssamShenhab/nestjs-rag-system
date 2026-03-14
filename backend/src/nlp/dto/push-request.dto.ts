import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PushRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  do_reset?: number = 0;
}
