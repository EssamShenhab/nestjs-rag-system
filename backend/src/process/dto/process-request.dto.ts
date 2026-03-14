import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessRequestDto {
  @IsOptional()
  @IsString()
  file_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chunk_size?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overlap_size?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  do_reset?: number = 0;
}
