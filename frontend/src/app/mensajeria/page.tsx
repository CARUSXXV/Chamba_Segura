'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMyChats, Chat } from '@/api/chats';
import { fetchChatHistory, Mensaje } from '@/api/mensajes';
import { io, Socket } from 'socket.io-client';

// Ajusta este puerto al puerto donde corre tu NestJS
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function ChatsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Estados
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);

  // Referencias para el WebSocket y para scrollear automáticamente al último mensaje
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Proteger ruta y cargar la lista lateral de chats
  useEffect(() => {
    if (authLoading) return;
    if (!session || !user) {
      router.push('/auth/login');
      return;
    }

    const loadChats = async () => {
      try {
        const data = await fetchMyChats(session.access_token);
        setChats(data);
      } catch (error) {
        console.error('Error cargando chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
  }, [authLoading, session, user, router]);

  // 2. Conexión principal del WebSocket
  useEffect(() => {
    if (!user) return;

    // Conectamos al servidor de NestJS
    socketRef.current = io(SOCKET_URL);

    // Escuchamos los mensajes nuevos que el servidor nos rebote
    socketRef.current.on('newMessage', (nuevoMensaje: Mensaje) => {
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    // Limpieza al desmontar (cuando sales de la página)
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // 3. Scroll automático al fondo cuando llega un mensaje nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Función para abrir un chat específico
  const handleSelectChat = async (chat: Chat) => {
    if (!session) return;
    setActiveChat(chat);
    setMensajes([]); // Limpiamos la pantalla mientras carga

    try {
      // Pedimos el historial viejo por HTTP
      const history = await fetchChatHistory(session.access_token, chat.id);
      setMensajes(history);

      // Le decimos al WebSocket: "¡Oye, méteme en la sala de este chat!"
      socketRef.current?.emit('joinChat', chat.id);
    } catch (error) {
      console.error('Error al abrir chat:', error);
    }
  };

  // Función para enviar el mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensaje.trim() || !activeChat || !user) return;

    const payload = {
      chat_id: activeChat.id,
      emisor_id: user.id,
      contenido: inputMensaje.trim(),
    };

    // Emitimos el mensaje al servidor por WebSocket (sin HTTP)
    socketRef.current?.emit('sendMessage', payload);
    setInputMensaje('');
  };

  // Helper para saber el nombre de la otra persona
  const getOtherParticipantName = (chat: Chat) => {
    return chat.cliente_id === user?.id 
      ? chat.trabajador.nombre_completo 
      : chat.cliente.nombre_completo;
  };

  if (authLoading || loadingChats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors w-fit">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        {/* Contenedor principal estilo tarjeta doble */}
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[75vh]">
          
          {/* Panel Izquierdo: Lista de Chats */}
          <div className="w-1/3 min-w-[250px] border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center mt-4">No tienes conversaciones activas.</p>
              ) : (
                chats.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => handleSelectChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      activeChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-100 border-l-4 border-l-transparent'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 truncate">
                      {getOtherParticipantName(chat)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Negociación de trabajo</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel Derecho: Ventana de Chat */}
          <div className="flex-1 flex flex-col bg-white relative">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">Selecciona un chat para comenzar</p>
              </div>
            ) : (
              <>
                {/* Cabecera del chat activo */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm z-10">
                  <h3 className="text-lg font-bold text-gray-900">{getOtherParticipantName(activeChat)}</h3>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                  {mensajes.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 my-auto">
                      Aún no hay mensajes. ¡Escribe el primero!
                    </div>
                  ) : (
                    mensajes.map((msg, idx) => {
                      const soyYo = msg.emisor_id === user?.id;
                      return (
                        <div key={msg.id || idx} className={`flex flex-col max-w-[75%] ${soyYo ? 'self-end items-end' : 'self-start items-start'}`}>
                          <div className={`px-4 py-2 rounded-2xl ${
                            soyYo ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                          }`}>
                            <p className="text-sm">{msg.contenido}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Div invisible para el auto-scroll */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input para escribir */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all"
                      placeholder="Escribe tu mensaje aquí..."
                      value={inputMensaje}
                      onChange={(e) => setInputMensaje(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!inputMensaje.trim()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>Enviar</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}