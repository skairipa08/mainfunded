/**
 * iyzico Payment Integration Library
 * 
 * Handles all iyzico API interactions including:
 * - Checkout form creation
 * - Payment verification (callback)
 * - Refunds
 * - Subscription management
 * 
 * iyzico API docs: https://dev.iyzipay.com/
 */

import crypto from 'crypto';

const IYZICO_API_KEY = process.env.IYZICO_API_KEY || '';
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || '';
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

interface IyzicoCheckoutParams {
  conversationId: string;
  price: string;
  paidPrice: string;
  basketId: string;
  callbackUrl: string;
  buyerName: string;
  buyerEmail: string;
  buyerId: string;
  campaignTitle: string;
  campaignId: string;
  currency?: string;
}

interface IyzicoCheckoutResult {
  status: string;
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
  errorMessage?: string;
}

interface IyzicoPaymentResult {
  status: string;
  paymentId: string;
  conversationId: string;
  price: number;
  paidPrice: number;
  currency: string;
  basketId: string;
  paymentStatus: string;
  fraudStatus: number;
  token: string;
  errorMessage?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  lastFourDigits?: string;
}

interface IyzicoRefundParams {
  paymentTransactionId: string;
  price: string;
  conversationId: string;
  ip?: string;
}

interface IyzicoRefundResult {
  status: string;
  paymentId: string;
  price: number;
  errorMessage?: string;
}

/**
 * Generate iyzico authorization header
 */
function generateAuthorizationHeader(request: string): string {
  const randomString = crypto.randomBytes(8).toString('hex');
  const hashStr = IYZICO_API_KEY + randomString + IYZICO_SECRET_KEY + request;
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');
  return `IYZWS ${IYZICO_API_KEY}:${hash}`;
}

/**
 * Generate iyzico PKI (hash) string from object
 */
function generatePkiString(obj: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const arrayStr = value.map(item => {
        if (typeof item === 'object') {
          return `[${generatePkiString(item)}]`;
        }
        return String(item);
      }).join(', ');
      parts.push(`${key}=[${arrayStr}]`);
    } else if (typeof value === 'object') {
      parts.push(`${key}=[${generatePkiString(value)}]`);
    } else {
      parts.push(`${key}=${value}`);
    }
  }
  return parts.join(',');
}

/**
 * Make a request to iyzico API
 */
async function iyzicoRequest(endpoint: string, body: Record<string, any>): Promise<any> {
  const pkiString = generatePkiString(body);
  const randomString = crypto.randomBytes(8).toString('hex');
  const hashStr = IYZICO_API_KEY + randomString + IYZICO_SECRET_KEY + pkiString;
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');
  const authorizationHeader = `IYZWS ${IYZICO_API_KEY}:${hash}`;

  const response = await fetch(`${IYZICO_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorizationHeader,
      'x-iyzi-rnd': randomString,
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

/**
 * Create iyzico Checkout Form (ödeme sayfası)
 * This creates a hosted payment page (iyzico Checkout Form)
 */
export async function createIyzicoCheckoutForm(params: IyzicoCheckoutParams): Promise<IyzicoCheckoutResult> {
  const {
    conversationId,
    price,
    paidPrice,
    basketId,
    callbackUrl,
    buyerName,
    buyerEmail,
    buyerId,
    campaignTitle,
    campaignId,
    currency = 'TRY',
  } = params;

  const [firstName, ...lastNameParts] = buyerName.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;

  const requestBody = {
    locale: 'tr',
    conversationId,
    price,
    paidPrice,
    currency,
    basketId,
    paymentGroup: 'PRODUCT',
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: buyerId,
      name: firstName || 'Anonymous',
      surname: lastName || 'Donor',
      gsmNumber: '+905000000000',
      email: buyerEmail,
      identityNumber: '00000000000',
      registrationAddress: 'Turkey',
      ip: '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey',
    },
    shippingAddress: {
      contactName: `${firstName} ${lastName}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Turkey',
    },
    billingAddress: {
      contactName: `${firstName} ${lastName}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Turkey',
    },
    basketItems: [
      {
        id: campaignId,
        name: `Bağış: ${campaignTitle}`,
        category1: 'Donation',
        itemType: 'VIRTUAL',
        price: price,
      },
    ],
  };

  try {
    const result = await iyzicoRequest('/payment/iyzipos/checkoutform/initialize/auth/ecom', requestBody);

    if (result.status === 'success') {
      return {
        status: 'success',
        token: result.token,
        checkoutFormContent: result.checkoutFormContent || '',
        paymentPageUrl: result.paymentPageUrl || '',
      };
    }

    return {
      status: 'failure',
      token: '',
      checkoutFormContent: '',
      paymentPageUrl: '',
      errorMessage: result.errorMessage || 'iyzico ödeme formu oluşturulamadı',
    };
  } catch (error: any) {
    return {
      status: 'failure',
      token: '',
      checkoutFormContent: '',
      paymentPageUrl: '',
      errorMessage: error.message || 'iyzico API hatası',
    };
  }
}

/**
 * Retrieve payment result from iyzico callback token
 */
export async function retrieveIyzicoPayment(token: string): Promise<IyzicoPaymentResult> {
  const requestBody = {
    locale: 'tr',
    conversationId: '',
    token,
  };

  try {
    const result = await iyzicoRequest('/payment/iyzipos/checkoutform/auth/ecom/detail', requestBody);

    return {
      status: result.status || 'failure',
      paymentId: result.paymentId || '',
      conversationId: result.conversationId || '',
      price: parseFloat(result.price || '0'),
      paidPrice: parseFloat(result.paidPrice || '0'),
      currency: result.currency || 'TRY',
      basketId: result.basketId || '',
      paymentStatus: result.paymentStatus || '',
      fraudStatus: result.fraudStatus || 0,
      token: result.token || token,
      errorMessage: result.errorMessage,
      cardType: result.cardType,
      cardAssociation: result.cardAssociation,
      cardFamily: result.cardFamily,
      lastFourDigits: result.lastFourDigits,
    };
  } catch (error: any) {
    return {
      status: 'failure',
      paymentId: '',
      conversationId: '',
      price: 0,
      paidPrice: 0,
      currency: 'TRY',
      basketId: '',
      paymentStatus: '',
      fraudStatus: 0,
      token,
      errorMessage: error.message || 'iyzico payment retrieval failed',
    };
  }
}

/**
 * Process iyzico refund
 */
export async function processIyzicoRefund(params: IyzicoRefundParams): Promise<IyzicoRefundResult> {
  const requestBody = {
    locale: 'tr',
    conversationId: params.conversationId,
    paymentTransactionId: params.paymentTransactionId,
    price: params.price,
    currency: 'TRY',
    ip: params.ip || '85.34.78.112',
  };

  try {
    const result = await iyzicoRequest('/payment/refund', requestBody);

    return {
      status: result.status || 'failure',
      paymentId: result.paymentId || '',
      price: parseFloat(result.price || '0'),
      errorMessage: result.errorMessage,
    };
  } catch (error: any) {
    return {
      status: 'failure',
      paymentId: '',
      price: 0,
      errorMessage: error.message || 'iyzico refund failed',
    };
  }
}

/**
 * Cancel iyzico payment (for pending/authorized payments)
 */
export async function cancelIyzicoPayment(paymentId: string, ip?: string): Promise<IyzicoRefundResult> {
  const requestBody = {
    locale: 'tr',
    conversationId: `cancel_${crypto.randomBytes(4).toString('hex')}`,
    paymentId,
    ip: ip || '85.34.78.112',
  };

  try {
    const result = await iyzicoRequest('/payment/cancel', requestBody);

    return {
      status: result.status || 'failure',
      paymentId: result.paymentId || paymentId,
      price: parseFloat(result.price || '0'),
      errorMessage: result.errorMessage,
    };
  } catch (error: any) {
    return {
      status: 'failure',
      paymentId: '',
      price: 0,
      errorMessage: error.message || 'iyzico cancel failed',
    };
  }
}
