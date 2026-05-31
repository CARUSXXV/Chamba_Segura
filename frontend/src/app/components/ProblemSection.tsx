export default function ProblemSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Basta de jugar a la lotería con las recomendaciones de WhatsApp
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Conseguir un técnico confiable no debería ser un dolor de cabeza.
            Elimina la incertidumbre, la especulación de precios y los riesgos
            de seguridad.
          </p>
        </div>
        {/* Contenedor de Beneficios / Problemas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problemas tradicionales */}
          <div className="space-y-4 bg-gray-50 p-6 sm:p-8 rounded-4xl border border-gray-100">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> El problema tradicional
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="shrink-0 bg-red-50 p-1.5 rounded-md text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight pt-0.5">Precios inflados y falta absoluta de transparencia.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="shrink-0 bg-red-50 p-1.5 rounded-md text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight pt-0.5">Ingreso de personal desconocido y sin verificar en tu hogar.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="shrink-0 bg-red-50 p-1.5 rounded-md text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight pt-0.5">Trabajos mal ejecutados y sin ningún tipo de garantía.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="shrink-0 bg-red-50 p-1.5 rounded-md text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight pt-0.5">Pérdida de tiempo intentando coordinar disponibilidad.</p>
              </div>
            </div>
          </div>
          {/* La solución con Chamba Segura */}
          <div className="space-y-4 bg-blue-50/40 p-6 sm:p-8 rounded-4xl border border-blue-100/60">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> La solución segura
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-blue-100/30 shadow-sm">
                <div className="shrink-0 bg-blue-50 p-1.5 rounded-md text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight pt-0.5">Presupuestos cerrados y tarifas claras antes de contratar.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-blue-100/30 shadow-sm">
                <div className="shrink-0 bg-blue-50 p-1.5 rounded-md text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight pt-0.5">Profesionales con identidad y antecedentes validados rigurosamente.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-blue-100/30 shadow-sm">
                <div className="shrink-0 bg-blue-50 p-1.5 rounded-md text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight pt-0.5">Protección y respaldo digital en cada servicio realizado.</p>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-blue-100/30 shadow-sm">
                <div className="shrink-0 bg-blue-50 p-1.5 rounded-md text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight pt-0.5">Agendamiento inmediato según tus horarios y necesidades.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
