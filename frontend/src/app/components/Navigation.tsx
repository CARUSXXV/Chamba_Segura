"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navigation() {
  const { user, signOut } = useAuth();
  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🛡️</span>
          <span className="text-2xl font-black text-blue-600 tracking-tighter">
            ChambaSegura
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="text-sm font-medium hover:text-blue-600 transition-colors">Servicios</a>
          <a href="#como-funciona" className="text-sm font-medium hover:text-blue-600 transition-colors">Cómo Funciona</a>
          <a href="#precios" className="text-sm font-medium hover:text-blue-600 transition-colors">Precios</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm font-semibold text-gray-600">
                Hola, {user.user_metadata.username || "Usuario"}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-bold hover:text-blue-600 transition-colors">Entrar</Link>
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
