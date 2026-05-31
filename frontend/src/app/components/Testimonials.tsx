export default function Testimonials() {
  return (
    <section className="py-24 bg-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-blue-700/20 to-transparent pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="text-white lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">Lo que dicen nuestros clientes</h2>
            <p className="text-lg text-blue-100 mb-10 leading-relaxed">Miles de hogares ebanistas, electricistas y plomeros ya confían plenamente en nosotros para gestionar sus servicios residenciales.</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-400 border-2 border-blue-600 flex items-center justify-center font-bold text-xs">M</div>
                <div className="h-10 w-10 rounded-full bg-blue-300 border-2 border-blue-600 flex items-center justify-center font-bold text-xs">C</div>
                <div className="h-10 w-10 rounded-full bg-blue-200 border-2 border-blue-600 flex items-center justify-center font-bold text-xs">J</div>
              </div>
              <span className="font-semibold text-blue-50 text-sm sm:text-base">⭐ 4.9/5 de calificación promedio nacional</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:col-span-7">
            {/* Testimonio 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-700/10 transition-transform duration-300 hover:scale-[1.01]">
              <p className="text-base sm:text-lg text-gray-700 italic mb-6 leading-relaxed">Por fin encontré un electricista puntual y que cobró lo justo. La seguridad de pagar a través de la aplicación me dio una tranquilidad inmensa.</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">MR</div>
                <div>
                  <h5 className="font-bold text-sm sm:text-base text-gray-900">María Rodríguez</h5>
                  <p className="text-xs text-gray-500">Valencia, Venezuela</p>
                </div>
              </div>
            </div>
            {/* Testimonio 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-700/10 md:transform md:translate-x-4 transition-transform duration-300 hover:scale-[1.01]">
              <p className="text-base sm:text-lg text-gray-700 italic mb-6 leading-relaxed">Excelente plataforma. El técnico de refrigeración que contraté demostró ser un profesional verificado y muy capacitado. Altamente recomendado.</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">CM</div>
                <div>
                  <h5 className="font-bold text-sm sm:text-base text-gray-900">Carlos Mendoza</h5>
                  <p className="text-xs text-gray-500">Caracas, Venezuela</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
