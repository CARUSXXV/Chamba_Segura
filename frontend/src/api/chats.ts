const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface Chat {
  id: string;
  cliente_id: string;
  trabajador_id: string;
  trabajo_id: string;
  creado_el: string;
  cliente: { nombre_completo: string; username: string; foto_url?: string };
  trabajador: { nombre_completo: string; username: string; foto_url?: string };
}

export async function fetchMyChats(token: string): Promise<Chat[]> {
  const response = await fetch(`${API_BASE_URL}/chats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener los chats');
  }

  return response.json();
}

export async function createChat(token: string, payload: { cliente_id: string; trabajador_id: string; trabajo_id: string }): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al iniciar el chat');
  }

  return response.json();
}