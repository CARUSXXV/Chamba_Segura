const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface Mensaje {
  id: string;
  chat_id: string;
  emisor_id: string;
  contenido: string;
  enviado_el: string;
  emisor: { nombre_completo: string; username: string };
}

export async function fetchChatHistory(token: string, chatId: string): Promise<Mensaje[]> {
  const response = await fetch(`${API_BASE_URL}/mensajes/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al cargar el historial de mensajes');
  }

  return response.json();
}