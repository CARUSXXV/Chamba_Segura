import { Test, TestingModule } from '@nestjs/testing';
import { MensajesService } from './mensajes.service';
import { SupabaseService } from '../supabase/supabase.service';
import { InternalServerErrorException } from '@nestjs/common';

type ResolvedValue = { data: any; error: any } | undefined;

function createQueryBuilder(resolvedDefault?: ResolvedValue) {
  const _default = resolvedDefault ?? { data: null, error: null };

  const thenFn = jest.fn((resolve: (v: any) => any) => resolve(_default));
  const catchFn = jest.fn();

  const builder: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    then: thenFn,
    catch: catchFn,
  };

  return builder;
}

function makeBuilderResolve(builder: any, value: { data: any; error: any }) {
  builder.then = jest.fn((resolve: (v: any) => any) => resolve(value));
}

describe('MensajesService', () => {
  let service: MensajesService;
  let builder: any;

  const mockSupabaseClient = {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  };

  beforeEach(async () => {
    builder = createQueryBuilder();
    mockSupabaseClient.from.mockReturnValue(builder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensajesService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<MensajesService>(MensajesService);
    jest.clearAllMocks();
    builder = createQueryBuilder();
    mockSupabaseClient.from.mockReturnValue(builder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessagesByChat', () => {
    it('should return messages ordered by enviado_el ascending', async () => {
      const fakeMessages = [
        {
          id: '1',
          chat_id: 'chat-1',
          contenido: 'Hola',
          enviado_el: '2024-01-01',
        },
        {
          id: '2',
          chat_id: 'chat-1',
          contenido: 'Mundo',
          enviado_el: '2024-01-02',
        },
      ];
      builder.order.mockResolvedValue({ data: fakeMessages, error: null });

      const result = await service.getMessagesByChat('chat-1');

      expect(result).toEqual(fakeMessages);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mensajes');
      expect(builder.select).toHaveBeenCalledWith(
        '*, emisor:perfiles!mensajes_emisor_id_fkey(nombre_completo, username)',
      );
      expect(builder.eq).toHaveBeenCalledWith('chat_id', 'chat-1');
      expect(builder.order).toHaveBeenCalledWith('enviado_el', {
        ascending: true,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      builder.order.mockResolvedValue({
        data: null,
        error: new Error('DB error'),
      });

      await expect(service.getMessagesByChat('chat-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('saveMessage', () => {
    const payload = {
      chat_id: 'chat-1',
      emisor_id: 'user-1',
      contenido: 'Test message',
    };

    it('should save and return the message with emisor relation', async () => {
      const savedMessage = {
        id: expect.any(String),
        ...payload,
        enviado_el: expect.any(String),
        emisor: { nombre_completo: 'Test User', username: 'testuser' },
      };
      builder.single.mockResolvedValue({ data: savedMessage, error: null });

      const result = await service.saveMessage(payload);

      expect(result).toEqual(savedMessage);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mensajes');
      expect(builder.insert).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      builder.single.mockResolvedValue({
        data: null,
        error: new Error('Insert failed'),
      });

      await expect(service.saveMessage(payload)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('editMessage', () => {
    it('should update only if emisor_id matches', async () => {
      const updatedMessage = {
        id: 'msg-1',
        chat_id: 'chat-1',
        emisor_id: 'user-1',
        contenido: 'edited content',
        emisor: { nombre_completo: 'Test User', username: 'testuser' },
      };
      builder.single.mockResolvedValue({ data: updatedMessage, error: null });

      const result = await service.editMessage(
        'msg-1',
        'user-1',
        'edited content',
      );

      expect(result).toEqual(updatedMessage);
      expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1');
      expect(builder.eq).toHaveBeenCalledWith('emisor_id', 'user-1');
    });

    it('should throw when emisor does not own the message', async () => {
      builder.single.mockResolvedValue({
        data: null,
        error: new Error('No rows match'),
      });

      await expect(
        service.editMessage('msg-1', 'wrong-user', 'new content'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteMessage', () => {
    it('should delete and return the id', async () => {
      makeBuilderResolve(builder, { data: null, error: null });

      const result = await service.deleteMessage('msg-1', 'user-1');

      expect(result).toEqual({ id: 'msg-1' });
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1');
      expect(builder.eq).toHaveBeenCalledWith('emisor_id', 'user-1');
    });

    it('should throw on delete error', async () => {
      makeBuilderResolve(builder, {
        data: null,
        error: new Error('Delete failed'),
      });

      await expect(service.deleteMessage('msg-1', 'user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('isUserChatParticipant', () => {
    it('should return true when user is cliente_id', async () => {
      builder.maybeSingle.mockResolvedValue({
        data: { id: 'chat-1' },
        error: null,
      });

      const result = await service.isUserChatParticipant('user-1', 'chat-1');

      expect(result).toBe(true);
      expect(builder.eq).toHaveBeenCalledWith('id', 'chat-1');
      expect(builder.or).toHaveBeenCalledWith(
        'cliente_id.eq.user-1,trabajador_id.eq.user-1',
      );
    });

    it('should return false when user is not a participant', async () => {
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await service.isUserChatParticipant('user-2', 'chat-1');

      expect(result).toBe(false);
    });

    it('should throw on database error', async () => {
      builder.maybeSingle.mockResolvedValue({
        data: null,
        error: new Error('DB error'),
      });

      await expect(
        service.isUserChatParticipant('user-1', 'chat-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
