/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ServiciosService } from '../servicios/servicios.service';
import type {
  ContratacionesRow,
  ContratacionesWithRelations,
} from '../supabase/database.types';

export enum EstadoContratacion {
  PENDIENTE_FIRMA = 'pendiente_firma',
  SOLICITUD_PENDIENTE = 'solicitud_pendiente',
  ACEPTADO = 'aceptado',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export interface ContratacionPayload {
  servicios_id: string;
  fecha_calendario: string;
  precio_final: number;
}

@Injectable()
export class ContratacionesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly serviciosService: ServiciosService,
  ) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async create(
    payload: ContratacionPayload,
    clienteId: string,
  ): Promise<ContratacionesRow | null> {
    const servicio = await this.serviciosService.findOne(payload.servicios_id);

    const estadoInicial = servicio.firma_contrato
      ? EstadoContratacion.PENDIENTE_FIRMA
      : EstadoContratacion.SOLICITUD_PENDIENTE;

    const insertData = {
      id: crypto.randomUUID(),
      cliente_id: clienteId,
      estado_contrato: estadoInicial,
      servicios_id: payload.servicios_id,
      fecha_calendario: payload.fecha_calendario,
      precio_final: payload.precio_final,
      documento_contrato_url: null,
    };

    const { data, error } = await this.client
      .from('contrataciones')
      .insert(insertData as unknown as never)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data ?? null;
  }

  async findByUserId(
    userId: string,
    isTrabajador: boolean,
  ): Promise<ContratacionesWithRelations[]> {
    if (isTrabajador) {
      // Step 1: Get all servicio IDs belonging to this worker
      const { data: workerServicios, error: svcError } = await this.client
        .from('servicios')
        .select('id')
        .eq('trabajador_id', userId);

      if (svcError) throw new InternalServerErrorException(svcError.message);

      const servicioIds = (workerServicios ?? []).map(
        (s: { id: string }) => s.id,
      );

      if (servicioIds.length === 0) return [];

      // Step 2: Fetch contrataciones for those servicios
      const { data, error } = await this.client
        .from('contrataciones')
        .select(
          '*, servicio:servicios(*, trabajador:perfiles!trabajador_id(nombre_completo)), cliente:perfiles!cliente_id(nombre_completo), trabajo:jobs!job_id(title, description)',
        )
        .in('servicios_id', servicioIds);

      if (error) throw new InternalServerErrorException(error.message);
      return (data ?? []) as unknown as ContratacionesWithRelations[];
    }

    // For clients
    const { data, error } = await this.client
      .from('contrataciones')
      .select(
        '*, servicio:servicios(*, trabajador:perfiles!trabajador_id(nombre_completo)), cliente:perfiles!cliente_id(nombre_completo), trabajo:jobs!job_id(title, description)',
      )
      .eq('cliente_id', userId);

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []) as unknown as ContratacionesWithRelations[];
  }

  async updateEstado(
    id: string,
    nuevoEstado: EstadoContratacion,
    userId: string,
    isTrabajador: boolean,
  ): Promise<ContratacionesWithRelations | null> {
    const { data: raw, error: fetchError } = await this.client
      .from('contrataciones')
      .select('*, servicio:servicios(trabajador_id)')
      .eq('id', id)
      .single();

    if (fetchError || !raw)
      throw new NotFoundException('Contratación no encontrada');

    const contratacion = raw as unknown as ContratacionesWithRelations;

    if (isTrabajador) {
      if (contratacion.servicio?.trabajador_id !== userId)
        throw new ForbiddenException(
          'No tienes permiso para gestionar esta contratación',
        );

      const allowedWorkerStates = [
        EstadoContratacion.ACEPTADO,
        EstadoContratacion.EN_PROGRESO,
        EstadoContratacion.COMPLETADO,
        EstadoContratacion.CANCELADO,
      ];
      if (!allowedWorkerStates.includes(nuevoEstado)) {
        throw new BadRequestException('Estado no permitido para trabajador');
      }
    } else {
      if (contratacion.cliente_id !== userId)
        throw new ForbiddenException(
          'No tienes permiso para gestionar esta contratación',
        );

      if (nuevoEstado === EstadoContratacion.CANCELADO) {
        if (
          contratacion.estado_contrato === EstadoContratacion.ACEPTADO ||
          contratacion.estado_contrato === EstadoContratacion.EN_PROGRESO
        ) {
          // Notify worker (TODO: replace with real notification system)
          console.log(
            `[NOTIFICACIÓN] El cliente ${userId} canceló la contratación ${id} (estado: ${contratacion.estado_contrato}). Notificando al trabajador ${contratacion.servicio?.trabajador_id}.`,
          );
        }
      } else if (nuevoEstado === EstadoContratacion.COMPLETADO) {
        if (contratacion.estado_contrato !== EstadoContratacion.EN_PROGRESO) {
          throw new BadRequestException(
            'Solo puedes marcar como completado si estaba en progreso',
          );
        }
      } else {
        throw new BadRequestException('Estado no permitido para cliente');
      }
    }

    const { data, error } = await this.client
      .from('contrataciones')
      .update({ estado_contrato: nuevoEstado } as unknown as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? null) as unknown as ContratacionesWithRelations | null;
  }

  async uploadDocumento(
    id: string,
    documentoUrl: string,
    userId: string,
  ): Promise<ContratacionesWithRelations | null> {
    const { data: raw, error: fetchError } = await this.client
      .from('contrataciones')
      .select('*, servicio:servicios(trabajador_id)')
      .eq('id', id)
      .single();

    if (fetchError || !raw)
      throw new NotFoundException('Contratación no encontrada');

    const contratacion = raw as unknown as ContratacionesWithRelations;

    if (
      contratacion.cliente_id !== userId &&
      contratacion.servicio?.trabajador_id !== userId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    const { data, error } = await this.client
      .from('contrataciones')
      .update({
        documento_contrato_url: documentoUrl,
        estado_contrato: EstadoContratacion.SOLICITUD_PENDIENTE,
      } as unknown as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? null) as unknown as ContratacionesWithRelations | null;
  }
}
