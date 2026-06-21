

export interface Resena {
  id: string;
  evaluador_id: string;
  evaluado_id: string;
  contrataciones_id: string;
  calificacion: number;
  comentario: string | null;
  afecta_racha: boolean;
  contratacion?: {
    cliente?: {
      nombre_completo?: string;
      foto_url?: string;
    };
  };
}

export interface CreateResenaPayload {
  evaluador_id: string;
  evaluado_id: string;
  contrataciones_id: string;
  calificacion: number;
  comentario?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const RESENAS_URL = `${API_BASE_URL}/resenas`;


export async function createResena(token: string, payload: CreateResenaPayload): Promise<Resena> {
  const response = await fetch(RESENAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  console.log(payload);
  if (!response.ok) {
    const err = await response.text();

    throw new Error(err || 'Error al crear la reseña');
  }
  return response.json();
}

export async function findByTrabajadorId(token: string, trabajadorId: string): Promise<Resena[]> {
  const response = await fetch(`${RESENAS_URL}/trabajador/${trabajadorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener reseñas del trabajador');
  return response.json();
}

export async function findByContratacionId(token: string, contratacionId: string): Promise<Resena> {
  const response = await fetch(`${RESENAS_URL}/contratacion/${contratacionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al obtener reseña de la contratación');
  return response.json();
}

export async function getPromedioUsuario(token: string, usuarioId: string): Promise<{ promedio: number; total_resenas: number }> {
  const response = await fetch(`${API_BASE_URL}/resenas/usuario/${usuarioId}/promedio`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Error al obtener el promedio');
  return response.json();
}