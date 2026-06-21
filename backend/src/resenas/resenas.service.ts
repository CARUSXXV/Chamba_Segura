import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ResenasService {
    constructor(private readonly supabase: SupabaseService) { }

    // 1. Crear una reseña nueva al terminar un trabajo
    async crearResena(evaluador_id: string, evaluado_id: string, contrataciones_id: string, calificacion: number, comentario?: string) {
        if (calificacion < 1 || calificacion > 5) {
            throw new BadRequestException('La calificación debe estar estrictamente entre 1 y 5 estrellas.');
        }

        if (evaluador_id === evaluado_id) {
            throw new BadRequestException('No puedes calificarte a ti mismo.');
        }

        const client = this.supabase.getClient();

        // Verificamos si este usuario ya evaluó este trabajo para evitar duplicados
        const { data: resenaExistente } = await client
            .from('resenas')
            .select('id')
            .eq('contrataciones_id', contrataciones_id)
            .eq('evaluador_id', evaluador_id)
            .single();

        if (resenaExistente) {
            throw new BadRequestException('Ya has evaluado a este usuario por este trabajo específico.');
        }

        // Insertar la reseña
        const { data: nuevaResena, error } = await client
            .from('resenas')
            .insert([{
                evaluador_id: evaluador_id,
                evaluado_id: evaluado_id,
                contrataciones_id: contrataciones_id,
                calificacion: calificacion,
                comentario: comentario
            }] as any)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(`Error al guardar la reseña: ${error.message}`);

        return nuevaResena;
    }

    // 2. Obtener todas las reseñas que ha RECIBIDO un usuario (para mostrar en su perfil)
    async obtenerResenasDeUsuario(evaluado_id: string) {
        const { data, error } = await this.supabase.getClient()
            .from('resenas')
            // Ajusta las llaves foráneas si las llamaste distinto en Supabase
            .select('*, evaluador:perfiles!resena_evaluador_id_fkey(nombre_completo, username, foto_url)')
            .eq('evaluado_id', evaluado_id)
            .order('creado_el', { ascending: false });

        if (error) throw new InternalServerErrorException(`Error al obtener reseñas: ${error.message}`);
        return data;
    }

    // 3. Calcular el promedio de estrellas de un usuario (para mostrar al postularse)
    async obtenerPromedioUsuario(evaluado_id: string) {
        const { data, error } = await this.supabase.getClient()
            .from('resena')
            .select('calificacion')
            .eq('evaluado_id', evaluado_id);

        if (error) throw new InternalServerErrorException(`Error al calcular promedio: ${error.message}`);

        // Si nadie lo ha calificado aún, tiene 0
        if (!data || data.length === 0) {
            return { promedio: 0, total_resenas: 0 };
        }

        // Sumamos todas las estrellas y las dividimos entre la cantidad de reseñas
        const suma = data.reduce((acc, curr: any) => acc + curr.calificacion, 0);
        const promedio = suma / data.length;

        return {
            promedio: Number(promedio.toFixed(1)), // Redondeamos a 1 decimal (ej: 4.5)
            total_resenas: data.length
        };
    }
}