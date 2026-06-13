import { Test, TestingModule } from '@nestjs/testing';
import { MensajesGateway } from './mensajes.gateway';
import { MensajesService } from './mensajes.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Server, Socket } from 'socket.io';

describe('MensajesGateway', () => {
  let gateway: MensajesGateway;
  let mensajesService: jest.Mocked<MensajesService>;
  let supabaseService: jest.Mocked<SupabaseService>;

  const mockAuthGetUser = jest.fn();

  const mockSupabaseClient = {
    auth: { getUser: mockAuthGetUser },
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  };

  const mockMensajesService = {
    saveMessage: jest.fn(),
    editMessage: jest.fn(),
    deleteMessage: jest.fn(),
    isUserChatParticipant: jest.fn(),
  };

  let mockClient: jest.Mocked<Socket> & { userId?: string };
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensajesGateway,
        { provide: MensajesService, useValue: mockMensajesService },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    gateway = module.get<MensajesGateway>(MensajesGateway);
    mensajesService = module.get(MensajesService);
    supabaseService = module.get(SupabaseService);

    mockClient = {
      handshake: { auth: {} },
      emit: jest.fn(),
      join: jest.fn(),
      disconnect: jest.fn(),
      userId: undefined,
    } as unknown as jest.Mocked<Socket> & { userId?: string };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    gateway.server = mockServer;
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should disconnect if no token provided', async () => {
      mockClient.handshake.auth = {};

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Token de autenticación requerido',
      });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should disconnect if token is invalid', async () => {
      mockClient.handshake.auth = { token: 'bad-token' };
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Token inválido o expirado',
      });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should set userId when token is valid', async () => {
      mockClient.handshake.auth = { token: 'valid-token' };
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.userId).toBe('user-123');
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinChat', () => {
    it('should emit error if not authenticated', async () => {
      mockClient.userId = undefined;

      await gateway.handleJoinChat(mockClient, 'chat-1');

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No autenticado',
      });
    });

    it('should emit error if user is not a participant', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockResolvedValue(false);

      await gateway.handleJoinChat(mockClient, 'chat-1');

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No tienes acceso a este chat',
      });
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('should join the room when user is a participant', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockResolvedValue(true);

      await gateway.handleJoinChat(mockClient, 'chat-1');

      expect(mockClient.join).toHaveBeenCalledWith('chat-1');
    });

    it('should emit error on service exception', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockRejectedValue(
        new Error('DB error'),
      );

      await gateway.handleJoinChat(mockClient, 'chat-1');

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Error al unirse al chat',
      });
    });
  });

  describe('handleSendMessage', () => {
    const payload = {
      chat_id: 'chat-1',
      emisor_id: 'user-1',
      contenido: 'Hello',
    };

    it('should emit error if not authenticated', async () => {
      mockClient.userId = undefined;

      await gateway.handleSendMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No autenticado',
      });
    });

    it('should emit error if emisor_id does not match authenticated user', async () => {
      mockClient.userId = 'user-2';

      await gateway.handleSendMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No puedes enviar mensajes como otro usuario',
      });
    });

    it('should emit error if user is not a chat participant', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockResolvedValue(false);

      await gateway.handleSendMessage(mockClient, payload);

      expect(mockMensajesService.saveMessage).not.toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No tienes acceso a este chat',
      });
    });

    it('should save message and broadcast to room', async () => {
      const savedMsg = { id: 'msg-1', ...payload, enviado_el: '2024-01-01' };
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockResolvedValue(true);
      mockMensajesService.saveMessage.mockResolvedValue(savedMsg);

      await gateway.handleSendMessage(mockClient, payload);

      expect(mockMensajesService.saveMessage).toHaveBeenCalledWith(payload);
      expect(mockServer.to).toHaveBeenCalledWith('chat-1');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', savedMsg);
      expect(mockClient.emit).toHaveBeenCalledWith('messageSent', savedMsg);
    });

    it('should emit error on save failure', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.isUserChatParticipant.mockResolvedValue(true);
      mockMensajesService.saveMessage.mockRejectedValue(new Error('DB error'));

      await gateway.handleSendMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No se pudo guardar el mensaje en la base de datos',
      });
    });
  });

  describe('handleEditMessage', () => {
    const payload = {
      id: 'msg-1',
      chat_id: 'chat-1',
      emisor_id: 'user-1',
      contenido: 'edited',
    };

    it('should emit error if not authenticated', async () => {
      mockClient.userId = undefined;

      await gateway.handleEditMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No autenticado',
      });
    });

    it('should emit error if emisor_id does not match', async () => {
      mockClient.userId = 'user-2';

      await gateway.handleEditMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No puedes editar mensajes de otro usuario',
      });
    });

    it('should edit and broadcast to room', async () => {
      const updatedMsg = { ...payload, enviado_el: '2024-01-01' };
      mockClient.userId = 'user-1';
      mockMensajesService.editMessage.mockResolvedValue(updatedMsg);

      await gateway.handleEditMessage(mockClient, payload);

      expect(mockMensajesService.editMessage).toHaveBeenCalledWith(
        'msg-1',
        'user-1',
        'edited',
      );
      expect(mockServer.to).toHaveBeenCalledWith('chat-1');
      expect(mockServer.emit).toHaveBeenCalledWith('messageEdited', updatedMsg);
    });
  });

  describe('handleDeleteMessage', () => {
    const payload = { id: 'msg-1', chat_id: 'chat-1', emisor_id: 'user-1' };

    it('should emit error if not authenticated', async () => {
      mockClient.userId = undefined;

      await gateway.handleDeleteMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No autenticado',
      });
    });

    it('should emit error if emisor_id does not match', async () => {
      mockClient.userId = 'user-2';

      await gateway.handleDeleteMessage(mockClient, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'No puedes eliminar mensajes de otro usuario',
      });
    });

    it('should delete and broadcast deletion event', async () => {
      mockClient.userId = 'user-1';
      mockMensajesService.deleteMessage.mockResolvedValue({ id: 'msg-1' });

      await gateway.handleDeleteMessage(mockClient, payload);

      expect(mockMensajesService.deleteMessage).toHaveBeenCalledWith(
        'msg-1',
        'user-1',
      );
      expect(mockServer.to).toHaveBeenCalledWith('chat-1');
      expect(mockServer.emit).toHaveBeenCalledWith('messageDeleted', {
        id: 'msg-1',
      });
    });
  });
});
