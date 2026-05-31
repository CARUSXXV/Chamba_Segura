import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="py-12 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              ¿Listo para solucionar tu problema hoy?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Únete hoy mismo a miles de venezolanos que ya gestionan y aseguran todos sus servicios técnicos de manera confiable.
            </p>
            <Link
              href="/auth/register"
              className="inline-block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 rounded-xl text-base sm:text-lg font-bold shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Registrarme ahora
            </Link>
            <p className="mt-6 text-gray-500 text-xs sm:text-sm font-medium">
              Registro rápido y 100% gratuito. Sin cargos ocultos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
