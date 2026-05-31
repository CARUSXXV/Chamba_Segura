import Link from "next/link";

export default function PricingSection() {
  return (
    <section id="precios" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Precios Transparentes
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Sin cargos ocultos ni sorpresas de última hora. Solo pagas por lo que realmente necesitas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Tarjeta Clientes */}
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Para Clientes</h3>
              <div className="text-4xl font-black text-blue-600 mb-6">Gratis</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Acceso a todos los técnicos calificados</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Sistema de pago Escrow protegido</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Resolución e intermediación de disputas</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-400 font-medium pt-2 border-t border-gray-50">
                  Sólo pagas el costo neto del servicio técnico acordado
                </li>
              </ul>
            </div>
            <Link href="/auth/register" className="block text-center bg-gray-900 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base">
              Empezar como Cliente
            </Link>
          </div>
          {/* Tarjeta Técnicos */}
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border-2 border-blue-600 shadow-xl relative flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-0 right-1/2 md:right-10 transform translate-x-1/2 md:translate-x-0 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Recomendado</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Para Técnicos</h3>
              <div className="text-4xl font-black text-blue-600 mb-6">10% <span className="text-sm text-gray-400 font-normal tracking-normal">de comisión</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Portafolio e historial profesional digital</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Visibilidad destacada en toda tu localidad</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>Gestión de cobros automatizada y segura</span>
                </li>
                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-600 font-semibold pt-2 border-t border-gray-50">
                  Solo pagas la comisión si concretas un trabajo
                </li>
              </ul>
            </div>
            <Link href="/auth/register" className="block text-center bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base shadow-md shadow-blue-600/10">
              Empezar como Técnico
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
