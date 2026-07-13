"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPayment, holdPaymentInEscrow, PaymentData } from "@/api/payments";
import { fetchContratacion } from "@/api/contrataciones";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function PagoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contratacionId = searchParams.get('contratacion_id');
  const { session, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingContract, setFetchingContract] = useState(true);
  const [contratacion, setContratacion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 0.0,
    currency: "USD",
    "card-number": "",
    cvv: "",
    "expiration-month": "",
    "expiration-year": "",
    "full-name": "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push("/auth/login");
        return;
      }
      if (contratacionId) {
        setFetchingContract(true);
        fetchContratacion(session.access_token, contratacionId)
          .then((data) => {
            setContratacion(data);
            setFormData((prev) => ({
              ...prev,
              amount: data.precio_final,
            }));
            setFetchingContract(false);
          })
          .catch((err) => {
            console.error(err);
            setError("No se pudieron cargar los detalles de la contratación.");
            setFetchingContract(false);
          });
      } else {
        setFetchingContract(false);
      }
    }
  }, [authLoading, session, contratacionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createPayment({
        ...formData,
        contratacion_id: contratacionId || undefined,
      } as PaymentData);
      if (response.status === "APPROVED") {
        if (contratacionId) {
          await holdPaymentInEscrow(contratacionId, response.id);
        }
        router.push(`/dashboard/contrataciones?pago=exitoso`);
      }
    } catch (err: any) {
      if (err.status === "ERROR") {
        setError("Hubo un problema técnico con el sistema de pagos. Por favor, intente más tarde.");
      } else {
        setError(`Pago fallido: ${err.status || 'Error desconocido'}. ${err.error_code ? `Código: ${err.error_code}` : ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
          <Link href="/">
            <img src="/images/logo-azul.png" alt="ChambaSegura" className="h-8 w-auto" />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-airbnb border border-gray-100 shadow-airbnb w-full max-w-md p-8">
          {fetchingContract ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
              <p className="text-gray-500 text-sm">Cargando detalles del servicio...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizar Pago</h1>
              
              {contratacion && (
                <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30 text-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-600 mb-1">Servicio a Garantizar</p>
                  <p className="font-bold text-gray-900">{contratacion.trabajo?.title || contratacion.servicio?.oficio || "Servicio Personalizado"}</p>
                  <p className="text-xs text-gray-500 mt-1">Trabajador: <span className="font-semibold text-gray-700">{contratacion.servicio?.trabajador?.nombre_completo || "Asignado"}</span></p>
                </div>
              )}

              <p className="text-gray-500 text-sm mb-8">Complete los detalles de su tarjeta para procesar el pago de ${formData.amount} {formData.currency}. El dinero se retendrá en garantía.</p>

              {error && (
                <div className={`mb-6 p-4 rounded-xl text-sm border ${error.includes('problema técnico') || error.includes('cargar') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <div className="flex gap-2">
                    <span>{error.includes('problema técnico') || error.includes('cargar') ? '❌' : '⚠️'}</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Titular de la tarjeta</label>
              <input
                required
                type="text"
                name="full-name"
                placeholder="Ej. Juan Perez"
                value={formData["full-name"]}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Número de tarjeta</label>
              <input
                required
                type="text"
                name="card-number"
                placeholder="4111 1111 1111 1111"
                value={formData["card-number"]}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Mes (MM)</label>
                <input
                  required
                  type="text"
                  name="expiration-month"
                  placeholder="01"
                  maxLength={2}
                  value={formData["expiration-month"]}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400 text-center text-gray-900"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Año (YY)</label>
                <input
                  required
                  type="text"
                  name="expiration-year"
                  placeholder="25"
                  maxLength={2}
                  value={formData["expiration-year"]}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400 text-center text-gray-900"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">CVV</label>
                <input
                  required
                  type="text"
                  name="cvv"
                  placeholder="123"
                  maxLength={4}
                  value={formData["cvv"]}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400 text-center text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Pago</span>
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-[10px] text-gray-400 text-center uppercase tracking-widest font-black">
            🔒 Pago seguro procesado por Fake Payment API
          </p>
          </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <PagoForm />
    </Suspense>
  );
}
