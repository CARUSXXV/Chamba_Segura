export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 border border-blue-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">Chamba<span className="text-blue-600">Segura</span></span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">La plataforma líder en intermediación y seguridad de servicios técnicos residenciales en Venezuela. Confianza, garantía y calidad garantizada.</p>
          </div>
          <div className="md:col-span-3">
            <h6 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-5">Plataforma</h6>
            <ul className="space-y-3.5 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Servicios Disponibles</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Cómo Funciona</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Políticas de Seguridad</a></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h6 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-5">Soporte</h6>
            <ul className="space-y-3.5 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Centro de Contacto</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Términos Legales</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 text-gray-400 text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} ChambaSegura. Todos los derechos reservados.</p>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-gray-600 transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
