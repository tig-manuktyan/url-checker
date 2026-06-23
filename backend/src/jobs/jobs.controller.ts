import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateJobInputDto } from '@url-checker/jobs/dto/input/create-job.input.dto';
import { JobDetailOutputDto } from '@url-checker/jobs/dto/output/job-detail.output.dto';
import { JobSummaryOutputDto } from '@url-checker/jobs/dto/output/job-summary.output.dto';
import { JobsService } from '@url-checker/jobs/jobs.service';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@Body() dto: CreateJobInputDto): { id: string } {
    return this.jobsService.create(dto);
  }

  @Get()
  listJobs(): JobSummaryOutputDto[] {
    return this.jobsService.findAll();
  }

  @Get(':id')
  getJob(@Param('id', ParseUUIDPipe) id: string): JobDetailOutputDto {
    return this.jobsService.findOne(id);
  }

  @Patch(':id/cancel')
  @HttpCode(204)
  cancelJob(@Param('id', ParseUUIDPipe) id: string): void {
    this.jobsService.cancel(id);
  }
}
