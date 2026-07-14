import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { ServicioDetails } from '../supabase/database.types';

export interface ServicioPayload {
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio?: string;
  descripcion: string;
  tarifa_promedio: number;
  firma_contrato?: boolean;
  latitude?: number;
  longitude?: number;
}

export { ServicioDetails };

@Injectable()
export class ServiciosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async findAll(oficio?: string): Promise<ServicioDetails[]> {
    let query = this.client
      .from('servicios')
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url, rating_promedio, total_calificaciones)');

    if (oficio) {
      query = query.eq('oficio', oficio);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    const servicios = (data ?? []) as unknown as ServicioDetails[];
    return servicios.sort((a, b) => {
      const fechaA = (a as any).creado_el || (a as any).actualizado_el || '';
      const fechaB = (b as any).creado_el || (b as any).actualizado_el || '';
      return fechaB.toString().localeCompare(fechaA.toString());
    });
  }

  async findNearby(
    lat: number,
    long: number,
    radius?: number,
    oficio?: string,
  ): Promise<ServicioDetails[]> {
    const { data, error } = await this.client.rpc('buscar_servicios_cercanos' as any, {
      lat,
      long,
      radio_metros: radius || null,
      tipo_oficio: oficio || null,
    } as any);

    if (error) throw new InternalServerErrorException(error.message);

    return (data as any[]).map((servicio) => ({
      ...servicio,
      perfiles: {
        nombre_completo: servicio.perfil_nombre_completo,
        foto_url: servicio.perfil_foto_url,
        rating_promedio: servicio.perfil_rating_promedio,
        total_calificaciones: servicio.perfil_total_calificaciones,
      },
    })) as unknown as ServicioDetails[];
  }

  async findOne(id: string): Promise<ServicioDetails> {
    const { data, error } = await this.client
      .from('servicios')
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url, rating_promedio, total_calificaciones)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Servicio no encontrado');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return data as unknown as ServicioDetails;
  }

  async create(payload: ServicioPayload): Promise<ServicioDetails> {
    const { latitude, longitude, ...rest } = payload;
    const clean = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined),
    );

    const insertData: any = {
      id: crypto.randomUUID(),
      ...clean,
    };

    if (latitude && longitude) {
      insertData.ubicacion = `POINT(${longitude} ${latitude})`;
    }

    const { data, error } = await this.client
      .from('servicios')
      .insert(insertData as never)
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url, rating_promedio, total_calificaciones)')
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear servicio: ${error.message}`,
      );
    }
    if (!data) {
      throw new InternalServerErrorException(
        'Error al crear servicio: sin datos de retorno',
      );
    }
    return data;
  }

  async update(
    id: string,
    payload: Partial<ServicioPayload>,
  ): Promise<ServicioDetails> {
    const { latitude, longitude, ...rest } = payload;

    const updateData: any = {
      ...rest,
      actualizado_el: new Date().toISOString(),
    };

    if (latitude && longitude) {
      updateData.ubicacion = `POINT(${longitude} ${latitude})`;
    }

    const { data, error } = await this.client
      .from('servicios')
      .update(updateData as unknown as never)
      .eq('id', id)
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url, rating_promedio, total_calificaciones)')
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Servicio no encontrado');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return data as unknown as ServicioDetails;
  }

  async remove(id: string) {
    const { error } = await this.client.from('servicios').delete().eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Servicio eliminado' };
  }
}
