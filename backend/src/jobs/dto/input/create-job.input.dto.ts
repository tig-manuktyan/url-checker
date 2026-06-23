import { ArrayMaxSize, ArrayMinSize, IsArray, IsUrl } from 'class-validator';

export class CreateJobInputDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUrl({}, { each: true })
  urls!: string[];
}
