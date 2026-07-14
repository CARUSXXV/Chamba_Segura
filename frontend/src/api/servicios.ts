export interface Servicio {
  id: string;
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio: string;
  descripcion: string;
  tarifa_promedio: number;
  firma_contrato: boolean;
  actualizado_el: string;
  distancia_metros?: number | null;
  fotos_url?: string[];
  budget: number;
  ubicacion?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  perfiles?: {
    nombre_completo: string;
    foto_url: string;
    rating_promedio?: number | null;
    total_calificaciones?: number | null;
  };
}

export interface ServicioPayload {
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio?: string;
  descripcion: string;
  tarifa_promedio: number;
  firma_contrato?: boolean;
  latitude?: number;
  longitude?: number;
  fotos_url?: string[];
}

export interface ServicioFilter {
  latitude?: number;
  longitude?: number;
  radius?: number;
  oficio?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SERVICIOS_URL = `${API_BASE_URL}/servicios`;

export async function fetchServicios(token: string, filters?: ServicioFilter): Promise<PaginatedResponse<Servicio>> {
  const url = new URL(SERVICIOS_URL);
  if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
    url.searchParams.append('latitude', filters.latitude.toString());
    url.searchParams.append('longitude', filters.longitude.toString());
    if (filters.radius) {
      url.searchParams.append('radius', filters.radius.toString());
    }
  }
  if (filters?.oficio) {
    url.searchParams.append('oficio', filters.oficio);
  }
  if (filters?.page) {
    url.searchParams.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    url.searchParams.append('limit', filters.limit.toString());
  }

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener servicios');
  return response.json();
}

export async function fetchServicioById(token: string, id: string): Promise<Servicio> {
  const response = await fetch(`${SERVICIOS_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener el servicio');
  return response.json();
}

export async function createServicio(token: string, payload: ServicioPayload): Promise<Servicio> {
  const response = await fetch(SERVICIOS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Error al crear servicio');
  }
  return response.json();
}
