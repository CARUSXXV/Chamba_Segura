'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [esTrabajador, setEsTrabajador] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          nombre_completo: nombreCompleto,
          es_trabajador: esTrabajador,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-xl border border-gray-100 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">¡Registro exitoso!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Por favor revisa tu correo para confirmar tu cuenta.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              href="/auth/login" 
              className="inline-flex w-full justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Completa tus datos para empezar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm animate-fade-in" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombreCompleto">
              Nombre Completo
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
              id="nombreCompleto"
              type="text"
              placeholder="Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Nombre de Usuario
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
              id="username"
              type="text"
              placeholder="juanperez123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center pt-1">
            <label className="relative flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={esTrabajador}
                onChange={(e) => setEsTrabajador(e.target.checked)}
                disabled={isLoading}
              />
              <div className="w-5 h-5 bg-white border border-gray-300 rounded transition-all peer-checked:bg-blue-600 peer-checked:border-transparent peer-focus:ring-2 peer-focus:ring-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-2.5 text-sm font-medium text-gray-700">
                Registrarme como Trabajador
              </span>
            </label>
          </div>

          <div className="pt-3">
            <button
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}