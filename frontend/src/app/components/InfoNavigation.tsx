"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function InfoNavigation() {
  const { user, signOut } = useAuth();
  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link href="/">
          <img src="/images/logo-azul.png" alt="ChambaSegura" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm font-bold text-gray-900">
                {user.user_metadata.username || "Usuario"}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Entrar</Link>
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
