import { Servicio } from "./servicios";

export enum EstadoContratacion {
  PENDIENTE_FIRMA = 'pendiente_firma',
  SOLICITUD_PENDIENTE = 'solicitud_pendiente',
  ACEPTADO = 'aceptado',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export interface Contratacion {
  id: string;
  servicios_id: string;
  cliente_id: string;
  job_id?: string;
  estado_contrato: EstadoContratacion;
  documento_contrato_url?: string;
  fecha_calendario: string;
  precio_final: number;
  servicio?: Servicio & {
    trabajador_id?: string;
    trabajador?: { 
      id: string;
      nombre_completo: string;
      foto_url?: string;
      rating_promedio?: number | null;
      total_calificaciones?: number | null;
    };
  };
  cliente?: { nombre_completo: string };
  trabajador?: { nombre_completo: string };
  trabajo?: {
    title?: string;
    description?: string;
  };
  resenas?: { calificacion: number; comentario: string }[];
}

export interface ContratacionPayload {
  servicios_id: string;
  fecha_calendario: string;
  precio_final: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const CONTRATACIONES_URL = `${API_BASE_URL}/contrataciones`;

export async function fetchContrataciones(token: string): Promise<Contratacion[]> {
  const response = await fetch(CONTRATACIONES_URL, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener contrataciones');
  return response.json();
}

export async function createContratacion(token: string, payload: ContratacionPayload): Promise<Contratacion> {
  const response = await fetch(CONTRATACIONES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Error al solicitar contratación');
  return response.json();
}

export async function updateEstadoContratacion(token: string, id: string, nuevo_estado: EstadoContratacion): Promise<Contratacion> {
  const response = await fetch(`${CONTRATACIONES_URL}/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ nuevo_estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado');
  return response.json();
}

export async function uploadDocumentoContrato(token: string, id: string, url: string): Promise<Contratacion> {
  const response = await fetch(`${CONTRATACIONES_URL}/${id}/documento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error('Error al subir documento');
  return response.json();
}
