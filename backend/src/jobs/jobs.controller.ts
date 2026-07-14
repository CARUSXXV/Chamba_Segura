import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { JobsService } from './jobs.service';

// Interfaces puras de TS en lugar de DTOs
export interface JobPayload {
  title: string;
  description: string;
  category: string;
  required_skills?: string[];
  budget?: number;
  contractor_id: string;
  latitude?: number;
  longitude?: number;
  fotos_urls?: string[];
}

export interface JobFilter {
  category?: string;
  skills?: string[]; // Pasado por query params, ej: ?skills=React&skills=Node
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('skills') skills?: string[],
    @Query('latitude') latitudeStr?: string,
    @Query('longitude') longitudeStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const filters: JobFilter = {
      category,
      skills: typeof skills === 'string' ? [skills] : skills,
      latitude: latitudeStr ? Number(latitudeStr) : undefined,
      longitude: longitudeStr ? Number(longitudeStr) : undefined,
      radius: radiusStr ? Number(radiusStr) : undefined,
      page: pageStr ? Math.max(1, Number(pageStr)) : 1,
      limit: limitStr ? Math.min(100, Math.max(1, Number(limitStr))) : 20,
    };
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
