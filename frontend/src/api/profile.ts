export interface Profile {
  id: string;
  nombre_completo: string;
  username: string;
  foto_url: string;
  email_contacto: string;
  telefono: string;
  email: string;
  contractor_id: string;
  creado_el: string;
  rating_promedio?: number | null;
  total_calificaciones?: number | null;
}

export interface profilePayload {
  nombre_completo: string;
  username: string;
  foto_url: string;
  email_contacto: string;
  telefono: string;
  email: string;
  contractor_id: string;
}

export interface profileFilter {
  username: string;
  nombre_completo: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const PROFILE_URL = `${API_BASE_URL}/perfiles`;

export async function fetchProfile(token: string, filters?: profileFilter): Promise<Profile> {
  const url = new URL(PROFILE_URL);
  if (filters?.username) {
    url.searchParams.append('username', filters.username);
  }
  if (filters?.nombre_completo) {
    url.searchParams.append('nombre_completo', filters.nombre_completo);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener los perfiles');
  }

  return response.json();
}

export async function fetchProfileById(token: string, id: string): Promise<Profile> {
  const response = await fetch(`${PROFILE_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener el perfil');
  }

  return response.json();
}

export async function updateProfile(token: string, id: string, payload: Partial<profilePayload>): Promise<Profile> {
  const response = await fetch(`${PROFILE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar el perfil');
  }

  return response.json();
}

export async function deleteProfile(token: string, id: string): Promise<{ message: string; deletedId: string }> {
  const response = await fetch(`${PROFILE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el perfil');
  }

  return response.json();
}

export async function deleteMyProfile(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/perfiles/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar mi perfil');
  }

  return response.json();
}