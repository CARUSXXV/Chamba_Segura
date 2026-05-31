export default function FeaturesSection() {
  return (
    <section id="servicios" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Diseñado meticulosamente para garantizar tu tranquilidad,
            seguridad y la máxima calidad en cada servicio.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Característica 1 */}
          <div className="group bg-white p-8 sm:p-10 rounded-4xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-colors group-hover:bg-blue-600 group-hover:text-white duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Escrow (Pago Seguro)</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Tu dinero está 100% a salvo. El monto se retiene de forma preventiva y solo se libera cuando confirmes que el trabajo fue terminado con éxito.</p>
            </div>
          </div>
          {/* Característica 2 */}
          <div className="group bg-white p-8 sm:p-10 rounded-4xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-colors group-hover:bg-blue-600 group-hover:text-white duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Técnicos Verificados</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Cero improvisaciones. Cada profesional en la plataforma pasa por un riguroso filtro de antecedentes e identidad para cuidar tu hogar.</p>
            </div>
          </div>
          {/* Característica 3 */}
          <div className="group bg-white p-8 sm:p-10 rounded-4xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-colors group-hover:bg-blue-600 group-hover:text-white duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Tarifas Transparentes</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relazed">Sin cobros sorpresa ni especulaciones de último minuto. Precios base estandarizados para que conozcas los costos reales desde el primer clic.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
