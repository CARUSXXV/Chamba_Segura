'use client';

import { useEffect, useState } from 'react';
import { getPromedioUsuario } from '@/api/resenas';

interface Props {
  usuarioId: string;
  token: string;
}

export default function EstrellasUsuarios({ usuarioId, token }: Props) {
  const [promedio, setPromedio] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuarioId || !token) return;

    getPromedioUsuario(token, usuarioId)
      .then(data => {
        setPromedio(data.promedio);
        setTotal(data.total_resenas);
      })
      .catch(err => console.error("Error cargando estrellas:", err))
      .finally(() => setCargando(false));
  }, [usuarioId, token]);

  if (cargando) {
    return <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg transition-colors ${star <= Math.round(promedio) ? 'text-yellow-400' : 'text-gray-200'
              }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-500 font-medium ml-1">
        {promedio > 0 ? `${promedio} (${total} reseñas)` : 'Sin reseñas'}
      </span>
    </div>
  );
}