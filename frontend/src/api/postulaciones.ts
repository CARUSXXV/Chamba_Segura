import { Job } from "./jobs";

export type EstadoPostulacion = "pendiente" | "aceptado" | "rechazado";

export interface Postulacion {
  id: string;
  job_id: string;
  trabajador_id: string;
  mensaje: string | null;
  estado: EstadoPostulacion;
  created_at: string;
  trabajo?: Job & {
    perfiles?: {
      id: string;
      nombre_completo?: string;
      foto_url?: string;
      rating_promedio?: number | null;
      total_calificaciones?: number | null;
    } | null;
  };
  trabajador?: {
    nombre_completo?: string;
    foto_url?: string;
    rating_promedio?: number | null;
    total_calificaciones?: number | null;
  };
}

export interface PostulacionPayload {
  job_id: string;
  mensaje?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const POSTULACIONES_URL = `${API_BASE_URL}/postulaciones`;

export async function createPostulacion(token: string, payload: PostulacionPayload): Promise<Postulacion> {
  const response = await fetch(POSTULACIONES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Error al postularse');
  }
  return response.json();
}

export async function fetchPostulaciones(token: string): Promise<Postulacion[]> {
  const response = await fetch(POSTULACIONES_URL, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener postulaciones');
  return response.json();
}

export async function fetchPostulacionesByJob(token: string, trabajoId: string): Promise<Postulacion[]> {
  const response = await fetch(`${POSTULACIONES_URL}/trabajo/${trabajoId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener postulaciones');
  return response.json();
}

export async function updateEstadoPostulacion(token: string, id: string, nuevoEstado: EstadoPostulacion): Promise<Postulacion> {
  const response = await fetch(`${POSTULACIONES_URL}/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ nuevo_estado: nuevoEstado }),
  });
  if (!response.ok) throw new Error('Error al actualizar postulación');
  return response.json();
}
