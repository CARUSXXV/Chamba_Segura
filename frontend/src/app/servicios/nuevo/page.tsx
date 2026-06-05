"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createServicio, ServicioPayload } from "@/api/servicios";
import Link from "next/link";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/servicios"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">
              Publicar Servicio
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Ofrece tu servicio para que clientes te contraten.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Oficio *
              </label>
              <select
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.oficio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, oficio: e.target.value }))
                }
              >
                <option value="">Selecciona tu oficio</option>
                {OFICIOS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Especialidad (Opcional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: Tuberías, Cableado residencial..."
                value={formData.tipo_de_oficio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo_de_oficio: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción del servicio *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Describe qué servicios ofreces, tu experiencia, etc..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tarifa Promedio ($) *
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: 50"
                value={formData.tarifa_promedio || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tarifa_promedio: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="firma_contrato"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.firma_contrato}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firma_contrato: e.target.checked,
                  }))
                }
              />
              <label
                htmlFor="firma_contrato"
                className="text-sm font-medium text-gray-700"
              >
                Requiere firma de contrato digital
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Publicando...
                  </>
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
