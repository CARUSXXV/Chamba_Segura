import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';
import { JobPayload, JobFilter, PaginatedResponse } from './jobs.controller';

@Injectable()
export class JobsService {
  constructor(private readonly supabase: SupabaseClient<Database>) { }

  async searchJobs(filters: JobFilter): Promise<PaginatedResponse<any>> {
    const lat = filters.latitude ? Number(filters.latitude) : undefined;
    const long = filters.longitude ? Number(filters.longitude) : undefined;
    const radius = filters.radius ? Number(filters.radius) : undefined;
    const skills = typeof filters.skills === 'string' ? [filters.skills] : filters.skills;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    if (lat !== undefined && !isNaN(lat) && long !== undefined && !isNaN(long)) {
      const { data, error } = await this.supabase.rpc('buscar_trabajos_cercanos' as any, {
        lat,
        long,
        radio_metros: radius || null,
        categoria: filters.category || null,
        habilidades: skills || null,
      } as any);

      if (error) {
        throw new InternalServerErrorException(
          `Error consultando trabajos cercanos: ${error.message}`,
        );
      }

      const allJobs = (data as any[]).map((job) => ({
        ...job,
        perfiles: {
          id: job.contractor_id,
          nombre_completo: job.perfil_nombre_completo,
          foto_url: job.perfil_foto_url,
          rating_promedio: job.perfil_rating_promedio,
          total_calificaciones: job.perfil_total_calificaciones,
        },
      }));

      const total = allJobs.length;
      const paginatedData = allJobs.slice(offset, offset + limit);

      return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    let queryCount = this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    if (filters.category) {
      queryCount = queryCount.eq('category', filters.category);
    }

    if (skills && skills.length > 0) {
      queryCount = queryCount.contains('required_skills', skills);
    }

    const { count, error: countError } = await queryCount;
    if (countError)
      throw new InternalServerErrorException(
        `Error contando trabajos: ${countError.message}`,
      );

    let query = this.supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (skills && skills.length > 0) {
      query = query.contains('required_skills', skills);
    }

    const { data, error } = await query;
    if (error)
      throw new InternalServerErrorException(
        `Error consultando trabajos: ${error.message}`,
      );

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  }

  async getJobById(id: string) {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*, perfiles!contractor_id(id, nombre_completo, foto_url, rating_promedio, total_calificaciones)')
      .eq('id', id)
      .single();

    if (error || !data)
      throw new NotFoundException(
        'El trabajo solicitado no existe o fue eliminado.',
      );

    return data;
  }

  async createJob(payload: JobPayload) {
    const { latitude, longitude, fotos_urls = [], ...jobData } = payload;

    const insertData: any = {
      ...jobData,
      fotos_urls: fotos_urls.length > 0 ? fotos_urls : null,
    };

    if (latitude && longitude) {
      insertData.ubicacion = `POINT(${longitude} ${latitude})`;
    }

    const { data, error } = await (this.supabase as any)
      .from('jobs')
      .insert([insertData])
      .select();

    if (error)
      throw new InternalServerErrorException(
        `Error creando trabajo: ${error.message}`,
      );

    return data[0];
  }

  async updateJob(id: string, payload: Partial<JobPayload>) {
    const { latitude, longitude, fotos_urls = [], ...jobData } = payload;

    const updateData: any = {
      ...jobData,
      fotos_urls: fotos_urls.length > 0 ? fotos_urls : null,
    };

    if (latitude && longitude) {
      updateData.ubicacion = `POINT(${longitude} ${latitude})`;
    }

    const { data, error } = await (this.supabase as any)
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error)
      throw new InternalServerErrorException(
        `Error actualizando trabajo: ${error.message}`,
      );
    if (!data || data.length === 0)
      throw new NotFoundException('Trabajo no encontrado para actualizar.');

    return data[0];
  }

  async deleteJob(id: string) {
    const { error } = await this.supabase.from('jobs').delete().eq('id', id);

    if (error)
      throw new InternalServerErrorException(
        `Error eliminando trabajo: ${error.message}`,
      );

    return {
      statusCode: 200,
      message: 'Trabajo eliminado exitosamente',
      deletedId: id,
    };
  }
}
