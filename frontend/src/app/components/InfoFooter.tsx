import Link from "next/link";

export default function InfoFooter() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-6">
            <div className="flex items-center gap-2.5 mb-5">
              <Link href="/">
                <img src="/images/logo-azul.png" alt="ChambaSegura" className="h-10 w-auto" />
              </Link>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">La plataforma líder en intermediación y seguridad de servicios técnicos residenciales en Venezuela. Confianza, garantía y calidad garantizada.</p>
          </div>
          <div className="md:col-span-3">
            <h6 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-5">Información</h6>
            <ul className="space-y-3.5 text-sm font-medium text-gray-500">
              <li><Link href="/terminos" className="hover:text-blue-600 transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-blue-600 transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/ayuda" className="hover:text-blue-600 transition-colors">Centro de Ayuda</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h6 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-5">Soporte</h6>
            <ul className="space-y-3.5 text-sm font-medium text-gray-500">
              <li><Link href="/ayuda" className="hover:text-blue-600 transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/privacidad" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-blue-600 transition-colors">Términos Legales</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 text-gray-400 text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} ChambaSegura. Todos los derechos reservados.</p>
          <div className="flex gap-6 font-medium">
            <Link href="/terminos" className="hover:text-gray-600 transition-colors">Términos de Servicio</Link>
            <Link href="/privacidad" className="hover:text-gray-600 transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
