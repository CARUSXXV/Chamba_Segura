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
    fotos_urls?: string[];
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
    fotos_urls?: string[];
}

export interface ServicioFilter {
    latitude?: number;
    longitude?: number;
    radius?: number;
    oficio?: string;
    page?: number;
    limit?: number;
    trabajador_id?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SERVICIOS_URL = `${API_BASE_URL}/publicaciones/servicios`;

// ==========================================
// HELPER: Extraer ID del Token
// ==========================================
function getUserIdFromToken(token: string): string {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        return payload.sub || payload.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return '';
    }
}

// ==========================================
// FUNCIÓN PRINCIPAL (Dashboard)
// ==========================================
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
    if (filters?.trabajador_id) {
        url.searchParams.append('trabajador_id', filters.trabajador_id);
    }

    const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
    });

    // 1. Leemos el cuerpo de la respuesta UNA SOLA VEZ
    const data = await response.json();

    // 2. Si el status NO es ok (ej. 404, 500), lanzamos el error
    if (!response.ok) {
        console.error("🔥 ERROR DEL BACKEND:", data);
        throw new Error(data.message || 'Error al obtener servicios');
    }

    // 3. Si todo está bien, devolvemos los datos que ya leímos
    return data;
}

// ==========================================
// NUEVA FUNCIÓN: Solo MIS Servicios
// ==========================================
export async function fetchMyServicios(token: string, additionalFilters?: Omit<ServicioFilter, 'trabajador_id'>): Promise<PaginatedResponse<Servicio>> {
    const userId = getUserIdFromToken(token);

    if (!userId) {
        throw new Error('No se pudo extraer el ID del usuario desde el token.');
    }

    // Reutilizamos fetchServicios, forzando la búsqueda con el ID de usuario
    return fetchServicios(token, {
        ...additionalFilters,
        trabajador_id: userId
    });
}

// ==========================================
// RESTO DEL CRUD
// ==========================================
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

export async function updateServicio(token: string, id: string, payload: ServicioPayload): Promise<Servicio> {
    const response = await fetch(`${SERVICIOS_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar el servicio');
    return response.json();
}

export async function deleteServicio(token: string, id: string): Promise<Servicio> {
    const response = await fetch(`${SERVICIOS_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
    });

    if (!response.ok) {
        // Atrapamos el error real del backend de NestJS
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error("🔥 ERROR REAL AL ELIMINAR SERVICIO:", errorData);
        throw new Error(errorData.message || 'Error al eliminar el servicio');
    }

    return response.json();
}