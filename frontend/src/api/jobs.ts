export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  budget: number | null;
  contractor_id: string;
  estado: boolean;
  fotos_urls: string[];
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  distancia_metros?: number | null;
  ubicacion?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  perfiles?: {
    id: string;
    nombre_completo: string;
    foto_url: string;
    rating_promedio?: number | null;
    total_calificaciones?: number | null;
  };
}

export interface JobPayload {
  title: string;
  description: string;
  category: string;
  required_skills?: string[];
  budget?: number;
  contractor_id: string;
  latitude?: number;
  longitude?: number;
  fotos_urls?: string[];
  estado: boolean;
}

export interface JobFilter {
  category?: string;
  skills?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const JOBS_URL = `${API_BASE_URL}/jobs`;

export async function fetchJobs(token: string, filters?: JobFilter): Promise<Job[]> {
  const url = new URL(JOBS_URL);
  if (filters?.category) {
    url.searchParams.append('category', filters.category);
  }
  if (filters?.skills && filters.skills.length > 0) {
    filters.skills.forEach(skill => url.searchParams.append('skills', skill));
  }
  if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
    url.searchParams.append('latitude', filters.latitude.toString());
    url.searchParams.append('longitude', filters.longitude.toString());
    if (filters.radius) {
      url.searchParams.append('radius', filters.radius.toString());
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener los trabajos');
  }

  return response.json();
}

export async function fetchJobById(token: string, id: string): Promise<Job> {
  const response = await fetch(`${JOBS_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener el trabajo');
  }

  return response.json();
}

export async function createJob(token: string, payload: JobPayload): Promise<Job> {
  const response = await fetch(JOBS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear el trabajo');
  }

  return response.json();
}

export async function updateJob(token: string, id: string, payload: Partial<JobPayload>): Promise<Job> {
  const response = await fetch(`${JOBS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar el trabajo');
  }

  return response.json();
}

export async function deleteJob(token: string, id: string): Promise<{ message: string; deletedId: string }> {
  const response = await fetch(`${JOBS_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el trabajo');
  }

  return response.json();
}
