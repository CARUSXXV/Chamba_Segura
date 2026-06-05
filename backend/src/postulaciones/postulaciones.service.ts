import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ServiciosRow } from '../supabase/database.types';

export type EstadoPostulacion = 'pendiente' | 'aceptado' | 'rechazado';

interface PostulacionRowWithJob {
  id: string;
  trabajo_id: string;
  trabajador_id: string;
  mensaje: string | null;
  estado: string | null;
  created_at: string | null;
  trabajo?: { contractor_id: string } | null;
}

export interface PostulacionPayload {
  trabajo_id: string;
  mensaje?: string;
}

@Injectable()
export class PostulacionesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(payload: PostulacionPayload, trabajadorId: string) {
    const { data: rawTrabajo, error: trabajoError } = await this.supabase
      .from('jobs')
      .select('contractor_id')
      .eq('id', payload.trabajo_id)
      .single();

    if (trabajoError || !rawTrabajo)
      throw new NotFoundException('El trabajo no existe');

    const trabajo = rawTrabajo as unknown as { contractor_id: string };

    if (trabajo.contractor_id === trabajadorId)
      throw new BadRequestException('No puedes postularte a tu propio trabajo');

    const { data: existente } = await this.supabase
      .from('postulaciones')
      .select('id')
      .eq('trabajo_id', payload.trabajo_id)
      .eq('trabajador_id', trabajadorId)
      .maybeSingle();

    if (existente)
      throw new BadRequestException('Ya te postulaste a este trabajo');

    const { data, error } = await this.supabase
      .from('postulaciones')
      .insert({
        trabajo_id: payload.trabajo_id,
        trabajador_id: trabajadorId,
        mensaje: payload.mensaje ?? null,
        estado: 'pendiente',
      } as never)
      .select()
      .single();

    if (error)
      throw new InternalServerErrorException(
        `Error al postularse: ${error.message}`,
      );

    return data;
  }

  async findByJobId(trabajoId: string) {
    const { data, error } = await this.supabase
      .from('postulaciones')
      .select(
        '*, trabajador:perfiles!trabajador_id(nombre_completo, foto_url)',
      )
      .eq('trabajo_id', trabajoId)
      .order('created_at', { ascending: false });

    if (error)
      throw new InternalServerErrorException(
        `Error al obtener postulaciones: ${error.message}`,
      );

    return data ?? [];
  }

  async findByUser(userId: string, esTrabajador: boolean) {
    let query = this.supabase
      .from('postulaciones')
      .select(
        '*, trabajo:jobs(*, perfiles!contractor_id(nombre_completo, foto_url)), trabajador:perfiles!trabajador_id(nombre_completo, foto_url)',
      )
      .order('created_at', { ascending: false });

    if (esTrabajador) {
      query = query.eq('trabajador_id', userId);
    } else {
      query = query.eq('trabajo.contractor_id', userId);
    }

    const { data, error } = await query;

    if (error)
      throw new InternalServerErrorException(
        `Error al obtener postulaciones: ${error.message}`,
      );

    return data ?? [];
  }

  async updateEstado(
    id: string,
    nuevoEstado: EstadoPostulacion,
    userId: string,
  ) {
    const { data: raw, error: fetchError } = await this.supabase
      .from('postulaciones')
      .select('*, trabajo:jobs(contractor_id)')
      .eq('id', id)
      .single();

    if (fetchError || !raw)
      throw new NotFoundException('Postulación no encontrada');

    const postulacion = raw as unknown as PostulacionRowWithJob;

    if (postulacion.trabajo?.contractor_id !== userId)
      throw new ForbiddenException(
        'Solo el dueño del trabajo puede gestionar postulaciones',
      );

    if (postulacion.estado !== 'pendiente')
      throw new BadRequestException(
        'Esta postulación ya fue gestionada (aceptada o rechazada)',
      );

    if (nuevoEstado === 'aceptado') {
      const { error: updateError } = await this.supabase
        .from('postulaciones')
        .update({ estado: 'rechazado' } as never)
        .eq('trabajo_id', postulacion.trabajo_id)
        .eq('estado', 'pendiente')
        .neq('id', id);

      if (updateError)
        throw new InternalServerErrorException(
          `Error al rechazar otras postulaciones: ${updateError.message}`,
        );

      const trabajoId = postulacion.trabajo_id;
      const { data: trabajoDatos } = await this.supabase
        .from('jobs')
        .select('budget')
        .eq('id', trabajoId)
        .single();

      const precioFinal = (trabajoDatos as unknown as { budget?: number })?.budget ?? 0;

      let { data: servicios } = await this.supabase
        .from('servicios')
        .select('id')
        .eq('trabajador_id', postulacion.trabajador_id)
        .limit(1);

      let serviciosId: string;

      if (servicios && servicios.length > 0) {
        serviciosId = (servicios[0] as unknown as { id: string }).id;
      } else {
        const { data: newServicio } = await this.supabase
          .from('servicios')
          .insert({
            id: crypto.randomUUID(),
            trabajador_id: postulacion.trabajador_id,
            oficio: 'Servicio General',
            descripcion: 'Servicio creado automáticamente desde postulación',
            tarifa_promedio: precioFinal,
          } as never)
          .select('id')
          .single();

        if (!newServicio)
          throw new InternalServerErrorException('Error al crear servicio automático');
        serviciosId = (newServicio as unknown as { id: string }).id;
      }

      const { error: contratacionError } = await this.supabase
        .from('contrataciones')
        .insert({
          id: crypto.randomUUID(),
          cliente_id: userId,
          servicios_id: serviciosId,
          estado_contrato: 'solicitud_pendiente',
          fecha_calendario: new Date().toISOString(),
          precio_final: precioFinal,
        } as never);

      if (contratacionError)
        throw new InternalServerErrorException(
          `Error al crear contratación: ${contratacionError.message}`,
        );
    }

    const { data, error } = await this.supabase
      .from('postulaciones')
      .update({ estado: nuevoEstado } as never)
      .eq('id', id)
      .select()
      .single();

    if (error)
      throw new InternalServerErrorException(
        `Error al actualizar postulación: ${error.message}`,
      );

    return data;
  }
}
