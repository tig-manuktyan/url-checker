import { Module } from '@nestjs/common';
import { JobsModule } from '@url-checker/jobs/jobs.module';

@Module({
  imports: [JobsModule],
})
export class AppModule {}
