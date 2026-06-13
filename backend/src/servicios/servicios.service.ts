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
}

export { ServicioDetails };

@Injectable()
export class ServiciosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async findAll(): Promise<ServicioDetails[]> {
    const { data, error } = await this.client
      .from('servicios')
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url)');

    if (error) throw new InternalServerErrorException(error.message);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return (data ?? []) as unknown as ServicioDetails[];
  }

  async findOne(id: string): Promise<ServicioDetails> {
    const { data, error } = await this.client
      .from('servicios')
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Servicio no encontrado');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return data as unknown as ServicioDetails;
  }

  async create(payload: ServicioPayload): Promise<ServicioDetails> {
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined),
    );

    const { data, error } = await this.client
      .from('servicios')
      .insert({ id: crypto.randomUUID(), ...clean } as never)
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url)')
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
    const updateData = {
      ...payload,
      actualizado_el: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('servicios')
      .update(updateData as unknown as never)
      .eq('id', id)
      .select('*, perfiles!trabajador_id(nombre_completo, foto_url)')
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
