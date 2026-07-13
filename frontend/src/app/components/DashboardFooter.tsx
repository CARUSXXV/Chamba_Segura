import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo y Copyright básico */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo-azul.png" 
              alt="ChambaSegura" 
              className="h-7 w-auto object-contain" 
            />
            <span className="text-xs text-gray-400 font-normal">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Enlaces de Navegación y Derechos */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 text-xs font-medium text-gray-400">
            <Link 
              href="/terminos" 
              className="hover:text-blue-600 active:text-blue-800 transition-colors py-1 px-2 -mx-2 rounded hover:bg-gray-50"
            >
              Términos
            </Link>
            <Link 
              href="/privacidad" 
              className="hover:text-blue-600 active:text-blue-800 transition-colors py-1 px-2 -mx-2 rounded hover:bg-gray-50"
            >
              Privacidad
            </Link>
            <Link 
              href="/ayuda" 
              className="hover:text-blue-600 active:text-blue-800 transition-colors py-1 px-2 -mx-2 rounded hover:bg-gray-50"
            >
              Ayuda
            </Link>
            
            {/* Divisor visual oculto en pantallas muy pequeñas si se rompe la línea */}
            <span className="hidden sm:inline text-gray-300 select-none" aria-hidden="true">|</span>
            
            <span className="text-gray-400 font-normal text-center sm:text-left w-full sm:w-auto mt-1 sm:mt-0">
              Todos los derechos reservados
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}