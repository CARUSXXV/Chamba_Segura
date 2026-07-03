import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService, PaymentRequest, PaymentStatus } from './payments.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UnauthorizedException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockSupabaseClient: any;

  const basePayment: PaymentRequest = {
    amount: 50,
    currency: 'USD',
    'card-number': '4111111111111111',
    cvv: '123',
    'expiration-month': '12',
    'expiration-year': '28',
    'full-name': 'Juan Perez',
  };

  const mockInsertResult = (overrides = {}) => ({
    data: {
      id: 'txn-123',
      amount: 50,
      currency: 'USD',
      status: 'APPROVED',
      error_code: null,
      description: null,
      reference: null,
      last_four: '1111',
      card_brand: 'Visa',
      full_name: 'Juan Perez',
      created_at: new Date().toISOString(),
      ...overrides,
    },
    error: null,
  });

  beforeEach(async () => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue(mockSupabaseClient),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('validateApiKey', () => {
    it('should pass with correct Bearer token', () => {
      expect(() => service.validateApiKey('Bearer YOUR_API_KEY')).not.toThrow();
    });

    it('should throw UnauthorizedException with wrong token', () => {
      expect(() => service.validateApiKey('Bearer WRONG_KEY')).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with missing header', () => {
      expect(() => service.validateApiKey(undefined as any)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with malformed header', () => {
      expect(() => service.validateApiKey('YOUR_API_KEY')).toThrow(UnauthorizedException);
    });
  });

  describe('processPayment - Deterministic Logic', () => {
    function mockSuccess(result: any) {
      mockSupabaseClient.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce(result),
        }),
      });
    }

    it('should APPROVE when card starts with 411111111111', async () => {
      mockSuccess(mockInsertResult({ status: 'APPROVED', card_brand: 'Visa' }));
      const result = await service.processPayment(basePayment);
      expect(result.status).toBe(PaymentStatus.APPROVED);
    });

    it('should APPROVE when full-name contains APPROVED', async () => {
      mockSuccess(mockInsertResult({ status: 'APPROVED', card_brand: 'Visa' }));
      const result = await service.processPayment({
        ...basePayment,
        'card-number': '4000000000000000',
        'full-name': 'TEST APPROVED USER',
      });
      expect(result.status).toBe(PaymentStatus.APPROVED);
    });

    it('should REJECT with error 002 when card starts with 555555555555', async () => {
      mockSuccess(mockInsertResult({ status: 'REJECTED', error_code: '002', card_brand: 'Mastercard' }));
      try {
        await service.processPayment({ ...basePayment, 'card-number': '5555555555554444' });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
        expect(e.getResponse().error_code).toBe('002');
        expect(e.getResponse().status).toBe(PaymentStatus.REJECTED);
      }
    });

    it('should REJECT with error 002 when full-name contains REJECTED', async () => {
      mockSuccess(mockInsertResult({ status: 'REJECTED', error_code: '002' }));
      try {
        await service.processPayment({
          ...basePayment,
          'card-number': '4000000000000000',
          'full-name': 'USER REJECTED CARD',
        });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
        expect(e.getResponse().error_code).toBe('002');
        expect(e.getResponse().status).toBe(PaymentStatus.REJECTED);
      }
    });

    it('should return INSUFFICIENT with error 004 when card starts with 6011', async () => {
      mockSuccess(mockInsertResult({ status: 'INSUFFICIENT', error_code: '004', card_brand: 'Discover' }));
      try {
        await service.processPayment({ ...basePayment, 'card-number': '6011000000000000' });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
        expect(e.getResponse().error_code).toBe('004');
        expect(e.getResponse().status).toBe(PaymentStatus.INSUFFICIENT);
      }
    });

    it('should return INSUFFICIENT with error 004 when full-name contains INSUFFICIENT', async () => {
      mockSuccess(mockInsertResult({ status: 'INSUFFICIENT', error_code: '004' }));
      try {
        await service.processPayment({
          ...basePayment,
          'card-number': '4000000000000000',
          'full-name': 'INSUFFICIENT FUNDS USER',
        });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
        expect(e.getResponse().error_code).toBe('004');
        expect(e.getResponse().status).toBe(PaymentStatus.INSUFFICIENT);
      }
    });

    it('should return ERROR with error 003 when card starts with 3782', async () => {
      mockSuccess(mockInsertResult({ status: 'ERROR', error_code: '003', card_brand: 'Amex' }));
      try {
        await service.processPayment({ ...basePayment, 'card-number': '378200000000000' });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(e.getResponse().error_code).toBe('003');
        expect(e.getResponse().status).toBe(PaymentStatus.ERROR);
      }
    });

    it('should return ERROR with error 003 when full-name contains ERROR', async () => {
      mockSuccess(mockInsertResult({ status: 'ERROR', error_code: '003' }));
      try {
        await service.processPayment({
          ...basePayment,
          'card-number': '4000000000000000',
          'full-name': 'SYSTEM ERROR CONTACT',
        });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(e.getResponse().error_code).toBe('003');
        expect(e.getResponse().status).toBe(PaymentStatus.ERROR);
      }
    });

    it('should return INVALID_CARD with error 001 for unknown card pattern', async () => {
      mockSuccess(mockInsertResult({ status: 'INVALID_CARD', error_code: '001' }));
      try {
        await service.processPayment({ ...basePayment, 'card-number': '1234567890123456' });
      } catch (e: any) {
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(e.getResponse().error_code).toBe('001');
        expect(e.getResponse().status).toBe(PaymentStatus.INVALID_CARD);
      }
    });

    it('should simulate artificial latency between 1000-2000ms', async () => {
      mockSuccess(mockInsertResult({ status: 'APPROVED' }));
      const start = Date.now();
      await service.processPayment(basePayment);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(elapsed).toBeLessThanOrEqual(3000);
    });

    it('should throw HttpException when database insert fails', async () => {
      mockSupabaseClient.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Connection failed' } }),
        }),
      });
      await expect(service.processPayment(basePayment)).rejects.toThrow(HttpException);
    });
  });

  describe('processPayment - Brand Detection', () => {
    function mockForBrand(cardBrand: string) {
      mockSupabaseClient.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce(
            mockInsertResult({ card_brand: cardBrand })
          ),
        }),
      });
    }

    async function getBrandForCard(cardNumber: string, expectedBrand: string): Promise<void> {
      mockForBrand(expectedBrand);
      try {
        const result = await service.processPayment({ ...basePayment, 'card-number': cardNumber });
        expect(result.card_brand).toBe(expectedBrand);
      } catch (e: any) {
        expect(e.getResponse().card_brand).toBe(expectedBrand);
      }
    }

    it('should detect Visa for cards starting with 4', async () => {
      await getBrandForCard('4111111111111111', 'Visa');
    });

    it('should detect Mastercard for cards starting with 5', async () => {
      await getBrandForCard('5555555555554444', 'Mastercard');
    });

    it('should detect Amex for cards starting with 3', async () => {
      await getBrandForCard('378200000000000', 'Amex');
    });

    it('should detect Discover for cards starting with 6', async () => {
      await getBrandForCard('6011000000000000', 'Discover');
    });

    it('should return Unknown for unrecognized cards', async () => {
      await getBrandForCard('1234567890123456', 'Unknown');
    });
  });

  describe('getTransaction', () => {
    it('should return transaction data when found', async () => {
      const mockData = {
        id: 'txn-123',
        amount: 50,
        currency: 'USD',
        status: 'APPROVED',
        error_code: null,
        last_four: '1111',
        card_brand: 'Visa',
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.single.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await service.getTransaction('txn-123');
      expect(result).toEqual(mockData);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('fake_transactions');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'txn-123');
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      await expect(service.getTransaction('nonexistent')).rejects.toThrow(HttpException);
    });
  });

  describe('Escrow - holdPayment', () => {
    function mockUpdateSuccess(overrides = {}) {
      mockSupabaseClient.update.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: { id: 'txn-1', status: 'HELD', contrataciones_id: 'c-1', ...overrides },
              error: null,
            }),
          }),
        }),
      });
    }

    it('should hold a valid payment', async () => {
      mockUpdateSuccess();
      const result = await service.holdPayment('c-1', 'txn-1');
      expect(result.message).toBe('Payment held in escrow');
    });

    it('should throw when update fails', async () => {
      mockSupabaseClient.update.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });
      await expect(service.holdPayment('c-1', 'txn-1')).rejects.toThrow(HttpException);
    });
  });

  describe('Escrow - releasePayment', () => {
    function mockExistingPayment(status: string) {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: 'txn-1', status, contrataciones_id: 'c-1' }, error: null });
    }

    function mockUpdateSuccess() {
      mockSupabaseClient.update.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: { id: 'txn-1', status: 'RELEASED', contrataciones_id: 'c-1' },
              error: null,
            }),
          }),
        }),
      });
    }

    it('should release a HELD payment', async () => {
      mockExistingPayment('HELD');
      mockUpdateSuccess();
      const result = await service.releasePayment('c-1');
      expect(result.message).toBe('Payment released to worker');
    });

    it('should throw if payment is not HELD', async () => {
      mockExistingPayment('APPROVED');
      await expect(service.releasePayment('c-1')).rejects.toThrow(HttpException);
    });

    it('should throw if no payment found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      await expect(service.releasePayment('c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Escrow - refundPayment', () => {
    function mockExistingPayment(status: string) {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: 'txn-1', status, contrataciones_id: 'c-1' }, error: null });
    }

    function mockUpdateSuccess() {
      mockSupabaseClient.update.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: { id: 'txn-1', status: 'REFUNDED', contrataciones_id: 'c-1' },
              error: null,
            }),
          }),
        }),
      });
    }

    it('should refund a HELD payment', async () => {
      mockExistingPayment('HELD');
      mockUpdateSuccess();
      const result = await service.refundPayment('c-1');
      expect(result.message).toBe('Payment refunded to client');
    });

    it('should refund an APPROVED payment', async () => {
      mockExistingPayment('APPROVED');
      mockUpdateSuccess();
      const result = await service.refundPayment('c-1');
      expect(result.message).toBe('Payment refunded to client');
    });

    it('should throw if payment is RELEASED', async () => {
      mockExistingPayment('RELEASED');
      await expect(service.refundPayment('c-1')).rejects.toThrow(HttpException);
    });

    it('should throw if no payment found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      await expect(service.refundPayment('c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Escrow - findByContratacion', () => {
    it('should return transaction for contratacion', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'txn-1', status: 'HELD', contrataciones_id: 'c-1' },
        error: null,
      });
      const result = await service.findByContratacion('c-1');
      expect(result.contrataciones_id).toBe('c-1');
    });

    it('should throw if not found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      await expect(service.findByContratacion('c-1')).rejects.toThrow(NotFoundException);
    });
  });
});
