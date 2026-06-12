export interface Servicio {
  id: string;
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio: string;
  descripcion: string;
  tarifa_promedio: number;
  firma_contrato: boolean;
  actualizado_el: string;
  perfiles?: {
    nombre_completo: string;
    foto_url: string;
  };
}

export interface ServicioPayload {
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio?: string;
  descripcion: string;
  tarifa_promedio: number;
  firma_contrato?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SERVICIOS_URL = `${API_BASE_URL}/servicios`;

export async function fetchServicios(token: string): Promise<Servicio[]> {
  const response = await fetch(SERVICIOS_URL, {
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
