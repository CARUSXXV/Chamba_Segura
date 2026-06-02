import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';

// Interfaces puras de TS en lugar de DTOs
export interface JobPayload {
  title: string;
  description: string;
  category: string;
  required_skills?: string[];
  budget?: number;
  contractor_id: string; 
}

export interface JobFilter {
  category?: string;
  skills?: string[]; // Pasado por query params, ej: ?skills=React&skills=Node
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(@Query() filters: JobFilter) {
    return this.jobsService.searchJobs(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Post()
  async create(@Body() payload: JobPayload) {
    return this.jobsService.createJob(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: Partial<JobPayload>) {
    return this.jobsService.updateJob(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }
}