export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            ¿Cómo funciona ChambaSegura?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tres simples e intuitivos pasos diseñados para solucionar cualquier problema técnico de tu hogar de forma efectiva.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative lg:px-8">
          <div className="hidden md:block absolute top-6.5 left-[15%] right-[15%] h-0.5 bg-linear-to-r from-blue-100 via-blue-200 to-blue-100 z-0" />
          {/* Paso 1 */}
          <div className="text-center relative z-10 group flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110">1</div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">Busca y Contrata</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs px-2">Explora perfiles calificados, lee opiniones reales de otros usuarios y selecciona al técnico ideal para ti.</p>
          </div>
          {/* Paso 2 */}
          <div className="text-center relative z-10 group flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110">2</div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">Pago Protegido</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs px-2">Realizas el depósito del presupuesto dentro del sistema. Nosotros retenemos el dinero protegiendo ambas partes.</p>
          </div>
          {/* Paso 3 */}
          <div className="text-center relative z-10 group flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110">3</div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">Libera y Califica</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs px-2">Una vez ejecutado y verificado el trabajo, liberas los fondos al trabajador y calificas tu experiencia en la plataforma.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
