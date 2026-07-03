import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export enum PaymentStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
  INSUFFICIENT = 'INSUFFICIENT',
  INVALID_CARD = 'INVALID_CARD',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  'card-number': string;
  cvv: string;
  'expiration-month': string | number;
  'expiration-year': string | number;
  'full-name': string;
  description?: string;
  reference?: string;
  contratacion_id?: string;
}

@Injectable()
export class PaymentsService {
  private readonly STATIC_API_KEY = 'YOUR_API_KEY'; // As requested in requirements

  constructor(private readonly supabaseService: SupabaseService) {}

  validateApiKey(token: string) {
    if (token !== `Bearer ${this.STATIC_API_KEY}`) {
      throw new UnauthorizedException('Invalid API Key');
    }
  }

  async processPayment(paymentData: PaymentRequest) {
    // 1. Latency Artificial (1-2 seconds)
    const delay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 2. Deterministic Logic
    let status: PaymentStatus;
    let errorCode: string | null = null;
    let httpStatus: number = HttpStatus.OK;

    const cardNumber = paymentData['card-number'].replace(/[\s-]/g, '');
    const fullName = paymentData['full-name'].toUpperCase();

    if (cardNumber.startsWith('411111111111') || fullName.includes('APPROVED')) {
      status = PaymentStatus.APPROVED;
    } else if (
      cardNumber.startsWith('555555555555') ||
      fullName.includes('REJECTED')
    ) {
      status = PaymentStatus.REJECTED;
      errorCode = '002';
      httpStatus = HttpStatus.PAYMENT_REQUIRED;
    } else if (
      cardNumber.startsWith('6011') ||
      fullName.includes('INSUFFICIENT')
    ) {
      status = PaymentStatus.INSUFFICIENT;
      errorCode = '004';
      httpStatus = HttpStatus.PAYMENT_REQUIRED;
    } else if (cardNumber.startsWith('3782') || fullName.includes('ERROR')) {
      status = PaymentStatus.ERROR;
      errorCode = '003';
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      status = PaymentStatus.INVALID_CARD;
      errorCode = '001';
      httpStatus = HttpStatus.BAD_REQUEST;
    }

    // 3. Brand detection
    const cardBrand = this.detectBrand(cardNumber);

    // 4. In escrow flow: if approved and contratacion_id is provided, status is HELD
    let dbStatus: PaymentStatus = status;
    if (status === PaymentStatus.APPROVED && paymentData.contratacion_id) {
      dbStatus = PaymentStatus.HELD;
    }

    const supabase: any = this.supabaseService.getClient();

    // 5. Persistence
    const { data, error } = await supabase
      .from('fake_transactions')
      .insert({
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: dbStatus,
        error_code: errorCode,
        description: paymentData.description,
        reference: paymentData.reference,
        last_four: cardNumber.slice(-4),
        card_brand: cardBrand,
        full_name: paymentData['full-name'],
        contrataciones_id: paymentData.contratacion_id || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error saving transaction:', error);
      throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 6. Update contratacion status to en_progreso
    if (dbStatus === PaymentStatus.HELD && paymentData.contratacion_id) {
      const { error: contractError } = await supabase
        .from('contrataciones')
        .update({ estado_contrato: 'en_progreso' })
        .eq('id', paymentData.contratacion_id);

      if (contractError) {
        console.error('Error updating contract status to en_progreso:', contractError);
      }
    }

    const result: any = data;
    const response = {
      id: result.id,
      status: status, // Return APPROVED to frontend compatibility if status is approved/held
      error_code: errorCode,
      amount: result.amount,
      currency: result.currency,
      last_four: result.last_four,
      card_brand: result.card_brand,
      created_at: result.created_at,
    };

    if (httpStatus !== HttpStatus.OK) {
      throw new HttpException(response, httpStatus);
    }

    return response;
  }

  async getTransaction(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('fake_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Transaction not found');
    }

    return data;
  }

  async findByContratacion(contratacionId: string) {
    const { data, error } = await (this.supabaseService
      .getClient()
      .from('fake_transactions')
      .select('*')
      .eq('contrataciones_id', contratacionId)
      .single() as any);

    if (error || !data) {
      throw new NotFoundException('No transaction found for this contratación');
    }

    return data;
  }

  async holdPayment(contratacionId: string, transactionId: string) {
    const delay = Math.floor(Math.random() * 500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const supabase: any = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('fake_transactions')
      .update({
        status: PaymentStatus.HELD,
        contrataciones_id: contratacionId,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error holding payment:', error);
      throw new HttpException('Error holding payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await supabase
      .from('contrataciones')
      .update({ estado_contrato: 'en_progreso' })
      .eq('id', contratacionId);

    return { message: 'Payment held in escrow', transaction: data };
  }

  async releasePayment(contratacionId: string) {
    const delay = Math.floor(Math.random() * 500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const supabase: any = this.supabaseService.getClient();
    const existing: any = await supabase
      .from('fake_transactions')
      .select('*')
      .eq('contrataciones_id', contratacionId)
      .single();

    if (!existing?.data) throw new NotFoundException('No held payment found');
    if (existing.data.status !== PaymentStatus.HELD) {
      throw new HttpException(
        `Cannot release: payment is in status "${existing.data.status}"`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { data, error } = await supabase
      .from('fake_transactions')
      .update({ status: PaymentStatus.RELEASED })
      .eq('contrataciones_id', contratacionId)
      .select()
      .single();

    if (error) {
      console.error('Error releasing payment:', error);
      throw new HttpException('Error releasing payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Payment released to worker', transaction: data };
  }

  async refundPayment(contratacionId: string) {
    const delay = Math.floor(Math.random() * 500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const supabase: any = this.supabaseService.getClient();
    const existing: any = await supabase
      .from('fake_transactions')
      .select('*')
      .eq('contrataciones_id', contratacionId)
      .single();

    if (!existing?.data) throw new NotFoundException('No held payment found');
    if (existing.data.status !== PaymentStatus.HELD && existing.data.status !== PaymentStatus.APPROVED) {
      throw new HttpException(
        `Cannot refund: payment is in status "${existing.data.status}"`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { data, error } = await supabase
      .from('fake_transactions')
      .update({ status: PaymentStatus.REFUNDED })
      .eq('contrataciones_id', contratacionId)
      .select()
      .single();

    if (error) {
      console.error('Error refunding payment:', error);
      throw new HttpException('Error refunding payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Payment refunded to client', transaction: data };
  }

  private detectBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    if (cardNumber.startsWith('3')) return 'Amex';
    if (cardNumber.startsWith('6')) return 'Discover';
    return 'Unknown';
  }
}
