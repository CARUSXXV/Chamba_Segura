const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const STATIC_API_KEY = 'YOUR_API_KEY';

export interface PaymentData {
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

export interface PaymentResponse {
  id: string;
  status: 'APPROVED' | 'REJECTED' | 'ERROR' | 'INSUFFICIENT' | 'INVALID_CARD';
  error_code?: string;
  amount: number;
  currency: string;
  last_four: string;
  card_brand: string;
  created_at: string;
}

export async function createPayment(data: PaymentData): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STATIC_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
}

export async function getPayment(id: string): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${STATIC_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo consultar el pago');
  }

  return response.json();
}

export async function holdPaymentInEscrow(contratacionId: string, transactionId: string) {
  const response = await fetch(`${API_URL}/payments/escrow/hold`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STATIC_API_KEY}`,
    },
    body: JSON.stringify({
      contratacion_id: contratacionId,
      transaction_id: transactionId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al retener el pago');
  }

  return response.json();
}
