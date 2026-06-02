import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js'; 
import { JobPayload, JobFilter } from './jobs.controller';

@Injectable()
export class JobsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async searchJobs(filters: JobFilter) {
    let query = this.supabase
      .from('jobs')
      .select('*, profiles(id, full_name, avatar_url)'); 

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.skills && filters.skills.length > 0) {
      // Búsqueda en array de PostgreSQL: trae trabajos que contengan estas habilidades
      query = query.contains('required_skills', filters.skills); 
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(`Error consultando trabajos: ${error.message}`);
    
    return data;
  }

  async getJobById(id: string) {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*, profiles(id, full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('El trabajo solicitado no existe o fue eliminado.');
    
    return data;
  }

  async createJob(payload: JobPayload) {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert([payload])
      .select();

    if (error) throw new InternalServerErrorException(`Error creando trabajo: ${error.message}`);
    
    return data[0];
  }

  async updateJob(id: string, payload: Partial<JobPayload>) {
    const { data, error } = await this.supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(`Error actualizando trabajo: ${error.message}`);
    if (!data || data.length === 0) throw new NotFoundException('Trabajo no encontrado para actualizar.');
    
    return data[0];
  }

  async deleteJob(id: string) {
    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(`Error eliminando trabajo: ${error.message}`);
    
    return { statusCode: 200, message: 'Trabajo eliminado exitosamente', deletedId: id };
  }
}