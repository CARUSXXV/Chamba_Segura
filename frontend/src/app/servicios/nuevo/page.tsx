"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createServicio, ServicioPayload } from "@/api/servicios";
import Link from "next/link";
import { useGeolocation } from "@/utils/useGeolocation";

const OFICIOS = [
  "Plomería",
  "Electricidad",
  "Carpintería",
  "Limpieza",
  "Pintura",
  "Mecánica",
  "Jardinería",
  "Reparaciones",
  "Mudanzas",
  "Otros",
];

export default function NuevoServicioPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { location, error: geoError } = useGeolocation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    oficio: "",
    tipo_de_oficio: "",
    descripcion: "",
    tarifa_promedio: 0,
    firma_contrato: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const payload: ServicioPayload = {
        trabajador_id: user.id,
        oficio: formData.oficio,
        tipo_de_oficio: formData.tipo_de_oficio || undefined,
        descripcion: formData.descripcion,
        tarifa_promedio: formData.tarifa_promedio,
        firma_contrato: formData.firma_contrato || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      const newServicio = await createServicio(session.access_token, payload);
      router.push(`/servicios/${newServicio.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el servicio",
      );
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 backdrop-blur-xs">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Enlace de Regreso */}
        <Link
          href="/servicios"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 mb-8 transition-colors group cursor-pointer"
        >
          <svg
            className="w-4 h-4 mr-2 transform transition-transform group-hover:-translate-x-0.5 stroke-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a servicios
        </Link>

        {/* Contenedor del Formulario */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
          
          {/* Encabezado de la Tarjeta */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Publicar Servicio
            </h1>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Completa los detalles de tu oficio para que los clientes cercanos puedan encontrarte y contratarte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Estados de Alerta Estilizados */}
            {error && (
              <div className="bg-red-50/70 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2.5">
                <span className="text-base select-none mt-0.5">⚠️</span>
                <div>
                  <span className="font-bold">Error al guardar:</span> {error}
                </div>
              </div>
            )}

            {geoError && (
              <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-2.5">
                <span className="text-base select-none mt-0.5">📍</span>
                <div>
                  <span className="font-bold">Aviso de ubicación:</span> {geoError}. Tu servicio se publicará con alcance general sin una posición exacta en el mapa.
                </div>
              </div>
            )}

            {location && (
              <div className="bg-emerald-50/60 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex justify-between items-center gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-base select-none mt-0.5">✨</span>
                  <span>
                    <span className="font-bold">Ubicación detectada:</span> Las coordenadas GPS se adjuntarán automáticamente para priorizarte con clientes locales.
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-emerald-600 shrink-0 stroke-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {/* Selector de Oficios Personalizado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Oficio Obligatorio *
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                  value={formData.oficio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, oficio: e.target.value }))
                  }
                >
                  <option value="" className="text-gray-400">Selecciona tu oficio principal</option>
                  {OFICIOS.map((o) => (
                    <option key={o} value={o} className="text-gray-900">
                      {o}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Input de Especialidad */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Especialidad o Tipo (Opcional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder:text-gray-400"
                placeholder="Ej: Tuberías de alta presión, Cableado residencial, Motores..."
                value={formData.tipo_de_oficio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo_de_oficio: e.target.value,
                  }))
                }
              />
            </div>

            {/* Textarea de Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Descripción detallada del servicio *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder:text-gray-400 resize-none leading-relaxed"
                placeholder="Describe a detalle las labores que realizas, tu nivel de experiencia, herramientas disponibles y condiciones de trabajo..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
              />
            </div>

            {/* Input de Tarifa */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Tarifa Base Promedio ($) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 font-semibold text-sm pointer-events-none select-none">
                  $
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  value={formData.tarifa_promedio || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tarifa_promedio: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Toggle / Checkbox Personalizado de Contrato */}
            <div className="flex items-start gap-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl select-none">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  id="firma_contrato"
                  className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                  checked={formData.firma_contrato}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firma_contrato: e.target.checked,
                    }))
                  }
                />
              </div>
              <label
                htmlFor="firma_contrato"
                className="text-sm font-semibold text-gray-700 cursor-pointer flex-1 leading-tight"
              >
                Exigir firma de contrato digital formal
                <span className="block text-xs text-gray-400 font-normal mt-1 leading-normal">
                  Los clientes deberán confirmar los términos preestablecidos en la orden antes de iniciar las labores físicas del servicio.
                </span>
              </label>
            </div>

            {/* Botón de Envío */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 shadow-blue-500/10"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publicando servicio...</span>
                  </div>
                ) : (
                  "Publicar Servicio"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}