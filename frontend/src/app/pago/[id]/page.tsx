"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPayment, PaymentResponse } from "@/api/payments";
import Link from "next/link";

export default function PagoExitosoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPayment(id as string)
        .then(setPayment)
        .catch(() => router.push("/"))
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!payment) return null;

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
        <div className="bg-white rounded-airbnb border border-gray-100 shadow-airbnb w-full max-w-md overflow-hidden">
          <div className="bg-green-500 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">¡Pago Exitoso!</h1>
            <p className="text-green-100 font-medium mt-1 uppercase text-xs tracking-widest">Transacción {payment.id.split('-')[0]}</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monto Pagado</span>
                <span className="text-2xl font-black text-gray-900">${payment.amount} {payment.currency}</span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</span>
                  <p className="text-sm font-bold text-gray-900">{payment.card_brand} **** {payment.last_four}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha</span>
                  <p className="text-sm font-bold text-gray-900">{new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ID de Referencia</span>
                <p className="text-[10px] font-mono text-gray-500 break-all">{payment.id}</p>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <Link
                href="/dashboard/contrataciones"
                className="block w-full py-4 bg-gray-900 text-white text-center font-bold rounded-2xl hover:bg-black transition-all"
              >
                Ver mis contrataciones
              </Link>
              <Link
                href="/"
                className="block w-full py-4 text-gray-500 text-center text-sm font-bold hover:text-gray-900 transition-all"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
