'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMyChats, Chat } from '@/api/chats';
import { fetchChatHistory, Mensaje } from '@/api/mensajes';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function ChatsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<Chat | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const moveChatToTop = useCallback((chatId: string) => {
    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === chatId);
      if (idx <= 0) return prev;
      const chat = prev[idx];
      const updated = [...prev];
      updated.splice(idx, 1);
      updated.unshift(chat);
      return updated;
    });
  }, []);

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

  useEffect(() => {
    if (!user || !session) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: session.access_token },
    });

    socketRef.current.on('connect', () => {
      setTimeout(() => {
        if (activeChatRef.current?.id) {
          socketRef.current?.emit('joinChat', activeChatRef.current.id);
        }
      }, 300);
    });

    socketRef.current.on('newMessage', (nuevoMensaje: Mensaje) => {
      if (activeChatRef.current?.id === nuevoMensaje.chat_id) {
        if (nuevoMensaje.emisor_id !== user?.id) {
          setMensajes((prev) => [...prev, nuevoMensaje]);
        }
      }
      moveChatToTop(nuevoMensaje.chat_id);
    });

    socketRef.current.on('messageSent', (savedMessage: Mensaje) => {
      if (activeChatRef.current?.id === savedMessage.chat_id) {
        setMensajes((prev) => [...prev, savedMessage]);
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Error de conexión WebSocket:', err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, session, moveChatToTop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleSelectChat = async (chat: Chat | null) => {
    if (!session) return;
    setActiveChat(chat);
    setMensajes([]);
    if (!chat) return;

    try {
      const history = await fetchChatHistory(session.access_token, chat.id);
      setMensajes(history);
      socketRef.current?.emit('joinChat', chat.id);
    } catch (error) {
      console.error('Error al abrir chat:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensaje.trim() || !activeChat || !user) return;

    const payload = {
      chat_id: activeChat.id,
      emisor_id: user.id,
      contenido: inputMensaje.trim(),
    };

    socketRef.current?.emit('sendMessage', payload);
    setInputMensaje('');
  };

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
  <div className="h-dvh bg-gray-50 p-3 sm:p-6 lg:p-8 flex flex-col antialiased overflow-hidden">
    <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col min-h-0">
      
      {/* Botón Volver */}
      <Link 
        href="/" 
        className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 mb-4 transition-colors w-fit group shrink-0"
      >
        <svg 
          className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </Link>

      {/* Contenedor Principal del Chat */}
      <div className="bg-white flex-1 rounded-2xl shadow-md border border-gray-200/80 overflow-hidden flex min-h-0">
        
        {/* Columna Izquierda: Lista de Chats */}
        <div className={`w-full md:w-1/3 min-w-[280px] md:max-w-[360px] border-r border-gray-200 flex flex-col bg-gray-50/70 min-h-0 ${
          activeChat ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mensajes</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
            {chats.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center mt-4 bg-white rounded-xl border border-dashed border-gray-200 mx-2">
                No tienes conversaciones activas.
              </p>
            ) : (
              chats.map((chat) => {
                const isSelected = activeChat?.id === chat.id;
                const participantName = getOtherParticipantName(chat);
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {/* Avatar ficticio basado en la inicial */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {participantName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Información del Chat */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {participantName}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        Negociación de trabajo
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Ventana de Chat */}
        <div className={`flex-1 flex flex-col bg-white relative min-h-0 ${
          !activeChat ? 'hidden md:flex' : 'flex'
        }`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 bg-gray-50/30">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-600">Selecciona una conversación</p>
              <p className="text-xs text-gray-400 text-center mt-1 max-w-xs">
                Elige un chat de la lista de la izquierda para ver el historial de mensajes.
              </p>
            </div>
          ) : (
            <>
              {/* Encabezado del Chat */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm z-10 sticky top-0">
                {/* Botón para volver a la lista en móviles */}
                <button 
                  onClick={() => handleSelectChat(null)} 
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Volver a la lista de mensajes"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div>
                  <h3 className="text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                    {getOtherParticipantName(activeChat)}
                  </h3>
                </div>
              </div>

              {/* Contenedor de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/60 flex flex-col gap-3.5 min-h-0">
                {mensajes.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 my-auto bg-white p-6 rounded-xl border border-gray-200/60 max-w-xs mx-auto shadow-sm">
                    Aún no hay mensajes. ¡Escribe el primero para iniciar la conversación!
                  </div>
                ) : (
                  mensajes.map((msg) => {
                    const soyYo = msg.emisor_id === user?.id;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                          soyYo ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div className={`py-2.5 px-4 rounded-2xl shadow-sm break-words w-full ${
                          soyYo 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.contenido}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulario de Envío */}
              <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm text-gray-900 transition-all placeholder:text-gray-400"
                    placeholder="Escribe tu mensaje aquí..."
                    value={inputMensaje}
                    onChange={(e) => setInputMensaje(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!inputMensaje.trim()}
                    className="bg-blue-600 text-white p-3 sm:px-5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 shadow-sm"
                  >
                    <span className="hidden sm:inline text-sm">Enviar</span>
                    <svg className="w-4 h-4 transform rotate-45 -translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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