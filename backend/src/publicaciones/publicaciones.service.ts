import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class PublicacionesService {
    constructor(private readonly supabase: SupabaseService) { }

    // ==========================================
    // LÓGICA: TRABAJOS
    // ==========================================

    async findAllJobs(contractor_id?: string, category?: string, page?: string, limit?: string) {
        const client = this.supabase.getClient();

        // 1. Iniciamos la consulta base
        let query = client.from('jobs').select('*'); // Cambia 'jobs' si tu tabla se llama distinto

        // 2. Si nos llega el ID del usuario desde la URL, filtramos
        if (contractor_id) {
            query = query.eq('contractor_id', contractor_id);
        }

        if (category) {
            query = query.eq('category', category);
        }




        // 3. Ejecutamos la consulta
        const { data, error, count } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(`Error en BD: ${error.message}`);
        }

        // 4. Devolvemos la estructura exacta que espera tu frontend (PaginatedResponse)
        return {
            data: data || [],
            total: count || 0,
            page: 1,
            limit: 10,
            totalPages: 1
        };
    }

    async findAllServicios(trabajador_id?: string, oficio?: string, tipo_de_oficio?: string) {
        const client = this.supabase.getClient();

        let query = client.from('servicios').select('*'); // Cambia 'servicios' si tu tabla se llama distinto

        if (trabajador_id) {
            query = query.eq('trabajador_id', trabajador_id);
        };

        if (oficio) {
            query = query.eq('oficio', oficio);
        };

        if (tipo_de_oficio) {
            query = query.eq('tipo_de_oficio', tipo_de_oficio);
        };

        const { data, error, count } = await query.order('actualizado_el', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(`Error en BD: ${error.message}`);
        }

        return data || [];
    }


    async getMisTrabajos(userId: string) {
        const client = this.supabase.getClient();

        const { data, error } = await client
            .from('jobs') // Cambia a 'trabajos' si tu tabla se llama distinto
            .select('*')
            .eq('contractor_id', userId) // Cambia a tu columna de propietario
            .order('created_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(`Error en BD: ${error.message}`);
        }

        // Devolvemos la data directamente (si no hay, un array vacío)
        return data || [];
    }

    async deleteTrabajo(id: string, userId: string) {
        const client = this.supabase.getClient();

        const { error, count } = await client
            .from('jobs')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('contractor_id', userId);

        if (error) throw new InternalServerErrorException(error.message);
        if (count === 0) throw new NotFoundException('No se encontró el trabajo o no es tuyo.');

        return { success: true, message: 'Trabajo eliminado' };
    }

    // ==========================================
    // LÓGICA: SERVICIOS
    // ==========================================

    async getMisServicios(userId: string) {
        const client = this.supabase.getClient();

        const { data, error } = await client
            .from('servicios') // Cambia a 'servicios' si tu tabla se llama distinto
            .select('*')
            .eq('trabajador_id', userId) // Cambia a tu columna de propietario
            .order('actualizado_el', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(`Error en BD: ${error.message}`);
        }

        return data || [];
    }

    async deleteServicio(id: string, userId: string) {
        const client = this.supabase.getClient();

        const { error, count } = await client
            .from('servicios')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('trabajador_id', userId);

        if (error) throw new InternalServerErrorException(error.message);
        if (count === 0) throw new NotFoundException('No se encontró el servicio o no es tuyo.');

        return { success: true, message: 'Servicio eliminado' };
    }
}